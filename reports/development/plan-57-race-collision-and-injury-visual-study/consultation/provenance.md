# Haiku candidate provenance

One drawing batch was requested from `claude-haiku-5-5` using the reviewed restricted, Read-only Claude CLI configuration and two synthetic reference PNGs. The final JSON's `modelUsage` reported `claude-haiku-5-5`; this is provider-reported identity, not independent attestation. Final-only JSON did not expose image-read tool traces, so delivery of the two images cannot be independently confirmed. No other provider call or revision has run.

The bounded wrapper reported exit 0, 26.76 seconds, peak sampled process-tree private memory 482,283,520 bytes, no resource stop, and no output truncation. The JSON reported success, three turns and no permission denials. Provider-reported list-basis usage was $0.00366509, with 4,931 output tokens including 3,525 thinking tokens; this is not verified billing. The CLI's budget flag is documented for API calls; subscription billing behavior was not established. The wrapper's 90-second and sampled 2 GiB limits are distinct from the unavailable hard turn and output-token ceilings.

Complete private wrapper receipt SHA-256 `1a4f4b747c48877f9e1901882b2c4f6ba1eb82187484791bf7bf4ed8f1c94d5f`; response text SHA-256 `538c46baa84a74b249175a617fa2d41c9af1b1569de7c891ca066bea93470718`. Private receipt and session identifier are not committed. The exact original SVG snippets were extracted without editing:

| Candidate | SHA-256 |
|---|---|
| impact-burst.svg | `9af09a4861916cfed001e46bdd10c9e1d0a6e5e0675c4757d8a99fa884da52c4` |
| paper-splash.svg | `3859624ec2ea43e054af2fae6bc0be2f2b19af438e6ae1ac2e69fb084b345e34` |
| adhesive-bandage.svg | `008179e47152fac72ea0496d383e6b3f534e666b34001a38d6920849ee2f69a1` |
| status-tab-icon.svg | `10cc0ae9a464067c1508e440f38884b1eadaeaa34dc59beef4a5053887931b12` |

Finite XML inspection found the expected SVG namespace and viewBox, only permitted geometric elements, and no event attributes, IDs, external references, scripts, styles, or animation. The namespace URL was initially flagged by an overbroad text rule, then distinguished from external resource references. This check is not a general security certification. Owner selection and production asset adoption have not occurred.
