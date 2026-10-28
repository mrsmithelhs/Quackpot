"""Archives the Plan 10 session's art-producing helper scripts into ../authoring-tools/ with machine paths redacted.
Usage: python archive-authoring-tools.py <SCRATCHPAD_DIR>
Replacements (disclosed in authoring-tools/README.md): the session scratchpad path -> <SCRATCH>, the repo root
path -> <REPO>, and the Windows user profile prefix -> <HOME>. Nothing else is modified. Not runtime code."""
import os, re, sys, json

SCRATCH = sys.argv[1].replace('\\', '/').rstrip('/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'authoring-tools')
FILES = ['gen-guides.mjs', 'build-views.mjs', 'emit-js.mjs', 'emit-sel.mjs', 'seed.mjs', 'final-check.mjs', 'render_svg.py', 'assemble.py', 'grid.py']
os.makedirs(OUT, exist_ok=True)
report = {}
for name in FILES:
    text = open(os.path.join(SCRATCH, name), encoding='utf8').read()
    counts = {}
    for label, pat, rep in [('scratchpad path', re.escape(SCRATCH), '<SCRATCH>'), ('repo path', r'C:/AI/Quackpot', '<REPO>'), ('user profile path', r'C:/Users/[^/\s\'"]+', '<HOME>')]:
        text, n = re.subn(pat, rep, text)
        if n: counts[label] = n
    open(os.path.join(OUT, name), 'w', encoding='utf8', newline='\n').write(text)
    report[name] = counts
print(json.dumps(report, indent=1))
