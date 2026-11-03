// The v1 shape is preserved for validation of historical shown-option evidence.
// Available actions and controls actually presented are intentionally distinct.
export function availableDueOptions(life, due) {
  if (!due?.bills?.length) return null;
  return { bills: due.bills.map(bill => ({ id: bill.id, amountCents: bill.amountCents ?? bill.totalCents })),
    cashCents: due.cashCents, totalCents: due.totalCents, shortfallCents: due.shortfallCents,
    saleOptions: ['couch', 'tv'].filter(asset => !life.sold.includes(asset)),
    loanRentIds: life.finance.loans.some(loan => loan.status === 'pending') ? [] : due.bills.filter(bill => bill.id.startsWith('rent-') && bill.amountCents > due.cashCents).map(bill => bill.id),
    overtimeAvailable: !due.bills.some(bill => bill.id.startsWith('loan-')) && due.bills.some(bill => bill.id.startsWith('rent-'))
      && life.schedule.employment.employed && life.schedule.overtimeReservation?.status !== 'reserved'
      && due.bills.some(bill => bill.id.startsWith('rent-') && bill.id !== life.schedule.overtimeReservation?.rentId),
    scheduleRevision: life.schedule.revision, financeRevision: life.finance.revision };
}

export function displayedDueOptions(life, due) {
  const options = availableDueOptions(life, due);
  if (!options) return null;
  const short = options.shortfallCents > 0;
  return { ...options, saleOptions: short ? options.saleOptions : [],
    overtimeAvailable: short && options.overtimeAvailable, displayVersion: 2 };
}
