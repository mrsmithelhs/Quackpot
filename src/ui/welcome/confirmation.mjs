// A refusal or failed asynchronous preparation must leave the form usable.
export function createConfirmationGate(callback) {
  let pending = false;
  return async value => {
    if (pending) return false;
    pending = true;
    try { return await callback(value); }
    finally { pending = false; }
  };
}
