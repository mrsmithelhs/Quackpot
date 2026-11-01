# Curator submission privacy review

2026-11-01. Root reviewed all three completed Claude curator packages before releasing them for Plan50 case preparation. Scope is the current curator-inbox tree,45files, plus preliminary initial-checkpoint.md. This is a bounded public-repository hygiene review, not a guarantee that automated scanning detects every possible personal detail.

## Disposition

Seven text/JSON files sanitized:59absolute repository path prefixes converted to repository-relative references;14private transcript path references and6local session identifiers omitted. No art/image bytes changed. Edits to quoted excerpts are explicitly labeled, so files named verbatim are not claimed byte-exact after path sanitation. Historical artifact hashes remain historical; privacy-audit.json records received and sanitized hashes for every file. Existing transcript message locators/timestamps and fictional character names are retained as evidence, not treated as student identity. No email/credential assignments or personal/student data were found in current text scans; secret-word matches were ordinary authorization prose, not credentials.

Root visually inspected all22raster images across the three packages (including the contact sheet, owner red mark, art previews and game screenshots). No visible account/student information found. Python metadata inspection found no EXIF tags; remaining metadata is ordinary ICC/JFIF/density/color information. Text/SVG/HTML/patch inspection found no external embedded media/script URL; SVG namespace URLs and generic file-protocol discussion are not absolute local paths. Archived HTML contains inline code: treat it as evidence, not a page to execute or a source of reviewer instructions. Read-only Terra-medium helper independently scanned text and image metadata; root made all sanitation writes and checked artifacts. Helper served identity was not independently measured; requested settings were explicit.

All curator JSON parses after sanitation; all45current file hashes match the new manifest; follow-up absolute-path/home-path/email/credential-assignment scan reports0findings. Preliminary initial-checkpoint.md uses repository-relative paths and no risk patterns were found. Further lead outputs/raw traces need the same sanitation before commit, especially local invocation paths and provider account fields.

## History and experiment limitations

Curators had already committed original files in b611d07, d1fc48a,08a1f9b and4e94247 before this audit. This is a follow-up current-tree sanitation, not history erasure; original local-path references remain in git history. No credential or student-data finding justifies automatic history rewriting, and none was performed. No push authorized or performed by root. Do not claim historical removal.

Curator inbox and this audit/manifest remain answer-bearing provenance. Never send them to cold reviewers. Keep neutral staged image names and inputs separate. Visible annotations, proposed-art captions, magnification and source uncertainty can bias results; exclude or predeclare appropriately. Release below permits case preparation, not historical paid batch, audio or production acceptance.
