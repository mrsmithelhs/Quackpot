# Haiku envelope authoring and same-conversation revision

## Exact initial brief

> Create a simple UI-style icon of a closed envelope with a visible circular wax seal as one complete standalone SVG. Use a 256 by 256 viewBox, transparent background, cream paper, coral seal and dark outline, with a flat-vector style readable at small sizes. No text, logos, raster images, scripts, external links or animation. Return only the SVG markup, without markdown.

A separate fresh isolated conversation used `claude-haiku-5-5`, safe/restricted, strict MCP, disabled slash commands/Chrome, `dontAsk`, `--tools=`, structured output and normal execution approval for session persistence. No `--no-session-persistence` flag was used. Initial init/result session IDs matched the private requested ID; CLI reported the requested model and zero tools, with no tool execution recorded. Exit 0, elapsed 3.147 s, peak sampled 454,021,120 bytes, no capture truncation; full private receipt hash `be8eceeab664c6830aef617a16e19c442e6f77746292424a9d6ce17577816d49`. The unaltered initial `initial.svg` hash is `9b109f685390a193ef4df887d2b6bbe178ff17204a5217b6a0fc6a1f5c930bdd`; static XML checks passed (5 nodes, 256×256 viewBox, no prohibited active/external/raster elements). Sanitized output: `raw/haiku-envelope-initial.json`.

Lead viewed isolated headless Edge render `initial-edge.png`, SHA-256 `a2e8f116ab416f76b61f03c6013b597039c9b534d55472ee12100d32baf5e1d2`: a cream closed envelope, dark outline and coral circular seal. The white canvas is the browser background, not transparency proof. Small-size legibility was requested but not independently tested at a range of target sizes.

## Selected revision and continuity

After inspecting the initial render, the lead sent the following to that same conversation via `--resume <private ID>` without re-pasting the initial SVG or full brief:

> Add a small gold five-point star centered on the seal. Preserve the earlier requirements and the rest of the design. Return only the complete revised SVG markup, without markdown.

The revision init and result IDs matched the first call's private ID; model was reported as requested, zero tools were advertised and no tool step occurred. Exit 0, 5.252 s, peak sampled 466,894,848 bytes, complete streams; full private receipt hash `d0ad9cba9f6d3f699de7239f5bdff35d6fbcb249efc328182794e355282d1e54`. The unaltered `revised.svg` hash is `6da5c9e3c76f5ebfa9dac11c88f16b85ff3dac722133aa94291af599f1ada94f`; static XML checks passed (6 nodes). Byte diff shows the original SVG text retained with one additional gold star polygon. Lead viewed isolated Edge render `revised-edge.png`, SHA-256 `56ee99ed7b9caaaf7318811c745d327659c6a4d2871f9b0a7ca66a220d5b8c4e`: the star is visibly centered on the seal and original elements remain. Sanitized output: `raw/haiku-envelope-revision.json`.

The matching session metadata plus original markup retained without repasting supports this specific resumed-conversation trial. It does not prove a model's independent memory apart from stored context or general design quality. Initial and revision reported list-basis costs $0.00030374 and $0.00098627, not verified billing; effective effort was not independently observed. Verification effort was not timed. Static checks and isolated screenshots do not establish accessibility, production suitability or a browser/device matrix. Both drawings remain report-only, and root/owner review remains separate.

Root inspected both Edge renderings and the revised SVG on 2026-11-01 and agreed the geometry, colors and seal were retained with the gold star added. The 512×512 screenshot is a white browser canvas containing the intrinsic 256×256 SVG at the top left; blank canvas is capture layout, not evidence that the icon is off-center inside its viewBox. This is one simple additive revision, not a complex illustration or general design-quality benchmark.
