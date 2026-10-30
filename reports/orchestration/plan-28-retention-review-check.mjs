// Read-only in-memory reproduction for delivery review; no save/evidence-log writes.
import { readCatalog, catalogEntry, readFixtureBeforeParse } from '../../scripts/dev/checkpoints/provenance.mjs';
import { GameEngine } from '../../src/core/game-engine.mjs';

async function main() {
  const entry = catalogEntry(await readCatalog(), 'plan35.rent-unpaid-escalation.v1');
  const { raw } = await readFixtureBeforeParse(entry);
  const engine = GameEngine.fromEnvelope(JSON.parse(raw));
  engine.billExpense('rent', 15);
  const before = { step: engine.state.step, activeModal: engine.state.activeModal };
  engine.clickUninstall();
  const first = structuredClone(engine.state.interruptedContext);
  engine.clickUninstall();
  const second = structuredClone(engine.state.interruptedContext);
  engine.stayUninstall();
  const after = { step: engine.state.step, activeModal: engine.state.activeModal };
  process.stdout.write(`${JSON.stringify({ scope: 'engine calls, not browser reachability', before, first, second, after,
    originalContextRestored: JSON.stringify(before) === JSON.stringify(after) })}\n`);
}
main().catch(error => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
