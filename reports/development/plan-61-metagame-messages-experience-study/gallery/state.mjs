export const initial = () => [
 {id:'ren',name:'Ren',time:'Today · 5:12',order:4,revision:1,read:0,kind:'ordinary',messages:[{from:'sender',text:'hey, the hallway light is working again'},{from:'sender',text:'turns out the bulb was just loose'}]},
 {id:'loan',name:'Harbor Card',time:'Today · 9:00',order:3,revision:1,read:1,kind:'due',messages:[{from:'sender',text:'Outstanding balance: $120.00.'},{from:'sender',text:'Your payment is due. You may pay early.'}],action:'unresolved'},
 {id:'work',name:'Marisol',time:'Yesterday',order:2,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'Thanks for covering the front counter.'},{from:'player',text:'No problem!'}]},
 {id:'history',name:'Harbor Court',time:'Earlier',order:1,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'The package shelf is beside the mailboxes.'},{from:'player',text:'Thanks, found it!'}],historical:true},
 {id:'parcel',name:'Parcel desk',time:'Earlier',order:0,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'Your parcel is ready for pickup.'},{from:'player',text:'Thanks, I picked it up.'}],historical:true},
 {id:'repair',name:'Repair shop',time:'Earlier',order:-1,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'The lamp is ready.'},{from:'player',text:'Thanks!'}],historical:true},
 {id:'laundry',name:'Laundry',time:'Earlier',order:-2,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'Your order is ready for collection.'},{from:'player',text:'Got it, thank you.'}],historical:true},
 {id:'library',name:'Library',time:'Earlier',order:-3,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'Your hold is ready.'},{from:'player',text:'Thank you!'}],historical:true},
 {id:'store',name:'Corner store',time:'Earlier',order:-4,revision:1,read:1,kind:'ordinary',messages:[{from:'sender',text:'We found the umbrella.'},{from:'player',text:'Thanks, I will stop by.'}],historical:true}
];
export const unread = threads => threads.filter(t=>t.revision>t.read).length;
export const ordered = threads => [...threads].sort((a,b)=>b.order-a.order || a.id.localeCompare(b.id));
export function markShown(thread, displayedRevision) { if(displayedRevision <= thread.revision) thread.read=Math.max(thread.read,displayedRevision); }
export function deliver(thread, revision, order) { if(revision<=thread.revision)return false; thread.revision=revision; thread.order=order; return true; }


// Mock-only acknowledgment: failure to mount leaves the delivered revision unread.
export function showRevision(thread, revision, mount) { try { if (mount() !== true) return false; markShown(thread, revision); return true; } catch { return false; } }
