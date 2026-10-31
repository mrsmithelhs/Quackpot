// Plan 42 synthetic contract only; not a production event projection.
const bad = message => { throw new Error(message); };
const reserved = new Set(['__proto__','prototype','constructor']);
export function parseBoundedJson(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > 2*1024*1024) bad('JSON byte limit');
  let text; try {text = new TextDecoder('utf-8',{fatal:true}).decode(bytes)} catch {bad('invalid UTF-8')}
  let i=0; const ws=()=>{while(/[\x20\t\r\n]/.test(text[i]||'\0')) i++};
  function string(){let start=i++;while(i<text.length){const c=text[i++];if(c==='"'){let value;try{value=JSON.parse(text.slice(start,i))}catch{bad('invalid string')}if(value.length>512)bad('string limit');return value}if(c==='\\'){if(i>=text.length)bad('invalid escape');i++}else if(c.charCodeAt(0)<32)bad('control character')}bad('unterminated string')}
  function value(depth){if(depth>12)bad('depth limit');ws();const c=text[i];if(c==='"')return string();if(c==='{'){i++;ws();const out=Object.create(null),keys=new Set();if(text[i]==='}'){i++;return out}for(;;){ws();if(text[i]!=='"')bad('object key');const k=string();if(keys.has(k)||reserved.has(k))bad('duplicate or reserved key');keys.add(k);if(keys.size>32)bad('object limit');ws();if(text[i++]!==':')bad('colon expected');out[k]=value(depth+1);ws();const sep=text[i++];if(sep==='}')return out;if(sep!==',')bad('object separator')}}
  if(c==='['){i++;ws();const a=[];if(text[i]===']'){i++;return a}for(;;){if(a.length>=2000)bad('array limit');a.push(value(depth+1));ws();const sep=text[i++];if(sep===']')return a;if(sep!==',')bad('array separator')}}
  const m=/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i));if(!m)bad('invalid value');i+=m[0].length;return JSON.parse(m[0])}
  const result=value(0);ws();if(i!==text.length)bad('trailing JSON');return result;
}
const exact=(x,keys)=>{if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==keys.length||keys.some(k=>!Object.hasOwn(x,k)))bad('unexpected fields')};
export function validateUsage(x){
 exact(x,['format','schemaVersion','catalogVersion','synthetic','runId','evidence','summary','timelineCoverage','timeline']);
 if(x.format!=='quackpot-synthetic-usage'||x.schemaVersion!==1||x.catalogVersion!=='synthetic-1'||x.synthetic!==true)bad('unsupported contract');
 if(typeof x.runId!=='string'||!/^synthetic-[a-zA-Z0-9-]{1,80}$/.test(x.runId))bad('invalid synthetic run ID');
 if(!['complete','incomplete','unknown'].includes(x.evidence))bad('invalid evidence');
 exact(x.summary,['displayed','actions','committed','revealed']);
 for(const n of Object.values(x.summary)) if(n!==null&&(!Number.isSafeInteger(n)||n<0||n>2000))bad('invalid count');
 if(x.evidence!=='complete'&&Object.values(x.summary).some(n=>n===0))bad('zero requires complete evidence');
 if(!['full','partial'].includes(x.timelineCoverage))bad('invalid timeline coverage');
 if(!Array.isArray(x.timeline)||x.timeline.length>2000)bad('timeline limit');
 let last=-1;const commits=new Set(),reveals=new Set(),counts={displayed:0,actions:0,committed:0,revealed:0};
 for(const e of x.timeline){exact(e,['seq','kind','code','ref']);if(!Number.isSafeInteger(e.seq)||e.seq<=last)bad('invalid order');last=e.seq;if(!['displayed','action','committed','revealed','terminal','receipt'].includes(e.kind))bad('event kind');if(typeof e.code!=='string'||!/^synthetic-[a-z0-9-]{1,60}$/.test(e.code))bad('event code');if(e.kind==='revealed'){if(!Number.isSafeInteger(e.ref)||!commits.has(e.ref)||reveals.has(e.ref))bad('reveal without unique commit');reveals.add(e.ref);counts.revealed++}else {if(e.ref!==null)bad('unexpected reference');if(e.kind==='committed'){commits.add(e.seq);counts.committed++}if(e.kind==='displayed')counts.displayed++;if(e.kind==='action')counts.actions++}}
 if(x.evidence==='complete'){const a=x.timeline.at(-2),b=x.timeline.at(-1);if(!a||!b||a.kind!=='terminal'||b.kind!=='receipt'||a.code!==b.code)bad('complete evidence requires terminal and receipt');}
 for(const k of Object.keys(counts))if(x.summary[k]!==null&&(x.summary[k]<counts[k]||(x.timelineCoverage==='full'&&x.summary[k]!==counts[k])))bad('summary inconsistent with timeline');
 return x;
}
