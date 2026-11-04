import {ContactGuardError} from './multi-contact-state.mjs';
export class LandingOverlapGuardError extends ContactGuardError {
 constructor(tick,duck,overlaps){super(tick,'landing-overlap-unresolved',0);this.duck=duck;this.overlaps=[...overlaps].sort()}
}
export function contactGuardEvidence(error,tick,discarded){if(error instanceof LandingOverlapGuardError)return {kind:'landing_overlap_unresolved',tick,duck:error.duck,overlaps:error.overlaps,tickRecordsDiscarded:discarded};return {kind:'multi_contact_guard',tick,limit:error.limit??32,attemptedCount:error.count,eventType:error.event?.type??'duck-contact',eventId:error.event?.id??error.pair,tickRecordsDiscarded:discarded}}
