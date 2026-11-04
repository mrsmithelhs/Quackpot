# Final three: two-call transport proposal, pending orchestration clearance

## Scope and inputs

One fresh Sonnet-medium read-only ideation followed serially by one Sonnet-high drawing continuation of that new session, contingent on medium success and root acceptance of its factual/creative boundaries. No automatic retry, cold-start fallback, third provider, changed prompt, or substitute model. Both stages are fresh, separate task-owned host folders; names are retained privately. Neither folder contains other repository files, student data, credentials, user profiles or game saves. Synthetic images are byte-identical across both stages:

| File | SHA-256 |
| --- | --- |
| recovery.png | 6869056475cff8fab07b0ff5193843affe653791e20d27a9366f6f24a9d36ec7 |
| recovery-small.png | b6670495c815d97e13fc1210c1a2ae4e3ed8e5a88c5f13c128a6f856d2649dcf |
| draft.png | 60b055c4c06a9c61c3e16f6f4354b256db534c98d6998cd3b0bfd1d539bc8197 |
| draft-small.png | e97e18215d671907cf595a5656a2f9482642a91bba78066b443e808315904e78 |
| crowd.png | fa080985a4aefb7a3400b6420b4bfa30576bda65fd0ee69d18cbd9096f8a20fe |
| bounce.png | cb4d9ea9e494b46e22115ea4535720034b9922e764c5cf9c555a00361d1e1073 |

Medium prompt SHA-256 `30a72dd57c710894439c4b18bc8b48d71b8e1990a3d4c5c45032f19f387bc38a`. High prompt SHA-256 `899e9a028da27df9afc8dd26afc88682a7e535bf722973e8f8c2b8dbfda85948`. High stage alone also contains local `render_drafts.py` SHA-256 `2732a9ead6a26a702163c2e4aa9803e7d27cdbc322f378f8ce9841cd5c1ef946` and previously approved synthetic pair image (required by helper) SHA-256 `69fdb1504f7b11e818e21740607769ee5cdb464fe72bdeeeb46636aae9734837`. Verify all exact staged and source bytes, expected directory entries, executable/wrapper pins and actual host available memory >=8 GiB immediately before each. Avoid printing private session IDs or raw receipts.

## Medium ideation

Installed `claude.exe` hash `e896a9d8da519353a49bf69ca4a695ba7e09067752687c675b3969041e632d52`. Proposed exact vector: `@('--print','--safe-mode','--restricted','--strict-mcp-config','--permission-mode','dontAsk','--tools','Read','--no-chrome','--disable-slash-commands','--model','claude-sonnet-5-5','--effort','medium','--output-format','json',$prompt)`. A prior local help check showed these flags and medium effort; the same binary hash remains. Read prompt as one UTF-8 argument. Run unchanged Plan50 bounded-media launcher hash `32fe974f3c7fd9972270511a7cd4467f2aa748ce89cb231dea78cc25246ec543` from medium stage: 90s wall, sampled 2 GiB owned tree, 1 GiB Node heap and 2,097,152 retained characters per stream. Final-only JSON avoids verbose image payload overflow but cannot independently attest individual image reads. Record CLI-reported model, requested/effective effort separately, result/denials, receipt hash and limitation; capture session ID privately for high continuation. No command/write/web/MCP tools or runtime network in the gallery.

## High drawing

Exact vector after private medium session validation: `@('--print','--resume',$privateSessionId,'--safe-mode','--strict-mcp-config','--permission-mode','dontAsk','--tools','Read,Write,Edit,Bash','--allowedTools','Read,Write,Edit,Bash(python render_drafts.py)','--no-chrome','--disable-slash-commands','--model','claude-sonnet-5-5','--effort','high','--output-format','stream-json','--verbose',$prompt)`. The host sets high-stage working directory. The only permitted shell command is literally `python render_drafts.py`, no `cd` or chaining. Previous call used `cd ... &&` and its renderer failed; do not repeat as if clean. High helper output uses 8 explicitly mapped static concept slots, one helper render and one sheet read, with independent SVG validation and root sheet inspection before any use. One render is not a demonstrated self-revision or continuous animation.

Use unchanged task-local `bounded-sonnet-900.ps1` hash `b1f7a5d1234362b8cb571c169f279e78753982946102eb0b6b10b9c19cc0f631`: 900s wall, 2 GiB sampled tree, 1 GiB Node heap and 2,097,152 characters per stream. A smaller one-sheet output may still truncate; never silently increase cap, retry or substitute. Record requested vs observed settings, actual commands, image-bearing reads, output integrity and cleanup. Paths and tool restrictions are instructed/cooperative, not complete OS sandbox guarantees. Stop and preserve private receipts on mismatch, unexpected commands/tools, failure, denial, authentication, truncation or unsupported resume. No cost cap is implied. Do not let the model alter the repository, owner browser or saved state. Gallery implementation and separate executable capture remain subject to root review after outputs.
