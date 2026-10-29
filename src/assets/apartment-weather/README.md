# Unmounted apartment weather helpers

These modules extract the accepted Plan 26 living-room weather stills, rain motion specification/controller, page-level flash arbiter, and owner-selected bright lightning effect. They are not imported from the game entry and are not mounted by any current view.

`buildWeatherLayers({ area, idPrefix, weather, ...kitOptions })` calls the apartment kit only with its own options. `clear` returns the kit SVG unchanged. `overcast`, `rain`, and `storm` are supported only for `area: 'living'`. Unsupported weather/area/light pairings and anchor mismatch return the plain kit SVG with a `diagnostic` containing the request and effective state; partial weather markup is never returned. Every inserted ID uses the caller's `idPrefix` plus `-weather`.

The versioned `data-weather` roles are: `sky`, `clouds`, `rain-streaks`, `droplets`, `ambient-shadows`, `weather-tint`, optional `weather-vignette`, `window-spill`, and optional `lamp-spill`. The panes retain their original clip path. Weather helpers do not alter the kit's duck or lamp source markup. The selected whole-scene lightning overlay can illuminate both and wash the lamp white at peak.

The source compatibility and anchor contract is tested against the delivered Plan 24 kit; its recorded Plan 26 reference pin is `5237a2a4f58922ff713240a9e4c7221ab89e6c62`. No runtime Git, filesystem, or `reports/` reads are used.
