# Plan59 owner-review selector template

This is a report-local static template only. No snapshot, server, port, lifetime or owner-profile access is authorized by its existence. The root proposal remains `../owner-review-staging-proposal.md`. No fixture is loaded or storage accessed until a person selects a button. The selector only admits an HTTP `127.0.0.1` origin with an explicit port other than 5173, verifies the selected fixture bytes against the pins below, and uses only the review origin's `quackpot_save_v2_development` key. It asks before replacing an existing value and checks again if that value changes while loading. The redirect is to the sibling frozen app's `?race-v2=1` route.

The future, separately approved snapshot assembly must place these three template files under `selector/`, copy the listed fixtures byte-for-byte under `selector/fixtures/`, and place the frozen app build under sibling `app/`. Paths in the selector are local and relative to `selector/index.html`; this template intentionally does not copy fixtures or provide an app build.

| Choice | Template-relative fixture | Existing genuine source, relative to this directory | SHA-256 |
|---|---|---|---|
| Bounce race | `fixtures/schema6-six-race-witness-02.json` | `../schema6-six-race-witness-02.json` | `6991bab5d008d831a8826152b13a3bb7ba970182427b63ab59faa0ddc1f9b8da` |
| Crowd Surge race | `fixtures/presentation-crowd-witness-after.json` | `../presentation-crowd-witness-after.json` | `9dd6e4ccb5d8bdf6f810137429ae2fb67255a33c146df50044ddb012c98c5cd8` |
| Choose an ability | `fixtures/presentation-crowd-witness-banked.json` | `../presentation-crowd-witness-banked.json` | `bf54ef1d8a21de0b4e28ba15772791bae9ec7031ed7960f5f219fd57d5326048` |

The SHA-256 check protects fixture identity; it does not authenticate a person's activity or substitute for the app's normal semantic restore. The app's static snapshot, origin isolation and finite server cleanup remain a later root disposition. The histories are selected demonstrations, not activation-frequency evidence. No browser or server was run to validate this template.
