// A later Save must not inherit success for an earlier replacement snapshot.
export async function saveAfterPendingRestart(pending, target, snapshot, currentTarget, save) {
  const first = await pending;
  if (!first.success) return first;
  if (currentTarget() !== target) return { success:false, error:'The active run changed before Save completed.' };
  try { return await save(snapshot); }
  catch (error) { return { success:false, error:error?.message || 'Save failed' }; }
}
