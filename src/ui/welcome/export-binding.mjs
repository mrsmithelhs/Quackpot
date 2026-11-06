// Reconcile Welcome immediately after the durable legacy-ID binding succeeds.
export async function bindExportIdentity(saved, id, bind, reconcile) {
  const boundId = await bind(id);
  saved.usageRunId = boundId;
  reconcile(saved);
  return boundId;
}
