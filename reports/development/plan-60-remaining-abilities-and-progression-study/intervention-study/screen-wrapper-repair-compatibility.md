# Range-wrapper repair: limited prior-receipt compatibility

Status: prepared for root review; **no continuation has run**. The prior attempt and its pre-Node error are in `screen-wrapper-failure-01.md`. Only the two PowerShell range expressions were corrected from `@($i,$i+16)` to `@($i,($i+16))`; wrappers additionally implement the explicit narrow historical receipt check below. No adapter, intervention, protocol inputs, seed, screen runner, analyzer, output metric or diagnostic parameter was changed. The old manifest bytes are preserved as `screen-owned-original-pins.txt`, SHA-256 `544cb34f39a4b9f35e8a2c1bd07a5c4217621378f511b036e2268013da170ac8`.

| Exact prior range | Completion receipt SHA-256 | Data SHA-256 | Original binding / observations |
|---|---|---|---|
| 000–004 | `e54236228c7d12628dcc64e12970e859b547099c60e0d71bb4579a528448bc20` | `26cefdc875b8cff52cee0d37c7e990d9baf54f46b9ec5b76afdb676dde5a11ab` | Original manifest 544…; indices 0–3, four finished, completion marker. |
| 004–016 | `2ba336155ba0abe96ad97d29ebba03c0e789ed6f08977f6e503f33b61b68ed23` | `1a9ef468e69c4ae437305c8255972fbaf7e59229d4bf89d4a4c17f0c244e34d4` | Original manifest 544…; indices 4–15, twelve finished, completion marker. |

The corrected wrappers accept an old manifest **only for these two exact receipt hashes** and require each receipt's data hash to match the actual data. Every later receipt must carry the current manifest. Both files and original bindings are retained unchanged; a local SHA binding is integrity evidence, not external attestation. No generic old-manifest fallback is permitted.

Before any continuation, PowerShell read-only checks verified all non-wrapper entries of the original screen manifest byte-for-byte unchanged, including screen-runner SHA-256 `ea855f595f1cddc61486bde031c0f12c948921682623758ddde30ded0ead33dd` and analyzer `32db5444692ff4efced03e3686089a31a563b39d12004b1f5437e04dc7e19881`. All 14 Stage0-owned pins and all 15 original transitive-source pins independently matched. A pure PowerShell check of the corrected range expression found exactly 21 two-integer ranges equal to the literal schedule `0/4, 4/16, 16/32, …, 240/256, 256/272, …, 304/320`. This verifies list construction only; it does not launch Node, analyze race outcomes, or authorize the injured phase.

New manifest SHA-256 `e000356ec235c127ad117d4f44010f4a44ab1ee1405fa055323c99eb526e4d70`; corrected run wrapper SHA-256 `d663f055ae8d6388cd2bd5957d751108ee13f182f91f9305923029e009311c4c`; corrected analysis wrapper SHA-256 `74ab22329620960b52a202b4ce54afc354596ce0d852de8c04d3163486e1e254`. The new manifest includes the preserved original manifest. The first potential continuation is 16/32, never 0/4 or 4/16 again. Await root confirmation and a named lane before invoking it.
