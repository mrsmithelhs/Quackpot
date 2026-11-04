// Study-only probability projection for an actual participant contact; no roll or race resolution.
export function residualContactProbability({base,hasBounce,phase,actualParticipant,factor}) {
 if(!Number.isFinite(base)||base<0||base>1||!Number.isFinite(factor)||factor<0||factor>=1||typeof hasBounce!=='boolean'||typeof actualParticipant!=='boolean'||!['idle','rising','airborne','landing'].includes(phase))throw new RangeError('invalid residual contact input');
 if(!actualParticipant)return null;
 const protectedContact=hasBounce&&['rising','airborne','landing'].includes(phase);
 return {probability:protectedContact?base*factor:base,protectedContact};
}
