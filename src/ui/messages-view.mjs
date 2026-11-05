import { messageKey, projectMessages } from '../core/messages-projection.mjs';

export function isMessageVisible({connected, visibleDocument, uncovered, content:a, scroll:b, viewport:v}) {
  return Boolean(connected && visibleDocument && uncovered && a.width > 0 && a.height > 0 &&
    a.right > Math.max(b.left,v.left) && a.left < Math.min(b.right,v.right) &&
    a.bottom > Math.max(b.top,v.top) && a.top < Math.min(b.bottom,v.bottom));
}
// Mounted only by an owning controller. No engine, storage or global container access.
export function mountMessages(host, { deliveries, readKeys = [], onRead, onAction, onClose, isUncovered = () => true }) {
  let closed = false, current = null, observer = null, reads = new Set(readKeys), pending = new Set(), generation = 0;
  const doc = host.ownerDocument;
  const button = (label, action) => { const b=doc.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click', action); return b; };
  const stop = () => { generation++; observer?.disconnect(); observer=null; };
  const view = () => projectMessages(deliveries, [...reads]);
  function visible(el, scroll) {
    if (closed || !el.isConnected || doc.visibilityState !== 'visible' || !isUncovered()) return false;
    const a=el.getBoundingClientRect(), b=scroll.getBoundingClientRect(), win=doc.defaultView;
    const viewport=win.visualViewport;
    const left=viewport?.offsetLeft ?? 0, top=viewport?.offsetTop ?? 0;
    const right=left+(viewport?.width ?? win.innerWidth), bottom=top+(viewport?.height ?? win.innerHeight);
    return isMessageVisible({connected:el.isConnected,visibleDocument:doc.visibilityState === 'visible',uncovered:isUncovered(),content:a,scroll:b,viewport:{left,top,right,bottom}});
  }
  async function acknowledge(m, el, scroll, epoch) {
    const key=messageKey(m);
    if (epoch !== generation || !m.unread || reads.has(key) || pending.has(key) || !visible(el,scroll)) return;
    pending.add(key);
    try {
      const accepted=await onRead({deliveryId:m.deliveryId,revision:m.revision});
      if (!closed && epoch === generation && accepted === true) { reads.add(key); el.dataset.unread='false'; }
    } catch { /* Remain unread; controller reports persistence failures. */ } finally { pending.delete(key); }
  }
  function render() {
    stop(); host.replaceChildren();
    const frame=doc.createElement('section'); frame.className='messages-panel'; frame.setAttribute('role','dialog'); frame.setAttribute('aria-label','Messages');
    const header=doc.createElement('header');
    if (current) header.append(button('Back',()=>{current=null;render();}));
    const title=doc.createElement('h2'); title.textContent=current ? view().threads.find(t=>t.id===current)?.sender ?? 'Messages' : 'Messages'; header.append(title,button('Close',close)); frame.append(header);
    const list=doc.createElement('div'); list.className='messages-scroll'; frame.append(list); host.append(frame);
    if (!current) {
      for (const t of view().threads) { const b=button(`${t.sender}${t.unread ? ' — unread' : ''}: ${t.preview}`,()=>{current=t.id;render();}); b.className='messages-thread'; list.append(b); }
    } else {
      const thread=view().threads.find(t=>t.id===current);
      const epoch=generation;
      for (const m of thread?.messages ?? []) {
        const p=doc.createElement('p'); p.className='messages-bubble'; p.tabIndex=0; p.textContent=m.text; p.dataset.unread=String(m.unread); list.append(p);
        p.addEventListener('focus',()=>{ p.scrollIntoView({block:'nearest'}); void acknowledge(m,p,list,epoch); });
        if (m.unread && doc.defaultView.IntersectionObserver) {
          if (!observer) observer=new doc.defaultView.IntersectionObserver(entries=>{ for (const e of entries) if(e.isIntersecting) { const record=e.target._messageRecord; void acknowledge(record,e.target,list,epoch); } },{root:list});
          p._messageRecord=m; observer.observe(p);
        }
      }
      // Actions are supplied by the authoritative adapter, not inferred from read status.
      if (thread?.messages.some(m=>m.actionable)) {
        const details=doc.createElement('details'); details.className='messages-decide'; const summary=doc.createElement('summary'); summary.textContent='Decide'; details.append(summary);
        for (const m of thread.messages.filter(m=>m.actionable)) details.append(button('Review decision',()=>onAction({deliveryId:m.deliveryId,revision:m.revision})));
        frame.after(details);
      }
    }
    (header.querySelector('button') ?? frame).focus();
  }
  function close() { if(closed)return; closed=true;stop();host.removeEventListener('keydown',keydown);host.replaceChildren();onClose(); }
  function keydown(e) { if(e.key==='Escape') { e.preventDefault(); close(); } }
  host.addEventListener('keydown',keydown);
  render();
  return { close, destroy(){ if(closed)return;closed=true;stop();host.removeEventListener('keydown',keydown);host.replaceChildren(); }, update(nextDeliveries, nextReadKeys){ if(closed)return; deliveries=nextDeliveries; reads=new Set(nextReadKeys); render(); }, refresh(){ if(!closed)render(); } };
}



