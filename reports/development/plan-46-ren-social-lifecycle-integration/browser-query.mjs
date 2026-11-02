// Shared expressions for finite browser witness and its preflight parser check.
export const buttonLookup = text => `[...document.querySelectorAll('button')].find(b=>!b.disabled && b.textContent.includes(${JSON.stringify(text)}))`;
export const focusLookup = text => `(()=>{const b=${buttonLookup(text)};b.focus();return document.activeElement===b})()`;
