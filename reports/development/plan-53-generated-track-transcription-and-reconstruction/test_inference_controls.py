"""Injected resource and normalized-rule tests; no GPU, OS policy or ML."""
import unittest
import firewall_review
import inference_monitor as monitor


def sample(**changes):
    value={"host_free_bytes":20*monitor.GIB,"disk_free_bytes":50*monitor.GIB,"workspace_bytes":15*monitor.GIB,"gpu_total_mib":8188,"gpu_used_mib":200}
    value.update(changes); return value


class Controls(unittest.TestCase):
    def test_preflight_and_gpu_stop(self):
        values=iter([sample(),sample(gpu_used_mib=7168)]); calls=[]; times=iter([0.,.1,1.4])
        result=monitor.supervise(lambda:next(values),lambda:calls.append("launch"),lambda _:False,lambda:calls.append("terminate"),now=lambda:next(times))
        self.assertEqual(calls,["launch","terminate"])
        self.assertEqual(result["status"],"stopped"); self.assertIn("7 GiB",result["reason"])
        self.assertAlmostEqual(result["max_gap_seconds"],1.3)
        self.assertIn("must verify",result["cleanup"])

    def test_failure_during_launch_and_preflight(self):
        calls=[]
        def fail(): calls.append("launch"); raise OSError("synthetic")
        result=monitor.supervise(lambda:sample(),fail,lambda _:False,lambda:calls.append("terminate"),now=lambda:0.)
        self.assertEqual(calls,["launch","terminate"]); self.assertEqual(result["status"],"stopped")
        calls.clear()
        result=monitor.supervise(lambda:sample(host_free_bytes=15*monitor.GIB),lambda:calls.append("launch"),lambda _:False,lambda:calls.append("terminate"),now=lambda:0.)
        self.assertEqual(calls,[]); self.assertIn("16 GiB",result["reason"])

    def test_monitor_failure_and_normal_completion(self):
        calls=[]; values=iter([sample(),RuntimeError("synthetic monitor failure")]); times=iter([0.,.1])
        def get():
            item=next(values)
            if isinstance(item,Exception): raise item
            return item
        result=monitor.supervise(get,lambda:None,lambda _:False,lambda:calls.append("terminate"),now=lambda:next(times))
        self.assertEqual(result["status"],"stopped"); self.assertEqual(calls,["terminate"])
        values=iter([sample(),sample(gpu_used_mib=300)]); times=iter([0.,.1,1.4])
        result=monitor.supervise(lambda:next(values),lambda:None,lambda _:True,lambda:None,now=lambda:next(times))
        self.assertEqual(result["status"],"root exited"); self.assertEqual(result["sampled_peak_gpu_mib"],300)
        self.assertIn("must independently verify",result["cleanup"])

    def test_runtime_ram_emergency_stops_owned_job(self):
        values=iter([sample(),sample(host_free_bytes=3*monitor.GIB)]); calls=[]; times=iter([0.,.1,1.4])
        result=monitor.supervise(lambda:next(values),lambda:calls.append("launch"),lambda _:False,lambda:calls.append("terminate"),now=lambda:next(times))
        self.assertEqual(calls,["launch","terminate"])
        self.assertIn("4 GiB",result["reason"])
        self.assertEqual(result["minimum_host_free_bytes"],3*monitor.GIB)

    def test_interrupt_requests_owned_termination_and_propagates(self):
        calls=[]; values=iter([sample(),KeyboardInterrupt()]); times=iter([0.,.1])
        def get():
            item=next(values)
            if isinstance(item,BaseException): raise item
            return item
        with self.assertRaises(KeyboardInterrupt):
            monitor.supervise(get,lambda:calls.append("launch"),lambda _:False,lambda:calls.append("terminate"),now=lambda:next(times))
        self.assertEqual(calls,["launch","terminate"])

    def test_partial_launch_interrupt_survives_cleanup_failure(self):
        for interruption in (KeyboardInterrupt(),SystemExit(7)):
            with self.subTest(interruption=type(interruption).__name__):
                calls=[]
                def launch():
                    calls.append("partial launch"); raise interruption
                def terminate():
                    calls.append("terminate attempted"); raise OSError("synthetic cleanup failure")
                with self.assertRaises(type(interruption)) as caught:
                    monitor.supervise(lambda:sample(),launch,lambda _:False,terminate,now=lambda:0.)
                self.assertIs(caught.exception,interruption)
                self.assertEqual(calls,["partial launch","terminate attempted"])
                self.assertTrue(any("cleanup unverified" in note for note in getattr(interruption,"__notes__",[])))

    def test_rule_snapshot_is_not_isolation_proof(self):
        expected={"qp-venv":r"C:\tool\venv\python.exe","qp-base":r"C:\tool\base\python.exe"}
        def rule(name,path):
            return {"name":name,"program":path,"direction":"Outbound","action":"Block","enabled":True,"profile":"Any","protocol":"Any","remote_address":"Any"}
        observed=[rule(k,v) for k,v in expected.items()]
        result=firewall_review.verify_rules(observed,expected)
        self.assertIn("not proven",result["status"])
        with self.assertRaises(ValueError): firewall_review.verify_rules(observed[:1],expected)
        observed[0]["action"]="Allow"
        with self.assertRaises(ValueError): firewall_review.verify_rules(observed,expected)
        paths=list(expected.values())
        self.assertIn("not excluded",firewall_review.verify_process_images(paths,paths)["status"])
        with self.assertRaises(ValueError): firewall_review.verify_process_images([paths[0],r"C:\unexpected.exe"],paths)
        with self.assertRaises(ValueError): firewall_review.verify_process_images(paths+[paths[0]],paths)


if __name__ == "__main__": unittest.main()
