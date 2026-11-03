# Plan52/53 shared-index coordination — 2026-11-02

Commit `d570f37` (`Complete isolated transcription package setup`) contains six Plan53 setup/control files plus two Plan52 replay files: `src/core/life-replay.mjs` and `src/core/life-replay.test.mjs`.

Both implementers independently reported the same sequence: Plan52 staged its intended tested replay slice while Plan53 was staging and committing its own explicit paths. Ordinary `git commit` included all staged entries. Plan52's subsequent commit found nothing staged. Explicit `git add` paths did not isolate the shared index. Root inspected the commit's eight-path stat, the two-file replay diff and current index; no content loss was observed. At inspection only Plan52's progress report remained modified, and no paths were staged.

Plan52 confirms those two committed replay changes were intentional and covered by its focused43-test run (reported3.57s, sampled peak188,882,944bytes). This note attributes that reported evidence; root did not rerun those tests here or accept the production integration. Plan53 owns the other six paths and its separate setup evidence. Commit subject and author alone do not establish packet ownership or technical acceptance.

Preserve the commit and all work; do not revert, reset, amend or rewrite shared history to manufacture separate provenance. Each implementer records the mixed commit accurately in its progress report. Neither packet is closed by this incident or by the commit.

Serialize the entire index interval, from staging through commit and post-commit inspection, through a named turn. Before committing, inspect the complete cached path list, not just owned-file status. Stop if unrelated paths are staged; do not unstage another writer's work. Exact-path `git commit --only` may isolate an inspected owned slice where appropriate, but does not replace coordination or authorize committing unreviewed working content. Never delete `index.lock`.
