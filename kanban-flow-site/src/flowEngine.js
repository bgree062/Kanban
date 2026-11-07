/* Flow Evolution Lab — original learning simulation engine. No KMM content. */
export const COLUMNS = ['To-Do', 'Working on', 'Review', 'Done'];
export const PHASES = [
  { name: 'Observe the System', skill: 'Explicit policies and work selection', description: 'Choose WIP limits, make working agreements visible and learn what disrupts flow.' },
  { name: 'Respond to Demand', skill: 'Replenishment and urgent-work handling', description: 'Experiment with prioritization under shifting demand without ignoring WIP.' },
  { name: 'Evolve the System', skill: 'Swarming, forecasting and adaptation', description: 'Respond to dependencies and use evidence to choose your next improvement.' }
];
export const WIP_OPTIONS = capacity => capacity === 5 ? [2,3,4,5] : [2,3,4];
const SUITS = ['♥','♦','♣','♠'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export function rng(seed) { let s=seed>>>0;return () => {s=(1664525*s+1013904223)>>>0;return s/4294967296;}; }
export function shuffle(items, random) {let a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeDeck(seed,capacity) {
 const r=rng(seed+31), full=shuffle(SUITS.flatMap(suit=>RANKS.map(rank=>({suit,rank,red:suit==='♥'||suit==='♦'}))),r);
 return Array.from({length:10},(_,day)=>Array.from({length:capacity},(_,p)=>full[(day*capacity+p)%full.length]));
}
export function newTasks(phase) {return Array.from({length:30},(_,i)=>({id:(phase-1)*100+i+1,title:`Task ${i+1}`,status:0,owner:null,blocked:false,started:null,finished:null,urgent:false,blockedSince:null,rework:0}));}
export const SCENARIO_TEMPLATES = [
 {key:'urgent',title:'Unexpected urgent request',category:'Demand',story:'A stakeholder asks for urgent work while the team already has commitments.',prompt:'How will the team handle this request?',choices:[['protect','Protect current commitments'],['prioritize','Add it to the priority queue']]},
 {key:'dependency',title:'External dependency',category:'Dependency',story:'An active task is waiting for another group to provide a critical answer.',prompt:'What will the team do about the dependency?',choices:[['coordinate','Make the blocker visible and coordinate'],['swarm','Make the blocker visible and prioritize help']]},
 {key:'capacity',title:'Reduced capacity',category:'Capacity',story:'A teammate is unavailable for today; assuming everyone is always at full capacity is risky.',prompt:'How will the team adapt?',choices:[['focus','Finish what is already in progress'],['replan','Replan today’s work together']]},
 {key:'quality',title:'Rework discovered',category:'Quality',story:'A completed item needs more attention after a defect is found.',prompt:'How will the team respond?',choices:[['review','Bring it back into Review'],['discuss','Bring it back and discuss quality policies']]},
 {key:'forecast',title:'Stakeholder asks for a forecast',category:'Forecast',story:'Someone asks how much work can be finished by the end of the phase.',prompt:'Which expectation will the team set?',choices:[['range','Use observed evidence and uncertainty'],['target','Commit to an aspirational target']]},
 {key:'policy',title:'Policy under pressure',category:'Policy',story:'A teammate proposes starting additional work even though the workflow is crowded.',prompt:'What does the team decide?',choices:[['respect','Respect the agreed WIP policy'],['revisit','Discuss changing the policy at reflection']]},
 {key:'demand',title:'New work arrives',category:'Intake',story:'Another customer request arrives. The team must decide how to acknowledge it.',prompt:'What should happen next?',choices:[['queue','Add it to the ordinary queue'],['replenish','Revisit prioritization together']]},
 {key:'blocker',title:'Work unexpectedly stalls',category:'Flow',story:'An active task cannot progress without new information.',prompt:'How should the team respond?',choices:[['signal','Signal and track the blocker'],['help','Find out who can help resolve it']]}
];
export function makeScenarios(seed) {const r=rng(seed+917);return Array.from({length:3},(_,phase)=>{
  const indexes=shuffle([0,1,2,3,4,5,6,7,0,1],r);
  return indexes.map((idx,i)=>({...SCENARIO_TEMPLATES[idx],token:`${phase+1}.${i+1}`,day:phase*10+i+1}));
 }).flat();}
export const phaseForDay = day => Math.min(3,Math.floor((day-1)/10)+1);
export const localDay = day => (day-1)%10;
export function limitFor(state) {return state.settings[phaseForDay(state.day)-1]?.wip||3;}
export function tally(tasks) {return {backlog:tasks.filter(t=>t.status===0).length,working:tasks.filter(t=>t.status===1).length,review:tasks.filter(t=>t.status===2).length,done:tasks.filter(t=>t.status===3).length,blocked:tasks.filter(t=>t.blocked).length,urgent:tasks.filter(t=>t.urgent&&t.status!==3).length};}
export function completedPlayers(state) {return Object.keys(state.turns||{}).filter(p=>state.turns[p]?.done).length;}
export function cardFor(state,p) {return state.cards[localDay(state.day)]?.[p-1];}
export function legal(state,p) {
 if(state.gate!=='play'||!p||p<1||p>state.players)return [];
 const turn=state.turns[p]||{done:false,step:'block'};
 if(turn.done)return [];
 if(state.unavailable===p)return [{type:'pass',id:null}];
 const {tasks}=state, wip=limitFor(state), counts=tally(tasks), freeWorking=counts.working<wip,freeReview=counts.review<wip;
 const own=tasks.filter(t=>t.owner===p && [1,2].includes(t.status));
 const activeOwn=own.filter(t=>!t.blocked);
 const ownActions=own.flatMap(t=>t.blocked?[{type:'unblock',id:t.id}]:t.status===2||freeReview?[{type:'advance',id:t.id}]:[]);
 let pulls=freeWorking?tasks.filter(t=>t.status===0).map(t=>({type:'pull',id:t.id})):[];
 // A replenishment policy makes urgent work first in queue, but never bypasses WIP.
 if(state.settings[phaseForDay(state.day)-1]?.practice==='replenishment' && pulls.some(x=>tasks.find(t=>t.id===x.id)?.urgent)) {
   pulls=pulls.filter(x=>tasks.find(t=>t.id===x.id)?.urgent);
 }
 const help=tasks.filter(t=>t.owner!==null&&t.owner!==p&&[1,2].includes(t.status)).flatMap(t=>t.blocked?[{type:'helpUnblock',id:t.id}]:t.status===2||freeReview?[{type:'helpAdvance',id:t.id}]:[]);
 const special=state.settings[phaseForDay(state.day)-1]?.practice==='swarm';
 const card=cardFor(state,p);
 if(card?.red){let a=[...ownActions,...pulls];if(!a.length||special)a=[...a,...help];return a.length?a:[{type:'pass',id:null}];}
 if(turn.step==='block'){
   const blocks=activeOwn.map(t=>({type:'block',id:t.id}));if(blocks.length)return blocks;
 }
 // Black card step 2: pulling available work is mandatory; helping is a fallback only when pulling is impossible.
 if(pulls.length)return pulls;
 return help.length?help:[{type:'pass',id:null}];
}
export function canDrop(state,p,id,status){const task=state.tasks.find(t=>t.id===id);if(!task)return null;
 const options=legal(state,p), next=task.status+1;
 if(next!==status)return null;
 const types=status===1?['pull']:['advance','helpAdvance'];return options.find(a=>a.id===id&&types.includes(a.type))||null;
}
export function takeAction(state,p,type,id){const permitted=legal(state,p).some(a=>a.type===type&&a.id===id);if(!permitted)return state;
 const next=structuredClone(state),turn=next.turns[p]||{done:false,step:'block'};
 const card=cardFor(next,p), t=next.tasks.find(x=>x.id===id);
 if(t){
  if(type==='pull'){t.status=1;t.owner=p;t.started=next.day;}
  if(['advance','helpAdvance'].includes(type)){t.status+=1;if(t.status===3)t.finished=next.day;}
  if(type==='block'){t.blocked=true;t.blockedSince=next.day;}
  if(['unblock','helpUnblock'].includes(type)){t.blocked=false;t.blockedSince=null;}
 }
 if(!card.red && type==='block')turn.step='pull';else turn.done=true;
 next.turns[p]=turn;
 const label=type==='pass'?'No legal move':`${type.replace(/([A-Z])/g,' $1')} · Task ${id}`;
 next.events.push({day:next.day,who:p,text:label});
 return next;
}
export function phaseMetric(state, phase){
 const end=(phase*10),snap=state.snapshots.find(x=>x.day===end), phaseSnap=state.snapshots.filter(x=>x.day>=(phase-1)*10+1&&x.day<=end);
 const completed=snap?.counts.done??0;const lead=snap? snap.tasks.filter(t=>t.status===3&&t.started!==null).map(t=>t.finished-t.started+1):[];
 const sorted=[...lead].sort((a,b)=>a-b);const percentile=p=>sorted.length?sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)]:null;
 return {completed,rate:completed/10,blocked:snap?.counts.blocked??0,wip:(snap?.counts.working??0)+(snap?.counts.review??0),backlog:snap?.counts.backlog??0,leadAverage:lead.length?lead.reduce((a,b)=>a+b,0)/lead.length:null,p85:percentile(.85),daily:phaseSnap.map(x=>({day:x.day-(phase-1)*10,done:x.counts.done})),events:state.events.filter(x=>x.day>(phase-1)*10&&x.day<=end).length};
}
export function createGame(players,names,seed=Date.now()%1000000000){const tasks=newTasks(1);return {version:1,players,names:names.slice(0,players).map((n,i)=>n.trim()||`Player ${i+1}`),seed,day:1,gate:'phase-setup',cards:makeDeck(seed,players),scenarios:makeScenarios(seed),tasks,turns:{},settings:[null,null,null],reflect:[null,null,null],events:[],snapshots:[],unavailable:null,scenarioDecision:null};}
export function choosePhase(state,wip,practice,reason){const next=structuredClone(state),idx=phaseForDay(next.day)-1;next.settings[idx]={wip,practice,reason};next.gate='scenario';return next;}
export function resolveScenario(state,decision){if(state.gate!=='scenario')return state;
 const next=structuredClone(state),sc=next.scenarios[next.day-1],r=rng(next.seed*11+next.day*131);
 const active=next.tasks.filter(t=>[1,2].includes(t.status)&&!t.blocked);
 const completed=next.tasks.filter(t=>t.status===3);
 let change='Discussion recorded; no direct board change.';
 if(['urgent','demand'].includes(sc.key)){
   const max=Math.max(...next.tasks.map(t=>t.id)); const urgent=sc.key==='urgent'&&decision==='prioritize';
   next.tasks.push({id:max+1,title:urgent?'Urgent request':`Incoming request`,status:0,owner:null,blocked:false,started:null,finished:null,urgent,blockedSince:null,rework:0});
   change=urgent?'One urgent item joined the backlog. The selected policy may prioritize its pull, but WIP still applies.':'One item joined the normal backlog.';
 }else if(['dependency','blocker'].includes(sc.key)){
   if(active.length){const t=active[Math.floor(r()*active.length)];t.blocked=true;t.blockedSince=next.day;change=`Task ${t.id} became blocked. A legal unblock or help action is needed.`;}
   else change='No active unblocked task exists, so no new blocker was applied.';
 }else if(sc.key==='capacity'){
   next.unavailable=1+Math.floor(r()*next.players);change=`${next.names[next.unavailable-1]} is unavailable for today and can only pass.`;
 }else if(sc.key==='quality'){
   if(completed.length){const t=completed[Math.floor(r()*completed.length)];
    // A rework item returns to Review; WIP capacity can temporarily be exceeded, and subsequent moves must respect the limit.
    t.status=2;t.finished=null;t.rework++;change=`Task ${t.id} returned to Review for rework. Existing WIP rules still apply to future moves.`;
   } else change='No completed work to reopen yet; the team discusses its quality policy.';
 }
 next.scenarioDecision={day:next.day,decision,change};next.events.push({day:next.day,who:null,text:`Scenario · ${sc.title}: ${decision} — ${change}`});next.gate='play';return next;
}
export function endDay(state){if(state.gate!=='play'||completedPlayers(state)!==state.players)return state;
 const next=structuredClone(state);next.snapshots.push({day:next.day,tasks:structuredClone(next.tasks),counts:tally(next.tasks),wip:limitFor(next),scenario:next.scenarios[next.day-1].title,decision:next.scenarioDecision?.decision});
 if(next.day%10===0){next.gate='reflection';}else{next.day++;next.turns={};next.unavailable=null;next.scenarioDecision=null;next.gate='scenario';}
 return next;
}
export function submitReflection(state,reflection){if(state.gate!=='reflection')return state;const next=structuredClone(state),p=phaseForDay(next.day);next.reflect[p-1]=reflection;
 if(next.day===30){next.gate='finished';}else{next.day++;next.tasks=newTasks(p+1);next.turns={};next.unavailable=null;next.scenarioDecision=null;next.gate='phase-setup';}return next;
}
