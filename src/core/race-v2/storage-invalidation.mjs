import { SCHEMA6_STORAGE_KEY } from '../storage.mjs';

// Called by the opt-in controller for storage events from other documents.
export function invalidateForSchema6StorageEvent(event,session,engine){
  if(event?.key!==SCHEMA6_STORAGE_KEY&&event?.key!==null)return false;
  session.invalidate();engine?.cancelRaceV2();if(engine)engine.autosaveEnabled=false;return true;
}
