import { buttonLookup, focusLookup } from './browser-query.mjs';
for (const text of ['The desk', 'Messages: Ren', 'quotes " and apostrophe \'']) {
  new Function('document', `return Boolean(${buttonLookup(text)});`);
  new Function('document', `return ${buttonLookup(text)}.click();`);
  new Function('document', `return ${focusLookup(text)};`);
}
console.log('Mouse, wait and focus expressions parsed for all three probe strings.');
