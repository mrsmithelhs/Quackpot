// Shared factual copy for the irreversible schema-6 ability choice.
export function raceAbilityChoiceMarkup(surface) {
  if (!['race', 'dex'].includes(surface)) throw new RangeError('unknown ability-choice surface');
  const attribute = surface === 'race' ? 'data-assign-ability' : 'data-dex-assign';
  const buttonClass = surface === 'race' ? 'race-control-button' : 'btn btn-secondary';
  const prefix = `ability-${surface}`;
  return `<div class="${surface === 'race' ? 'race-ability-actions' : 'dex-ability-actions'}">
    <div><button type="button" class="${buttonClass}" ${attribute}="bounce" aria-describedby="${prefix}-bounce">Choose Bounce</button>
      <p id="${prefix}-bounce">When a contact threat is predicted, this duck may leap. It is protected from collision injury during the leap and landing; the ability does not guarantee avoiding contact or heal an injury.</p></div>
    <div><button type="button" class="${buttonClass}" ${attribute}="crowd" aria-describedby="${prefix}-crowd">Choose Crowd Surge</button>
      <p id="${prefix}-crowd">When nearby ducks are on the ground, this duck may gain acceleration. It activates independently and does not require the duck to be catching up.</p></div>
  </div>`;
}
