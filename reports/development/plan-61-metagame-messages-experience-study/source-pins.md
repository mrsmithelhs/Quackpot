# Selected source and evidence pins

Frozen report-local SHA-256 values at preparation:

| File | SHA-256 |
|---|---|
| gallery/app.mjs | b8dc7178d4a5efcfbc73c8571a43a98b3ef1936a134ad5d6aa84b2e3f9b21d2e |
| gallery/state.mjs | 01e8bdfca99f4fa3f367bcadc1419d4b30efa63b7e4c0acd0cf8133ddbd42a88 |
| gallery/index.html | 1443ab500e8fd55a2ced3bfa6912cb1826f0a1c0b3d4f20e3cad1f5927c93f73 |
| gallery/gallery.css | 9b90898ff6733953794ed52fe379f468f1a4fed37fceae36aebe66d4b401b257 |
| gallery/ren-avatar.svg | cecd9141eda00534927ed11e6c6a1705fa167c45d2f43dbee054f7437da30bc4 |
| evidence/read-v1.json | 9df7ff9246cf19186bb6351bda6ec826fa02b4060af0bb3e6504cc3faa426982 |

`read-v1.json` pins the current source above and tests a synthetic offscreen latest message, read on scroll, delivery/switch/dismiss and mock repayment focus. `selected-v2.json` pins the preceding app before the visibility watcher; it is evidence for the prior layout and text-scaling state, not a current-source replay. `comparison-v2.json` predates the read guard, watcher and header ResizeObserver. `diagnosis-v5.json` predates the selected sibling comparison and must not be presented as the selected layout. Earlier failed geometry/keyboard captures remain historical evidence and are not acceptance. Each JSON records its own source hashes.

All sampled browser cleanup results are qualified: no tracked residual and root exit observed, but uncertainty remained and profiles were retained. The initial `capture.mjs` was a failed historical harness with inadequate descendant cleanup proof; do not reuse it as the current capture method. The later capture scripts use the shared isolated-browser helper and record its actual result.
