"""Proposed local-model entry; executable launch disabled pending root review."""
import argparse
import local_network_guard

ROOT_CLEARED = False  # One-time M1 run complete; further inference requires clearance.
ENABLED_KIND = None  # Set to exactly one excerpt only after its coordinated clearance.

def run_reviewed(root, input_path, output, kind):
    # Install before importing runner or ML. Native/OS activity is not covered.
    guard = local_network_guard.Guard().install()
    import runner_wiring
    return runner_wiring.execute(root, input_path, output, kind, guard.check)


def main():
    if not ROOT_CLEARED: raise RuntimeError('Inference entry disabled pending orchestration review and first-run clearance.')
    parser=argparse.ArgumentParser()
    parser.add_argument('root'); parser.add_argument('input'); parser.add_argument('output'); parser.add_argument('kind', choices=('m1-excerpt','known-score','m3-excerpt','m5-excerpt'))
    args=parser.parse_args()
    if args.kind != ENABLED_KIND: raise RuntimeError('This excerpt is not cleared.')
    run_reviewed(args.root,args.input,args.output,args.kind)


if __name__ == '__main__':
    main()
