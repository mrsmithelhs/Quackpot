import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function verify(manifest,files,sources){
 if(!manifest||manifest.schema!==1||!Array.isArray(manifest.variants)||manifest.variants.length!==2)throw Error('incomplete manifest');
 for(const name of ['medium','large']){const matches=manifest.variants.filter(x=>x.name===name);if(matches.length!==1||!files[name]||!sources[name])throw Error('incomplete set');const x=matches[0];if(hash(files[name])!==x.output_sha256||hash(sources[name])!==x.source_sha256)throw Error('hash mismatch');const data=JSON.parse(files[name].toString());if(data.notes.length!==x.notes||JSON.stringify(data.omitted)!==JSON.stringify(x.omitted)||JSON.stringify(data.counts)!==JSON.stringify(x.counts)||JSON.stringify(data.programs)!==JSON.stringify(x.programs))throw Error('manifest content mismatch');}
 return true;
}
