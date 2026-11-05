export function shouldSaveReceiptPresentation(previousPhase, schema6) {
  return schema6 || previousPhase === 'terminal';
}
