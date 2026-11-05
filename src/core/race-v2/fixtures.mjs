/** The predeclared fixed input set; no seed filtering. */
export function fixedInput(seed,{mixed=false,diagnostic=false,named=false}={}) {
  if(!['pair-0','pair-1','pair-2'].includes(seed))throw new RangeError('unsupported fixture seed');
  const ids=named?['A','P','B','C','D','E']:['E0','E1','E2','E3','E4','E5'];
  return {schema:'integer-race-input/v1',rules:diagnostic?'integer-diagnostic-no-injury/v1':'integer-working/v1',
    numericPolicy:'integer-q62-micros/v1',course:'integer-oval/v1',seed,raceId:'paired',choice:'steady',
    entrants:ids.map((id,i)=>({id,player:named?id==='P':i===0,lane:String(i%2+1),row:String(Math.floor(i/2)),
      baseRating:'10000000',restFactor:'1000000',downFactor:'1000000',entryInjury:false,
      ability:mixed&&i===0?'bounce':mixed&&i===1?'crowd':null,stance:'steady'}))};
}
