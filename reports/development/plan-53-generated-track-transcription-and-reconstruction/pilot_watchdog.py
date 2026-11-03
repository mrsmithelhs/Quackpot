"""Independent wall timeout for the still-disabled proposed pilot."""
import argparse
import json
import sys
import bootstrap_watchdog

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('root'); parser.add_argument('input'); parser.add_argument('kind',choices=('m1-excerpt','known-score','m3-excerpt','m5-excerpt')); parser.add_argument('nvidia_smi')
    args=parser.parse_args()
    result=bootstrap_watchdog.run(900,[args.root,args.input,args.kind,args.nvidia_smi],supervisor_name='pilot_supervisor.py')
    print(json.dumps(result))
    sys.exit(0 if result['status']=='supervisor exited' and result['exit_code']==0 else 1)
