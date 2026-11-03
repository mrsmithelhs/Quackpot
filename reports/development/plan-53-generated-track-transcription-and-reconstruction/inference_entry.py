"""Reserved inference entry point, deliberately unavailable pending OS-boundary verification.

An earlier synthetic trial receipt or a caller-provided callback cannot prove
that the live process and every network-capable helper are isolated. No model,
GPU, audio or networking modules are imported by this entry point.
"""


def main():
    raise RuntimeError('Inference is disabled: a reviewed live OS network boundary and explicit orchestration clearance are required.')


if __name__ == '__main__':
    main()
