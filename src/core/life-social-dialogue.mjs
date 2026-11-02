// Finite Plan 46 dialogue graph, version 1. These are immutable story facts, not balance rules.
const choice=(id,label,next)=>Object.freeze({id,label,next});
const node=(text,choices,setting)=>Object.freeze({text,choices:Object.freeze(choices),setting});
const next=target=>[choice('continue','Continue',target)];
const lines={
  'c0':node('how’s your day going?',[choice('busy','A little busy. How about yours?','c-busy'),choice('making','Tell me what you’ve been making.','c-making')]),
  'c-busy':node('same here. i’m glad we found a minute.',[choice('me-too','Me too','c-busy-a'),choice('break','It’s nice to take a break','c-busy-b')]),
  'c-making':node('i’ve been tinkering. half the fun is figuring out what to try next.',[choice('why','What do you enjoy about it?','c-making-a'),choice('fun','That sounds fun','c-making-b')]),
  'c-busy-a':node('me too.',next('c-end')),'c-busy-b':node('a break sounds like a solid plan.',next('c-end')),
  'c-making-a':node('when something finally fits together. even better when i can figure out why.',next('c-end')),
  'c-making-b':node('usually. the stubborn bits make the good bits better.',next('c-end')),
  'c-end':node('i should get going. glad we had a minute.',[choice('finish','Finish the visit',null)]),
  'g0':node('i remember the rules being simpler than this. possibly because i was winning.',[choice('tease','I think you’re remembering it wrong','g-tease'),choice('together','Want to figure them out together?','g-together')]),
  'g-tease':node('that’s a serious accusation. do you have evidence?',[choice('convenient','That sounds very convenient','g-tease-a'),choice('memory','Your memory is suspicious','g-tease-b')]),
  'g-together':node('yes, please. i was hoping one of us had read them.',[choice('learn','We can learn as we go','g-together-a'),choice('basics','Let’s start with the basics','g-together-b')]),
  'g-tease-a':node('inconclusive. we’ll need a rematch.',next('g-end')),'g-tease-b':node('my memory has an excellent reputation. according to me.',next('g-end')),
  'g-together-a':node('excellent. confusion is better with company.',next('g-end')),'g-together-b':node('good plan. we can take it one step at a time.',next('g-end')),
  'g-end':node('good game. we should do that again sometime.',[choice('finish','Finish the evening',null)]),
  'r-apology':node('thanks for saying that. i didn’t know what happened.',[choice('tell','I should have told you','r-apology-a'),choice('better','I’d like to do better','r-apology-b')]),
  'r-reconnect':node('i’d like us to make a plan we can both count on.',[choice('steps','Let’s take it one step at a time','r-reconnect-a'),choice('honest','Thanks for being honest','r-reconnect-b')]),
  'r-apology-a':node('a message next time would help.',next('r-end')),'r-apology-b':node('we can take it one plan at a time.',next('r-end')),
  'r-reconnect-a':node('works for me.',next('r-end')),'r-reconnect-b':node('thanks for asking.',next('r-end')),
  'r-end':node('i’m glad we talked.',[choice('finish','Finish the visit',null)]),
  'g-cue':node('i dressed for a pajama game night. comfort is a competitive advantage.',next('g0')),
};
const prefix=Object.freeze({door:'c',game:'g',repair:'r'});
const entries=Object.freeze({
 door:{hello:'hey. good to see you.',a:'Good to see you too',b:'How are you?',replyA:'you too.',replyB:'pretty good. glad we could catch up.'},
 game:{hello:'glad we could do this. i brought the game.',a:'Come on in',b:'Ready to play?',replyA:'thanks for having me.',replyB:'as ready as i’m going to be.'},
 repair:{hello:'hey. thanks for asking me over.',a:'I’d like to talk',b:'Thanks for coming',replyA:'okay. i’m listening.',replyB:'of course.'},
});
export function renGraphNode(activity,id,seating,hasBreak=false) {
 const info=entries[activity];if(!info||!['door','couch','floor'].includes(seating))return null;
 const root=activity==='door'?'c0':activity==='repair'?'r0':seating==='couch'?'g-cue':'g0';
 if(id==='s0')return node(info.hello,[choice('a',info.a,'s1a'),choice('b',info.b,'s1b')],'door');
 if(id==='s1a'||id==='s1b')return node(id==='s1a'?info.replyA:info.replyB,next(root),'door');
 if(id==='r0'&&activity==='repair')return node('we can take a little time and figure this out together.',[choice('reconnect','How can we reconnect?','r-reconnect'),...(hasBreak?[choice('apology','I’m sorry I missed our plan','r-apology')]:[])]);
 if(typeof id!=='string'||!id.startsWith(prefix[activity]+'-')&&id!==prefix[activity]+'0')return null;
 const value=lines[id];if(!value||(id==='g-cue'&&seating!=='couch')||(id.startsWith('r-apology')&&!hasBreak))return null;
 return value;
}
export const REN_RESPONSE_LINES=Object.freeze({
 response_declined:Object.freeze({thanks:'of course.',good:'see you around.'}),
 response_notice:Object.freeze({thanks:'of course.',appreciate:'we’ll find another time.'}),
 response_broken:Object.freeze({sorry:'thanks for saying so.',talk:'yeah. let me know when works.'}),
});
export const REN_RESPONSE_CHOICES=Object.freeze({
 response_declined:Object.freeze([Object.freeze(['thanks','Thanks for understanding']),Object.freeze(['good','Sounds good'])]),
 response_notice:Object.freeze([Object.freeze(['thanks','Thanks for understanding']),Object.freeze(['appreciate','I appreciate it'])]),
 response_broken:Object.freeze([Object.freeze(['sorry','I’m sorry I missed it']),Object.freeze(['talk','Can we talk later?'])]),
});
