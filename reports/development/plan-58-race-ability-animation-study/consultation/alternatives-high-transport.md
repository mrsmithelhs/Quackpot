# Sonnet-high A/B transport — proposed for QP Orch approval

User explicitly requested Sonnet-high drawing after the medium creative consultation. Proposed one `claude-sonnet-5-5`/high continuation of the just-completed medium conversation: extract its session ID privately from `plan58-alternatives-medium-private.json`, verify successful result and requested model usage before invocation, then confirm matching init/result in the high stream where observable. Resume may be unavailable from a new working directory; on resume failure stop and report, with no cold-start fallback or retry. Effective effort remains unverified. The literal prompt is `alternatives-high-brief.md` SHA-256 `88214cb37f92e5d3cddb5489187d0881acffefc005438065ac57df864879fad9`.

Host-only fresh isolated task stage (name retained privately) contains only the following actual files, verified by SHA-256. `pair.png` is a synthetic reference required internally by the unchanged renderer, not private data.

| File | SHA-256 |
| --- | --- |
| wide-small.png | 30e73546ac20c52ce766e1a166b4a0ee63a6e6d3d44190bcacd314f2d3342712 |
| ahead-small.png | f000b73fbb81ec2280327d6663dcb22883290d20d9f46a9418df87ac60edd366 |
| draft-small.png | b8dc92779f699b6fa90b72f24b0d1e1ee431dc3bc5d76fca78501f7763eb94c3 |
| wide.png | 30299b6c2d3b9b9167d6acb80dedf572516427f6ccd9330d05fc7cc031684393 |
| ahead.png | 75761b823ce846c07322df86829c5e9b4ec956efa90282b6623821f5768474a2 |
| draft.png | e60d416d92ea7cbd18c22f90f88e12201126d6588ca4ec19ce9ef8f173530049 |
| pair.png | 69fdb1504f7b11e818e21740607769ee5cdb464fe72bdeeeb46636aae9734837 |
| render_drafts.py | 2732a9ead6a26a702163c2e4aa9803e7d27cdbc322f378f8ce9841cd5c1ef946 |
| prompt.md | 88214cb37f92e5d3cddb5489187d0881acffefc005438065ac57df864879fad9 |

Eight fixed output slots: `bounce-0` Wide A, `bounce-1` Wide B, `bounce-2` Ahead A, `bounce-3` Ahead B, `crowd-0` Draft A, `crowd-1` Draft B, `crowd-2` neutral pose, `crowd-3` head-forward pose. Names are legacy renderer slots, not earlier Bounce/crowd directions. Helper validates strict inert SVG, renders 40px, 84px and enlarged stills and archives iterations. Prompt permits exactly one helper invocation/read; lower single-call limit is cooperative, helper cap remains six. No post-render revision is claimed. Prior output overflow is handled by fewer reads and a concise final request, not increased caps; stream may still truncate, which remains a stop.

Proposed vector (same reviewed restricted tool vector as previous drawing, fresh stage): `@('--print','--resume',$privateSessionId,'--safe-mode','--strict-mcp-config','--permission-mode','dontAsk','--tools','Read,Write,Edit,Bash','--allowedTools','Read,Write,Edit,Bash(python render_drafts.py)','--no-chrome','--disable-slash-commands','--model','claude-sonnet-5-5','--effort','high','--output-format','stream-json','--verbose',$prompt)`. Read prompt exactly as UTF-8 single argument. `claude.exe` SHA-256 `e896a9d8da519353a49bf69ca4a695ba7e09067752687c675b3969041e632d52`; unchanged `tools/bounded-sonnet-900.ps1` SHA-256 `b1f7a5d1234362b8cb571c169f279e78753982946102eb0b6b10b9c19cc0f631`: 900-second wall, sampled 2 GiB owned-tree memory, Node heap 1 GiB, 2,097,152 characters retained per stream. No billing cap is implied. Working-directory and tool restrictions are instructed/cooperative; no complete OS isolation claim. No browser/MCP/network/repo access by consultant except the exact helper's local headless renderer. Verify fresh host memory >=8 GiB and all hashes immediately before dispatch. No fallback/retry, secondary provider or automatic cap increase.

Raw receipt and session ID stay private. Inspect final model/result, actual tool uses and image-bearing sheet Read where available, report requested/effective effort separately, independently XML-check/hash and archive safe concept outputs, then have QP Orch inspect actual sheet before gallery use. Model's full-duck drawings are references, not runtime rig replacements. This proposal does not authorize execution.
