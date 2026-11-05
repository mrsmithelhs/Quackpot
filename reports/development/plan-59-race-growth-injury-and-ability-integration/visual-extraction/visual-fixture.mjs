import { abilityVisual } from '../../../../src/ui/race-effects/ability-effects.mjs';
import { collisionVisual } from '../../../../src/ui/race-effects/collision-effects.mjs';
import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { createTimeline, previewDurationMs } from './timeline-fixture.mjs';

const abilities = ['bounce','crowd','guard','recovery','dive','wide','ahead','draft','straight','steady','wake'];
const collision = ['pop','fragments','burst','injury','white-return'];
const select = document.querySelector('#kind'), slider = document.querySelector('#progress');
for (const kind of [...abilities, ...collision]) select.add(new Option(kind, kind));
const instances = ['a','b'].map((name) => {
  const stage = document.querySelector(`#example-${name}`), prefix = `fixture-${name}`;
  stage.innerHTML = `<span class="label">Duck ${name.toUpperCase()}</span><div class="runner"><div class="layer water"></div><div class="layer back"></div><div class="body">${createDigitalDuckSvg({ prefix, label: `Duck ${name.toUpperCase()}` })}</div><div class="layer front"></div><div class="layer overlay"></div></div>`;
  const runner = stage.querySelector('.runner'), body = stage.querySelector('.body'), svg = body.querySelector('svg');
  const root = svg.querySelector('g[id$="-root"]');
  const colors = Object.fromEntries(['--duck-body-fill','--duck-wing-fill','--duck-wing-mid','--duck-bill-fill'].map((key) => [key,root.style.getPropertyValue(key)]));
  return { stage, prefix, runner, body, svg, root, colors };
});

function render(progress) {
  const kind = select.value, still = document.querySelector('#still').checked;
  if (progress !== null) slider.value = progress;
  for (const instance of instances) {
    const { stage, prefix, runner, body, svg, root, colors } = instance;
    for (const layer of ['water','back','front','overlay']) runner.querySelector(`.${layer}`).replaceChildren();
    stage.querySelectorAll('.fixture-art,.fixture-bandage').forEach((node) => node.remove());
    const head = body.querySelector('[id$="-head-group"]'), wing = body.querySelector('[id$="-wing-group"]'), bodyGroup = body.querySelector('[id$="-body-group"]');
    head?.removeAttribute('transform'); if (wing) wing.style.transform = '';
    body.style.transform = ''; body.style.opacity = ''; svg.style.filter = '';
    for (const [key,value] of Object.entries(colors)) root.style.setProperty(key,value);
    stage.querySelector('.label').textContent = `Duck ${prefix.at(-1).toUpperCase()}`;
    if (abilities.includes(kind)) {
      const result = abilityVisual({ kind, progress, idPrefix: `${prefix}-effect`, pose: { still, link: { width: 256, height: 256, leaderX: 55, followerX: 185, y: 170, duckWidth: 90 } } });
      for (const [layer, markup] of Object.entries(result.layers)) runner.querySelector(`.${layer}`).innerHTML = markup;
      if (result.active) {
        body.style.transform = `translateY(${result.pose.bodyY}%) rotate(${result.pose.tilt}deg)`;
        body.style.opacity = result.pose.bodyOpacity;
        if (head) head.setAttribute('transform', `translate(${result.pose.head.dx} ${result.pose.head.dy}) rotate(${result.pose.head.angle} 48 46)`);
        if (result.headBridge && bodyGroup) { bodyGroup.insertAdjacentHTML('afterbegin',result.headBridge); bodyGroup.firstElementChild.classList.add('fixture-art'); bodyGroup.firstElementChild.setAttribute('opacity',result.pose.head.bridge); }
        if (wing) { wing.style.transformBox = 'view-box'; wing.style.transformOrigin = '52% 56%'; wing.style.transform = `rotate(${result.pose.wingAngle}deg)`; if (result.wingArtwork) { wing.insertAdjacentHTML('beforeend',result.wingArtwork); const fan=wing.lastElementChild; fan.classList.add('fixture-art'); fan.setAttribute('opacity',result.pose.wingFan); fan.style.transformOrigin='60px 64px'; fan.style.transform=`rotate(${result.pose.wingFanAngle}deg)`; } }
      }
      stage.querySelector('.label').textContent = result.pose.underwater ? `Duck ${prefix.at(-1).toUpperCase()} · underwater` : `Duck ${prefix.at(-1).toUpperCase()}`;
    } else {
      const result = collisionVisual({ kind, progress, idPrefix: `${prefix}-effect`, pose: { still } });
      for (const frame of result.frames) {
        const image = document.createElement('img'); image.src = frame.asset; image.alt = ''; image.className = kind === 'injury' ? 'fixture-bandage' : 'fixture-art cue-image';
        if (kind === 'injury') { image.style.cssText='position:absolute;width:32%;height:32%;left:41%;top:39%;pointer-events:none'; body.append(image); }
        else { image.style.width = `${frame.width*40}%`; image.style.left = `${50+frame.x*40}%`; image.style.top = `${50+frame.y*40}%`; image.style.opacity = frame.opacity; image.style.transform = `translate(-50%,-50%) scale(${frame.scaleX},${frame.scaleY})`; stage.append(image); }
      }
      if (result.whiteMix) { for (const [key,value] of Object.entries(colors)) root.style.setProperty(key,`color-mix(in srgb, ${value} ${(1-result.whiteMix)*100}%, white)`); svg.style.filter='drop-shadow(1px 0 #334155) drop-shadow(-1px 0 #334155) drop-shadow(0 1px #334155)'; }
    }
  }
  document.querySelector('#status').textContent = progress === null ? 'Fixture cleared.' : `${kind}: ${still ? 'static' : `progress ${progress.toFixed(2)}`}`;
}
const timeline = createTimeline(render);
let frame = null, last = null;
function animate(now) { if (!timeline.snapshot().playing) return; if (last !== null) timeline.step((now-last)/previewDurationMs(select.value)); last=now; frame=requestAnimationFrame(animate); }
document.querySelector('#play').addEventListener('click', () => { if (!timeline.snapshot().playing) { timeline.play(); last=null; frame=requestAnimationFrame(animate); } });
document.querySelector('#pause').addEventListener('click', () => { timeline.pause(); if (frame !== null) cancelAnimationFrame(frame); frame=null; });
document.querySelector('#clear').addEventListener('click', () => { timeline.pause(); if (frame !== null) cancelAnimationFrame(frame); frame=null; render(null); });
slider.addEventListener('input', () => timeline.seek(Number(slider.value)));
for (const control of [select,document.querySelector('#still')]) control.addEventListener('change', () => { last=null; timeline.seek(Number(slider.value)); });
window.addEventListener('pagehide', () => { if (frame !== null) cancelAnimationFrame(frame); timeline.dispose(); }, { once: true });
timeline.seek(.5);
