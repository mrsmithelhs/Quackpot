// Five-slot day-bar controls are room navigation only. The caller supplies available room IDs.
const ROOM_LABELS = Object.freeze({ 'kitchen-notice':'The kitchen notice', 'kitchen-breakfast':'The kitchen', 'desk-phone':'The desk', living:'The living room', bedroom:'The bedroom', door:'The door' });
export function renderRoomNavigation(container, destinations, navigate) {
  if (!Array.isArray(destinations) || typeof navigate !== 'function' || destinations.some(id => !Object.hasOwn(ROOM_LABELS,id)) || new Set(destinations).size !== destinations.length) throw new TypeError('Invalid room navigation');
  for (const id of destinations) {
    const button=document.createElement('button'); button.type='button'; button.className='life-btn life-day-next'; button.textContent=`${ROOM_LABELS[id]} →`; button.dataset.roomDestination=id;
    button.addEventListener('click',()=>navigate(id)); container.append(button);
  }
}
