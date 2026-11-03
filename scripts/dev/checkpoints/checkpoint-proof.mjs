import { appendFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { assertCatalogBoundary, assertNegativeControls, validateAndHydrate } from './envelope.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {GameEngine} from '../../../src/core/game-engine.mjs';
import {EventLog} from '../../../src/core/event-log.mjs';
import {guidance} from '../../../src/core/life-schedule/policy.mjs';
import {
  MAX_FIXTURE_TOTAL_BYTES, PLAN35, ROOT, assertFreshnessNegativeControls, assertValidationAttestation,
  assertValidationAttestationNegativeControls,
  catalogEntry, currentLoaderSha256, currentValidationLoaderSha256, currentPlan52SourceClosure,
  assertCaptureParent, assertValidationResultMatches, readBounded, readCatalog, readFixtureBeforeParse,
  readPinnedPilotEvidenceRecord, resolveRepoPath, sha256, verifyPinnedPlan16Archive,
  verifyCaptureOrigin, verifyPlan16SourceClosure, validateFreshness, validateFixtureBase,
  writeFixtureValidationAttestation,
} from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const resultsPath = path.join(ROOT, PLAN35, 'pilot-results.jsonl');

async function plan52Fixture(id) {
  const catalog=await readCatalog(),entry=catalogEntry(catalog,id);
  const candidates=Object.entries(catalog.checkpoints).filter(([key])=>key.startsWith('plan52.'));
  if(candidates.length>catalog.plan52Limits.newFixturesMaximum || candidates.reduce((total,[,item])=>total+item.bytes,0)>catalog.plan52Limits.newFixturesAggregateBytesMaximum || candidates.some(([,item])=>item.bytes>catalog.plan52Limits.newFixtureBytesMaximum))fail('Plan 52 checkpoint catalog exceeds its declared bounds');
  if(await currentValidationLoaderSha256()!==catalog.plan52ValidationLoaderSha256)fail('Plan 52 validation loader changed; review the tooling change and deliberately revalidate and re-pin the checkpoint catalog');
  if(!['current-loadable','pending-browser-restore'].includes(entry.status) || entry.policy!=='five-slot-v1')fail(`${id} is not a five-slot checkpoint candidate`);
  const fixture=await readFixtureBeforeParse(entry),envelope=JSON.parse(fixture.raw),closure=await currentPlan52SourceClosure();
  if(closure.sha256!==entry.sourceClosureSha256)fail(`${id} source closure changed`);
  for(const [file,pin] of [[entry.recipe,entry.recipeSha256],[entry.captureTrace,entry.captureTraceSha256]])if(sha256(await readBounded(file,1024*1024))!==pin)fail(`${id} provenance changed: ${file}`);
  if(entry.status==='current-loadable') {
    for(const [file,pin] of [[entry.restoreRecipe,entry.restoreRecipeSha256],[entry.restoreTrace,entry.restoreTraceSha256]])if(sha256(await readBounded(file,1024*1024))!==pin)fail(`${id} restore evidence changed: ${file}`);
    const restore=JSON.parse((await readBounded(entry.restoreTrace,1024*1024)).toString('utf8')),result=restore.results?.find(item=>item.name===entry.restoreName);
    if(restore.error || restore.consoleErrors?.length || restore.cleanup?.residual || restore.cleanup?.uncertainty || restore.sourceClosureSha256!==closure.sha256 || restore.recipeSha256!==entry.restoreRecipeSha256 || result?.fixtureSha256!==entry.sha256 || (result?.continuationVerified!==true && result?.wages!==1) || result?.unchangedRng!==true)fail(`${id} restore evidence does not match`);
  }
  const trace=JSON.parse((await readBounded(entry.captureTrace,1024*1024)).toString('utf8'));
  if(trace.error || trace.cleanup?.residual || trace.cleanup?.uncertainty || trace.consoleErrors?.length)fail(`${id} capture did not complete cleanly`);
  if(trace.sourceClosureSha256 && (trace.sourceClosureSha256!==closure.sha256 || trace.recipeSha256!==entry.recipeSha256))fail(`${id} capture closure or recipe mismatch`);
  if(entry.captureName) {
    const capture=trace.captures?.find(item=>item.name===entry.captureName);
    if(capture?.sha256!==entry.sha256) {
      const saved=capture?.saved, events=envelope.eventLog?.map(({type,payload})=>({type,payload}));
      if(!saved || saved.schema!==envelope.schemaVersion || saved.day!==envelope.state.life?.schedule?.day || saved.slot!==envelope.state.life?.schedule?.slot || saved.cash!==envelope.state.cash || saved.health!==envelope.state.health || JSON.stringify(saved.events)!==JSON.stringify(events))fail(`${id} capture does not identify fixture history and boundary`);
    }
  }
  if(trace.parent && sha256(await readBounded(trace.parent,1024*1024))!==trace.parentSha256)fail(`${id} generator parent changed`);
  if(trace.source && sha256(await readBounded(trace.source,1024*1024))!==trace.sourceSha256)fail(`${id} capture parent changed`);
  for(const [file,pin] of Object.entries(trace.pins??{}))if(sha256(await readBounded(file,2*1024*1024))!==pin)fail(`${id} captured source pin changed: ${file}`);
  const b=entry.boundary,s=envelope.state;
  if(envelope.eventLog?.[0]?.payload?.seed!==entry.seed || s.life?.schedule?.slot!==b.slot || (b.day!==undefined && s.life.schedule.day!==b.day) || (b.cash!==undefined && s.cash!==b.cash) || (b.debt!==undefined && s.debt!==b.debt) || (b.storyStage!==undefined && s.life?.story47?.stage!==b.storyStage))fail(`${id} seed or boundary mismatch`);
  if(b.dueId && ![...(s.life?.finance?.rents??[]),...(s.life?.finance?.loans??[])].some(item=>item.id===b.dueId && item.status==='pending' && item.latched))fail(`${id} due obligation mismatch`);
  if((b.health!==undefined && s.health!==b.health) || (b.employed!==undefined && s.life.schedule.employment.employed!==b.employed) || (b.renCommitted!==undefined && Boolean(s.life.social46?.pending?.committed)!==b.renCommitted) || (b.recovery!==undefined && Boolean(s.life.schedule.recovery && !s.life.schedule.recovery.resolved)!==b.recovery))fail(`${id} review condition mismatch`);
  if(b.renArriving && !s.life.social46?.pending?.arrival?.lineShown)fail(`${id} Ren arrival not shown`);
  if(b.guidance && guidance(s.life.schedule.day,[],s.life.schedule.config).stage!==b.guidance)fail(`${id} guidance boundary mismatch`);
  const options={experimentalFiveSlot:true,requireFiveSlotTutorial:true},validation=validateSave(envelope,options);if(!validation.valid)fail(`${id} failed validation: ${validation.errors.join('; ')}`);
  const stable=value=>{const copy=structuredClone(value);delete copy.savedAt;return JSON.stringify(copy);};
  if(stable(GameEngine.fromEnvelope(envelope).toEnvelope())!==stable(envelope))fail(`${id} hydrate/serialize mismatch`);
  const alteredCash=structuredClone(envelope);alteredCash.state.cash+=1;
  const alteredRng=structuredClone(envelope);alteredRng.prngStreams.draw='not-json';
  const alteredHistory=structuredClone(envelope),effect=alteredHistory.eventLog.find(event=>event.type==='life52_effect');
  if(effect)effect.payload.effect.type='forged_effect';
  else alteredHistory.eventLog[0].payload.lifeConfig.startCash+=1;
  const rebuilt=new EventLog();for(const event of alteredHistory.eventLog)rebuilt.append(event.type,event.payload,event.clock);alteredHistory.eventLog=rebuilt.entries;
  if([alteredCash,alteredRng,alteredHistory].some(value=>validateSave(value,options).valid))fail(`${id} accepted a negative control`);
  return {id,status:entry.status,fixture:entry.fixture,sha256:fixture.hash,seed:entry.seed,boundary:entry.boundary,sourceClosureSha256:closure.sha256,validation:'valid',negativeControls:['cash','rng',effect?'re-chained transaction effect':'re-chained starting config'],limit:'This checkpoint contains no gacha draw or race outcome and does not establish whole-run acceptance.'};
}

async function appendResult(record) {
  const current = await stat(resultsPath).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  const line = `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`;
  if (Buffer.byteLength(line) > 1024 * 1024 || (current && current.size + Buffer.byteLength(line) > 1024 * 1024)) fail('Plan 35 pilot result log exceeds 1 MiB.');
  if (current) {
    const prior = await readBounded(`${PLAN35}/pilot-results.jsonl`, 1024 * 1024);
    for (const row of prior.toString('utf8').split(/\r?\n/).filter(Boolean)) JSON.parse(row);
  }
  await mkdir(path.dirname(resultsPath), { recursive: true });
  await appendFile(resultsPath, line, 'utf8');
  return { file: `${PLAN35}/pilot-results.jsonl`, bytes: Buffer.byteLength(line), sha256: sha256(Buffer.from(line)) };
}

async function reference(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  if (entry.status === 'historical-reference' && id === 'qp16.pending-reveal.v1') {
    const fixture = await readFixtureBeforeParse(entry);
    const envelope = JSON.parse(fixture.raw);
    const validation = validateAndHydrate(envelope, id);
    const record = { phase: 'historical-reference', id, class: entry.class, status: entry.status,
      fixture: { bytes: fixture.bytes.length, sha256: fixture.hash }, validation,
      reuseLimit: 'Historical generated evidence only; current generated reuse remains stale by its recorded recipe.' };
    await appendResult(record);
    return record;
  }
  if (id !== 'qp16.starter-offer.v1') fail(`Unsupported Plan 16 reference: ${id}`);
  const archive = await verifyPinnedPlan16Archive(catalog);
  const closure = await verifyPlan16SourceClosure(catalog, { requireCurrent: false });
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  const currentLoadable = closure.matches;
  const record = { phase: 'historical-reference', id, class: entry.class,
    status: currentLoadable ? 'historical-reference-current-source-match' : 'historical-reference-source-stale',
    fixture: { bytes: fixture.bytes.length, sha256: fixture.hash }, archive, sourceClosure: closure,
    validation, reuseLimit: 'Capture and loader identities remain distinct; historical browser branches used the earlier loader.' };
  await appendResult(record);
  return record;
}

async function fixture(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  assertCaptureParent(catalog, entry);
  await verifyPinnedPlan16Archive(catalog);
  const freshness = await validateFreshness(entry, id);
  const negativeFreshness = assertFreshnessNegativeControls(entry, freshness);
  const negativeAttestation = assertValidationAttestationNegativeControls(entry, id,
    freshness.validationAttestation, freshness);
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  const negativeControls = { ...assertNegativeControls(envelope), ...negativeFreshness, ...negativeAttestation };
  const record = { phase: 'fixture-preflight', id, class: entry.class, status: entry.status,
    bytes: fixture.bytes.length, sha256: fixture.hash, freshness, validation, negativeControls };
  await appendResult(record);
  return record;
}

async function revalidate(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  assertCaptureParent(catalog, entry);
  await verifyPinnedPlan16Archive(catalog);
  const current = await validateFixtureBase(entry, id);
  const envelope = JSON.parse(current.fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  const negativeControls = { ...assertNegativeControls(envelope), ...assertFreshnessNegativeControls(entry, current) };
  const attestationBase = {
    protocol: 'qp35.fixture-validation.v1', checkpointId: id,
    fixture: { path: entry.fixture, bytes: current.fixture.bytes.length, sha256: current.fixture.hash },
    captureOrigin: { captureRevision: current.captureOrigin.captureRevision,
      captureRecipeFile: current.captureOrigin.captureRecipeFile, captureRecipeSha256: current.captureOrigin.captureRecipeSha256,
      loaderSha256: current.captureOrigin.loaderSha256, manifestSha256: current.captureOrigin.manifestSha256 },
    productionSourceFingerprint: current.productionSourceFingerprint,
    sourceClosureSha256: current.sourceClosureSha256,
    validationLoaderSha256: current.validationLoaderSha256,
    result: { valid: true, boundaryMatched: true, envelopeValid: validation.validation.valid,
      errors: validation.validation.errors, eventCount: validation.eventCount, chainHead: validation.chainHead, negativeControls },
  };
  const attestationNegativeControls = assertValidationAttestationNegativeControls(entry, id, attestationBase, current,
    { requireRecordPin: false });
  const finalNegativeControls = { ...negativeControls, ...attestationNegativeControls };
  const record = { phase: 'fixture-revalidation', id,
    fixture: attestationBase.fixture, captureOrigin: attestationBase.captureOrigin,
    productionSourceFingerprint: current.productionSourceFingerprint,
    sourceClosureSha256: current.sourceClosureSha256,
    validationLoaderSha256: current.validationLoaderSha256,
    result: { valid: true, boundaryMatched: true, negativeControls: finalNegativeControls, validation } };
  // Confirm the final positive attestation shape before appending a successful result record.
  const stagedAttestation = { ...attestationBase,
    result: { ...attestationBase.result, negativeControls: finalNegativeControls } };
  assertValidationAttestation(entry, id, stagedAttestation, current, { requireRecordPin: false });
  const stagedNegativeControls = assertValidationAttestationNegativeControls(entry, id, stagedAttestation, current,
    { requireRecordPin: false });
  if (JSON.stringify(stagedNegativeControls) !== JSON.stringify(attestationNegativeControls)) {
    fail('Validation-attestation negative controls changed while building the result record.');
  }
  assertValidationResultMatches(stagedAttestation, record);
  const recordPin = await appendResult(record);
  const attestation = { ...attestationBase,
    result: { ...attestationBase.result, negativeControls: finalNegativeControls }, recordPin };
  // Verify the pinned record and full attestation before publishing the index entry.
  const storedRecord = await readPinnedPilotEvidenceRecord(recordPin);
  assertValidationAttestation(entry, id, attestation, current);
  assertValidationAttestationNegativeControls(entry, id, attestation, current);
  assertValidationResultMatches(attestation, storedRecord);
  await writeFixtureValidationAttestation(id, attestation);
  await validateFreshness(entry, id);
  return { phase: 'fixture-revalidation', id, fixture: attestation.fixture,
    captureOrigin: attestation.captureOrigin, validationLoaderSha256: attestation.validationLoaderSha256,
    negativeControls: finalNegativeControls, recordPin };
}

async function auditCaptureOrigins() {
  const catalog = await readCatalog();
  const ids = ['plan35.rent-paid-zero.v1', 'plan35.rent-unpaid-escalation.v1', 'plan35.finale-race-entry.v1'];
  const origins = [];
  for (const id of ids) {
    const entry = catalogEntry(catalog, id);
    const origin = await verifyCaptureOrigin(id, entry);
    origins.push({ checkpointId: id, captureRevision: origin.captureRevision,
      captureRecipeSha256: origin.captureRecipeSha256, loaderSha256: origin.loaderSha256,
      manifestSha256: origin.manifestSha256 });
  }
  return { phase: 'capture-origin-audit', origins };
}

async function main() {
  const [, , command, id] = process.argv;
  if (command === 'reference' && id) {
    const result = await reference(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'fixture' && id) {
    if(id.startsWith('plan52.')) {process.stdout.write(`${JSON.stringify(await plan52Fixture(id))}\n`);return;}
    const catalog = await readCatalog();
    const newEntries = Object.values(catalog.checkpoints ?? {}).filter((item) => item.status !== 'not-captured');
    let bytes = 0;
    for (const item of newEntries) {
      if (!item.fixture) fail('Captured catalog entry has no fixture path.');
      const info = await stat(resolveRepoPath(item.fixture));
      if (!info.isFile() || info.size > catalog.limits.newFixtureBytesMaximum) fail(`Fixture exceeds per-file cap before loading: ${item.fixture}`);
      bytes += info.size;
      if (bytes > MAX_FIXTURE_TOTAL_BYTES || bytes > catalog.limits.newFixturesAggregateBytesMaximum) fail('Plan 35 fixture aggregate exceeds its 2 MiB cap.');
    }
    const result = await fixture(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'revalidate' && id) {
    const result = await revalidate(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'origin-audit' && !id) {
    process.stdout.write(`${JSON.stringify(await auditCaptureOrigins())}\n`);
    return;
  }
  if (command === 'loader-identity') {
    process.stdout.write(`${JSON.stringify({ loaderSha256: await currentLoaderSha256(),
      validationLoaderSha256: await currentValidationLoaderSha256() })}\n`);
    return;
  }
  fail('Usage: checkpoint-proof.mjs reference <Plan16-id> | fixture <Plan35-id> | revalidate <Plan35-id> | origin-audit | loader-identity');
}

main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
