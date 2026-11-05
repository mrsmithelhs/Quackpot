# Unmounted integer race source promotion map

Corrected pre-extraction map: first generation attempt failed due to PowerShell array grouping and copied no files. Frozen manifest SHA-256 ACC1BD5407E03B1862E9985CC4E2A3DE7E82FA82BD36D0FF382724908A54E25C. Runtime path rewrites, comments and the reference-table accessor do not change numeric semantics.

| Source | Destination | Source SHA-256 | Planned destination SHA-256 |
|---|---|---|---|
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integer-math.mjs` | `src/core/race-v2/integer-math.mjs` | B18EEE49D039F68565BEA7F6CE7815AD736B5CCBD0E17EF4A3689F56B5F76F9E | 844C84E26F045DFF97B8BC88D835FD279165C6613CD6AE027B71883CF96CE291 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/course-probe.mjs` | `src/core/race-v2/course-probe.mjs` | F05FD331BD6F9EF23E251DC5E154A6CBC31443AE0D009AF863CEFD9684489970 | F05FD331BD6F9EF23E251DC5E154A6CBC31443AE0D009AF863CEFD9684489970 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/reference-v1.json` | `src/core/race-v2/reference-v1.json` | 81C4D1BA542C28506EB8932F5FB81441C4E554CCE2DC489139B9EA2891C3D73C | 81C4D1BA542C28506EB8932F5FB81441C4E554CCE2DC489139B9EA2891C3D73C |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/integer-kernel.mjs` | `src/core/race-v2/integer-kernel.mjs` | 436517CFA19C6850B2E0942EEB82CC88A1055EB3EAB26B8A11511D9D859107BA | 7B5011B4C75FA9CA958C6B68BA6DCA6CAE5286F1D04A60F2AEE6BC9426ABD81C |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/course.mjs` | `src/core/race-v2/course.mjs` | E1A37F085CC18940D02AB663C9396DEF6658E7CEFCEA79DEFD1570B67412B01A | 8328B903B850161242038FBBAFF64DF8FF8AEE1586134023BC40EA09CF1F83BC |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/contact.mjs` | `src/core/race-v2/contact.mjs` | 74AF8B4C8754CE07A0ECEEF205D70CDD33046EC89DDA8AA635DDE4F7F385522E | 49D11BCF20C69807AA46D4CF8E3E151BFDA3BAF78F975D89251034B5187632FC |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/abilities.mjs` | `src/core/race-v2/abilities.mjs` | 67778BB7F65A5076C0B7E6A00C6E46550FCC8ADF3EB4897D7E9438D832B6E410 | E8A8D3BA3FC6D9B925359ED4EC09D88BC9E51508C2AF79DB417EBCF547191681 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/codec.mjs` | `src/core/race-v2/codec.mjs` | 83D2296B54292F73E856B2BCBA45BE7AD704A2070419FB8434E69F88DA074B41 | 0C7DFF15A0D9B7E946A7BE51A277ADC4D9BA4589DF532F8D345907C7D837E211 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/sha256.mjs` | `src/core/race-v2/sha256.mjs` | 9A28EFAAA710D4E683A0B7E71C8C8CEFD8B8B367E7D126F0D83CB9CE1FB11D50 | 9A28EFAAA710D4E683A0B7E71C8C8CEFD8B8B367E7D126F0D83CB9CE1FB11D50 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/reference-policy.mjs` | `src/core/race-v2/reference-policy.mjs` | 1003F21F586E0060CB77BA0C8A3FB175215BBB91A83CEE174A433CB8AFEE89B4 | 183A35300544325BC7122202728695216B6586B6A146F26F7CC1B0299A0FDE4A |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/fixtures.mjs` | `src/core/race-v2/fixtures.mjs` | 66BCA360DABE35B430C99D1F60CB7C339153766C6C9DA93097932B1D4663FA06 | 66BCA360DABE35B430C99D1F60CB7C339153766C6C9DA93097932B1D4663FA06 |
| `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/integer-kernel.test.mjs` | `src/core/race-v2/integer-kernel.test.mjs` | 1A1A190789A74293B08CA76288004E253C491CC9A6A119E229EDB5A065E6FE85 | DB5EC7D18605246775E16EAA1C1C01607F9F2F157A65B45DFA09AA967E1C4A27 |

Read-only transitive dependency: `src/core/prng.mjs` SHA-256 7392E6C25CA356FBF253D9DFCCD1562052577B2BFACA23720431B123364389A7. No Node-only or report import is in the runtime closure.

Additional new files: `src/core/race-v2/index.mjs` provides unmounted entry points; `src/core/race-v2/promotion-golden.test.mjs` compares exact bytes against immutable frozen Node records for pair-0 control/mixed/half and pair-1 diagnostic. Tests alone read report evidence. No game mount or state integration is included.

## Direct promotion additions and golden evidence pins

- `src/core/race-v2/index.mjs` — SHA-256 A3541458BD61A11BB58AA157D4E9494D3583D51101CFF3AD4671690221052E40
- `src/core/race-v2/promotion-golden.test.mjs` — SHA-256 A3474848FD852273D5B904CB0D1C98774951B031079DB7D7B5A1ED33C72F5ECB
- `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-control.json` — SHA-256 7D6C5B5B37ECAF712D487343591F13DCD123DC8A080F1036F00837FA17469E62
- `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-mixed.json` — SHA-256 D2D1F2CE8C6F3C5B6CF39F6751C44B4C8F9DE6B54DC8BA38DFAF77BFC5DE033D
- `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-half.json` — SHA-256 CC235CE6EBE90038877FCFA0F7A5ABDF1AF58D588DAC32AF35590B046B834D5B
- `reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-1-diagnostic.json` — SHA-256 FC058C8559AA13EC19A671EBBB9F4008276D800B8031EEB3FFCD61124513038F
