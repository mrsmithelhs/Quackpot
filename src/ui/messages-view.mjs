import { messageKey, projectMessages } from '../core/messages-projection.mjs';

export function isMessageVisible({connected, visibleDocument, uncovered, content:a, scroll:b, viewport:v}) {
  return Boolean(connected && visibleDocument && uncovered && a.width > 0 && a.height > 0 &&
    a.right > Math.max(b.left,v.left) && a.left < Math.min(b.right,v.right) &&
    a.bottom > Math.max(b.top,v.top) && a.top < Math.min(b.bottom,v.bottom));
}
// Mounted only by an owning controller. No engine, storage or global container access.
export function mountMessages(host, { deliveries, readKeys = [], onDisplay = () => true, onRead, onAction, onClose, isUncovered = () => true }) {
  let closed = false, current = null, observer = null, extraObservers = [], reads = new Set(readKeys), pending = new Set(), displayed = new Set(), generation = 0;
  const doc = host.ownerDocument;
  const button = (label, action) => { const b=doc.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click', action); return b; };
  const stop = () => { generation++; observer?.disconnect(); observer=null;for(const item of extraObservers)item.disconnect();extraObservers=[]; };
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
    if (epoch !== generation || (!m.unread && (!m.sourceDisplay || displayed.has(key))) || pending.has(key) || !visible(el,scroll)) return;
    pending.add(key);
    try {
      if(m.sourceDisplay && !displayed.has(key)) {
        const shown=await onDisplay({deliveryId:m.deliveryId,revision:m.revision});
        if(shown!==true || closed || epoch!==generation || !visible(el,scroll))return;
        displayed.add(key);
      }
      if(m.unread && !reads.has(key)) {
        const accepted=await onRead({deliveryId:m.deliveryId,revision:m.revision});
        if (!closed && epoch === generation && accepted === true) { reads.add(key); el.dataset.unread='false'; }
      }
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
      for (const t of view().threads) {
        const b=button('',()=>{current=t.id;render();});b.className='messages-thread';
        const avatar=doc.createElement('span');avatar.className='messages-avatar';avatar.textContent=t.sender.slice(0,1).toUpperCase();avatar.setAttribute('aria-hidden','true');
        const content=doc.createElement('span');content.className='messages-thread-content';
        const name=doc.createElement('strong');name.textContent=t.sender;
        const meta=doc.createElement('span');meta.className='messages-thread-meta';meta.textContent=[t.messages[0].time ?? 'Earlier',t.unread?'Unread':'',t.messages[0].status ?? '',t.messages.some(m=>m.actionable)?'Decision available':''].filter(Boolean).join(' · ');
        const preview=doc.createElement('span');preview.className='messages-preview';preview.textContent=t.preview;
        content.append(name,meta,preview);b.append(avatar,content);list.append(b);
      }
    } else {
      const thread=view().threads.find(t=>t.id===current);
      const epoch=generation;
      const outside=[];
      for (const m of thread?.messages ?? []) {
        if(m.system && m.deliveryId.startsWith('ren:floor:')){outside.push(m);continue;}
        if(m.displayBlocked){const notice=doc.createElement('p');notice.className='messages-system';notice.textContent='Resolve the current payment or recovery to view this message.';list.append(notice);continue;}
        const p=doc.createElement('p'); p.className=m.system?'messages-system':'messages-bubble'; p.tabIndex=0; p.textContent=m.text; p.dataset.unread=String(m.unread); list.append(p);
        if(m.status){const status=doc.createElement('small');status.className='messages-item-status';status.textContent=m.status;list.append(status);}
        p.addEventListener('focus',()=>{ p.scrollIntoView({block:'nearest'}); void acknowledge(m,p,list,epoch); });
        if ((m.unread || m.sourceDisplay) && doc.defaultView.IntersectionObserver) {
          if (!observer) observer=new doc.defaultView.IntersectionObserver(entries=>{ for (const e of entries) if(e.isIntersecting) { const record=e.target._messageRecord; void acknowledge(record,e.target,list,epoch); } },{root:list});
          p._messageRecord=m; observer.observe(p);
        }
      }
      // Actions are supplied by the authoritative adapter, not inferred from read status.
      if (thread?.messages.some(m=>m.actionable) || outside.length) {
        const details=doc.createElement('details'); details.className='messages-decide'; const summary=doc.createElement('summary'); summary.textContent=thread.messages.some(m=>m.actionable)?'Decide':outside.some(m=>m.displayBlocked)?'Decision unavailable':'Earlier decision'; details.append(summary);
        for(const m of outside) {
          const note=doc.createElement('p');note.className='messages-system';note.tabIndex=0;note.textContent=m.displayBlocked?'Resolve the current payment or recovery to view this decision.':m.text;details.append(note);
          if(!m.displayBlocked && (m.unread || m.sourceDisplay)) {
            note.addEventListener('focus',()=>{note.scrollIntoView({block:'nearest'});void acknowledge(m,note,details,epoch);});
            if(doc.defaultView.IntersectionObserver){const watch=new doc.defaultView.IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))void acknowledge(m,note,details,epoch);});extraObservers.push(watch);watch.observe(note);}
          }
        }
        for (const m of thread.messages.filter(m=>m.actionable)) {
          if(m.actions)for(const action of m.actions)details.append(button(action.label,()=>onAction({deliveryId:m.deliveryId,revision:m.revision,choice:action.choice})));
          else details.append(button(m.actionLabel ?? 'Review decision',()=>onAction({deliveryId:m.deliveryId,revision:m.revision})));
        }
        frame.after(details);
      }
    }
    (header.querySelector('button') ?? frame).focus();
  }
  function close() { if(closed)return; closed=true;stop();host.removeEventListener('keydown',keydown);host.replaceChildren();onClose(); }
  function keydown(e) { if(e.key==='Escape') { e.preventDefault(); close(); } }
  host.addEventListener('keydown',keydown);
  render();
  return { close, destroy(){ if(closed)return;closed=true;stop();host.removeEventListener('keydown',keydown);host.replaceChildren(); }, suspend(){ if(!closed)stop(); }, update(nextDeliveries, nextReadKeys){ if(closed)return; deliveries=nextDeliveries; reads=new Set(nextReadKeys);if(current && !view().threads.some(t=>t.id===current))current=null;render(); }, refresh(){ if(!closed)render(); } };
}



