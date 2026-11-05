// Static review template. Storage is accessed only after a deliberate selection.
const KEY = 'quackpot_save_v2_development';
const fixtures = Object.freeze({
  bounce: { path: './fixtures/schema6-six-race-witness-02.json', sha256: '6991bab5d008d831a8826152b13a3bb7ba970182427b63ab59faa0ddc1f9b8da' },
  crowd: { path: './fixtures/presentation-crowd-witness-after.json', sha256: '9dd6e4ccb5d8bdf6f810137429ae2fb67255a33c146df50044ddb012c98c5cd8' },
  banked: { path: './fixtures/presentation-crowd-witness-banked.json', sha256: 'bf54ef1d8a21de0b4e28ba15772791bae9ec7031ed7960f5f219fd57d5326048' },
});
const buttons = [...document.querySelectorAll('[data-fixture]')];
const status = document.querySelector('#status');
const hex = bytes => [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');

async function choose(name) {
  const fixture = fixtures[name];
  if (!fixture) return;
  if (location.protocol !== 'http:' || location.hostname !== '127.0.0.1' || !location.port || location.port === '5173') {
    status.textContent = 'This selector requires a separately approved local review site.';
    return;
  }
  for (const button of buttons) button.disabled = true;
  let written = false;
  try {
    const previous = localStorage.getItem(KEY);
    if (previous !== null && !confirm('Replace the existing development save on this review site with the selected history?')) return;
    status.textContent = 'Preparing the selected history…';
    const response = await fetch(fixture.path, { cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw new Error('fixture unavailable');
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 2 * 1024 * 1024 || hex(await crypto.subtle.digest('SHA-256', bytes)) !== fixture.sha256) throw new Error('fixture mismatch');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const envelope = JSON.parse(text);
    if (envelope?.schemaVersion !== 6 || !envelope.state?.raceResolutions || !Array.isArray(envelope.eventLog)) throw new Error('invalid fixture');
    const current = localStorage.getItem(KEY);
    if (current !== previous && current !== null && !confirm('The review save changed while this history was loading. Replace the current review save?')) return;
    localStorage.setItem(KEY, text);
    written = true;
    location.assign(new URL('../app/?race-v2=1', location.href).href);
  } catch {
    status.textContent = written ? 'The history was saved, but the review app could not be opened.' : 'The selected history could not be opened. The review save was not replaced.';
  } finally {
    for (const button of buttons) button.disabled = false;
  }
}

for (const button of buttons) button.addEventListener('click', () => { void choose(button.dataset.fixture); });
