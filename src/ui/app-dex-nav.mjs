// Small in-world collection control; callers choose a safe location within the current app view.
export function mountAppDexNav(host, onOpen, { hidden = false } = {}) {
  if (!host || !onOpen) return null;
  const button = host.ownerDocument.createElement('button');
  button.type = 'button'; button.className = 'btn btn-secondary btn-sm app-dex-nav';
  button.textContent = 'Duck-Dex'; button.setAttribute('aria-label', 'Open Duck-Dex collection');
  button.hidden = hidden; button.addEventListener('click', onOpen); host.append(button);
  return button;
}
