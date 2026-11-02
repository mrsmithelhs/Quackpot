# Frozen historical reviewer input manifest

Each numbered case uses exactly the prompt in its directory and one local payload named `image.jpg` or `image.png`. Each payload is isolated in its own working directory; none contains answer documents or other reviewer outputs. These IDs encode no verdict. Sources and answer mapping are held outside reviewer context in the lead checkpoint and held-back scoring draft. Both model families reviewed these five frozen single-image inputs in separate sessions; the first Flash case 1 attempt timed out and its owner-authorized retry supplied the review. See the sanitized `raw/` receipts and `cross-model-comparison.md`.

| ID | Filename | SHA-256 | Status |
|---|---|---|---|
| case-1 | image.png | 2fefba84d700df0229b5c6fc11f4047e6a4c0a70a8757a37015ca7130c571ef5 | Reviewed: offline reconstruction, not owner-view screenshot |
| case-2 | image.png | d275877dd43cd7f2839e7ffbee6be1a85b0639d874dd15bf45dfa0f814521f6f | Reviewed |
| case-3 | image.png | 51a24dc42d22c767165e61a0bc6dfc9c926e4deb628304273cd0556a07c69e9b | Reviewed |
| case-4 | image.png | 18e41603385c14252333110fede6565de2bc7278139af6a107a01497d3135441 | Reviewed |
| case-5 | image.png | 4899e59c48413b0561e237690314136dbe58b7395a1b08c8c9d4fedcd660942f | Reviewed |

Captions and visible text inherent in each image were part of its single-image review. The hashes and prompts above remain the frozen historical input record; see the comparison for the staged Flash transport and isolation limitations. No audio was run.
