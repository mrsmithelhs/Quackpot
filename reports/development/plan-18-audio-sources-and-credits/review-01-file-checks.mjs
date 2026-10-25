// Local-file observations only: no decoding/listening, upstream identity or license proof.
import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = fs.readFileSync(new URL('./provenance.md', import.meta.url), 'utf8');
const rows = [];
for (const name of fs.readdirSync(new URL('./audio/', import.meta.url)).sort()) {
  const bytes = fs.readFileSync(new URL(`./audio/${name}`, import.meta.url));
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const row = { name, bytes: bytes.length, sha256: hash, manifestHashMatches: manifest.includes(`${hash}  ${name}`) };
  if (name.endsWith('.ogg')) {
    const identification = bytes.indexOf(Buffer.from([1, ...Buffer.from('vorbis')]));
    if (identification < 0) throw new Error(`Missing Vorbis header: ${name}`);
    row.channels = bytes[identification + 11];
    row.sampleRate = bytes.readUInt32LE(identification + 12);
    let offset = 0, lastGranule = 0n;
    while (offset < bytes.length) {
      if (bytes.toString('ascii', offset, offset + 4) !== 'OggS') throw new Error(`Bad Ogg page: ${name}`);
      const granule = bytes.readBigUInt64LE(offset + 6);
      if (granule !== 0xffffffffffffffffn && granule > lastGranule) lastGranule = granule;
      const segments = bytes[offset + 26];
      let payload = 0;
      for (let i = 0; i < segments; i++) payload += bytes[offset + 27 + i];
      offset += 27 + segments + payload;
    }
    row.durationSeconds = Number(lastGranule) / row.sampleRate;
  } else if (name.endsWith('.wav')) {
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Bad WAV');
    let offset = 12, format, data;
    while (offset + 8 <= bytes.length) {
      const tag = bytes.toString('ascii', offset, offset + 4), length = bytes.readUInt32LE(offset + 4);
      if (tag === 'fmt ') format = offset + 8;
      if (tag === 'data') data = bytes.subarray(offset + 8, offset + 8 + length);
      offset += 8 + length + length % 2;
    }
    if (!format || !data || bytes.readUInt16LE(format) !== 1 || bytes.readUInt16LE(format + 14) !== 16) throw new Error('Expected 16-bit PCM');
    row.channels = bytes.readUInt16LE(format + 2); row.sampleRate = bytes.readUInt32LE(format + 4);
    row.durationSeconds = data.length / (2 * row.channels * row.sampleRate);
    let peak = 0, squares = 0;
    for (let i = 0; i < data.length; i += 2) { const sample = data.readInt16LE(i) / 32768; peak = Math.max(peak, Math.abs(sample)); squares += sample * sample; }
    row.samplePeakDbFS = 20 * Math.log10(peak); row.rmsDbFS = 20 * Math.log10(Math.sqrt(squares / (data.length / 2)));
  }
  rows.push(row);
}
if (rows.length !== 5 || rows.some(row => !row.manifestHashMatches)) throw new Error('Manifest/file mismatch');
console.log(JSON.stringify(rows, null, 2));
