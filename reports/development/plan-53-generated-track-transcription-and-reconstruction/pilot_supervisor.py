"""Proposed pilot supervisor. Inference entry remains disabled pending root clearance."""
import argparse
import json
from pathlib import Path
import sys
import bootstrap_supervisor as supervisor
import inference_monitor as monitor

def run(root_arg, input_arg, kind, nvidia_arg):
    root=Path(root_arg).resolve(strict=True)
    python=(root/'venv'/'Scripts'/'python.exe').resolve(strict=True)
    log=(root/'pilot-supervision'/kind).resolve(strict=True)
    output=(root/'pilot-runs'/kind).resolve(strict=True)
    if kind not in ('m1-excerpt','known-score') or any(log.iterdir()) or any(output.iterdir()):
        raise ValueError('unexpected or nonempty pilot directories')
    if root not in log.parents or root not in output.parents: raise ValueError('pilot directory outside workspace')
    executable=Path(nvidia_arg).resolve(strict=True)
    guard=monitor.JobResourceGuard(lambda: monitor.sample_live(root, supervisor.tree_bytes, executable))
    entry=Path(__file__).with_name('inference_entry.py').resolve(strict=True)
    return supervisor.run([str(python),'-B',str(entry),str(root),str(Path(input_arg).resolve(strict=True)),str(output),kind],
                          root,900,8*monitor.GIB,20*monitor.GIB,30*monitor.GIB,
                          max_active=2,resource_guard=guard,log_dir=log)

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('root'); parser.add_argument('input'); parser.add_argument('kind'); parser.add_argument('nvidia_smi')
    args=parser.parse_args()
    result=run(args.root,args.input,args.kind,args.nvidia_smi)
    print(json.dumps(result))
    sys.exit(0 if result['error'] is None and result['root_exit_code'] == 0 and not result['cleanup'].startswith('UNVERIFIED') else 1)
