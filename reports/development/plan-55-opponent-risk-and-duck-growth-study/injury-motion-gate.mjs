export const REPLAY_NAMES=Object.freeze(['p55m-000-first.json','p55m-000-contact.json','p55m-001-first.json','p55m-001-contact.json']);
export function completionValid(manifest,hasFailure,hasPending) {
 if(hasFailure || hasPending || !manifest || manifest.version!=='plan55-injury-motion-manifest/v1' || manifest.calls!==4 || !Array.isArray(manifest.cases) || manifest.cases.length!==4)return false;
 const names=manifest.cases.map(x=>x?.name);
 return new Set(names).size===4 && REPLAY_NAMES.every(n=>names.includes(n)) && manifest.cases.every(x=>Number.isSafeInteger(x.bytes)&&x.bytes>0&&/^[a-f0-9]{64}$/.test(x.sha256));
}

