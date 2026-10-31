export class WorkBudget {
 constructor(max=16*1024*1024){this.max=max;this.used=0}
 reserve(){const amount=Math.min(2*1024*1024+65536,this.max-this.used);if(amount<=65536)throw Error('batch expanded-byte limit');this.used+=amount;return amount}
 settle(reserved,produced){if(!Number.isSafeInteger(produced)||produced<0||produced>reserved)throw Error('invalid produced work');this.used-=reserved-produced}
}
export class ProjectionBudget {
 constructor(max=16*1024*1024){this.max=max;this.used=0}
 charge(serialized,timeline){const amount=2*(serialized.length+timeline.length);if(amount>this.max-this.used)throw Error('retained projection limit');this.used+=amount;return amount}
}
