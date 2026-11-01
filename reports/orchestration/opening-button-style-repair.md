# Opening setup button style repair

2026-10-31. Owner reports Start the morning is visually unstyled. Source confirms kitchen-setup-view.js used life-btn outside the life-view theme-variable scope, leaving color/background/font custom properties unresolved. Replaced that one button's classes with existing global btn/btn-secondary/btn-md to give it independent standard padding, border, background, hover and pointer styling without changing form behavior or global theme/layout.

Root preflight returned no visible Node rows; ran one Vite build through the unchanged bounded launcher: exit0,1.55s,sampled442,527,744bytes,no stop or cleanup note. Current static bundle index-BbMxWzek.js. This is source/build verification, not a new independent rendered-browser inspection. No gameplay, save, log or Plan40 content changed. Existing ignored dist was refreshed; no push/deployment. Plan38 remains closed; this is a bounded owner-requested cosmetic fix.
