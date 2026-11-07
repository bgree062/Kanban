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
// Each scenario is original teaching content, with choices and explicit simulated effects.
// An event may disrupt the board; a decision can deliberately break a policy so the
// consequences can be observed before the facilitator gives any coaching guidance.
export const SCENARIO_TEMPLATES = [
 {key:'urgent',title:'Unexpected urgent request',category:'Demand',kind:'decision',story:'A stakeholder asks for urgent work while the team already has commitments.',prompt:'How will the team handle the incoming request?',choices:[['protect','Accept it into the normal queue'],['prioritize','Mark it urgent in the queue']]},
 {key:'dependency',title:'External dependency',category:'Dependency',kind:'disruption',story:'A task cannot continue until another group provides a critical answer.',prompt:'How will the team make the dependency visible?',choices:[['coordinate','Record the blocker and contact the other group'],['swarm','Record the blocker and arrange a joint follow-up']]},
 {key:'capacity',title:'Reduced capacity',category:'Capacity',kind:'disruption',story:'One teammate cannot progress their own work today, but may still help colleagues when a legal help action exists.',prompt:'How will the team respond?',choices:[['focus','Focus on helping existing work finish'],['replan','Discuss a short-term capacity plan']]},
 {key:'quality',title:'Defect discovered after completion',category:'Quality',kind:'decision',story:'A customer reports a defect in an item already marked Done.',prompt:'How will the team make the corrective work visible?',choices:[['return','Move the completed ticket back into Review'],['bug','Create a new bug ticket linked to the completed item']]},
 {key:'forecast',title:'Stakeholder asks for a forecast',category:'Forecast',kind:'learning',story:'A stakeholder needs an estimate of how much work will finish before the phase ends.',prompt:'How will the team communicate uncertainty?',choices:[['range','Discuss evidence and provide a range'],['target','Provide a single aspirational delivery target']]},
 {key:'policy',title:'Starting work at capacity',category:'Policy',kind:'decision',story:'Someone suggests starting one more item, even though Working On may already be full.',prompt:'How will the team respond to the pressure?',choices:[['respect','Keep the WIP agreement and queue the request'],['override','Start one additional item now, even if WIP is exceeded']]},
 {key:'demand',title:'New customer request',category:'Intake',kind:'disruption',story:'A new customer request arrives while the team is handling other work.',prompt:'How will the team acknowledge this demand?',choices:[['queue','Add the request to To-Do'],['replenish','Add it to To-Do and review priorities together']]},
 {key:'blocker',title:'Work unexpectedly stalls',category:'Flow',kind:'disruption',story:'An active task cannot move forward without new information.',prompt:'What should the team do?',choices:[['signal','Make the blocker visible'],['help','Make the blocker visible and arrange help']]},
 {key:'review_overload',title:'Review queue is congested',category:'Flow',kind:'decision',story:'A teammate wants to hand off a task into Review, which may already be at its limit.',prompt:'Do you respect the Review WIP limit or push the handoff through?',choices:[['respect','Keep it in Working On until Review has capacity'],['push','Push it into Review now, even if it exceeds WIP']]},
 {key:'hidden_work',title:'An untracked request',category:'Visibility',kind:'decision',story:'A small piece of work is happening informally and does not appear on the board.',prompt:'How will the team handle this invisible demand?',choices:[['surface','Create a ticket so it is visible'],['hide','Continue handling it outside the board']]},
 {key:'surge',title:'Demand surge',category:'Demand',kind:'disruption',story:'Three additional customer requests arrive together. The team cannot prevent their arrival.',prompt:'How will the team manage the surge?',choices:[['queue','Record all three in To-Do'],['push','Start one immediately and queue the rest, even if WIP is full']]},
 {key:'aging',title:'An aging blocked item',category:'Service',kind:'decision',story:'A blocked item has been waiting longer than the team expected.',prompt:'What will the team try?',choices:[['escalate','Escalate and resolve the oldest blocker with help'],['wait','Keep the blocker visible and wait for a response']]},
 {key:'split',title:'A large item is difficult to finish',category:'Work design',kind:'decision',story:'A customer request in To-Do appears too large to deliver in one piece.',prompt:'How will the team represent the work?',choices:[['split','Split the request into two smaller linked items'],['keep','Keep the original item and discuss its size']]},
 {key:'late_feedback',title:'Feedback arrives late',category:'Quality',kind:'disruption',story:'An item in Review needs an answer before it can be accepted.',prompt:'How should the team respond?',choices:[['signal','Block the item while awaiting feedback'],['coordinate','Block the item and organize a quick clarification']]},
 {key:'priority',title:'Competing priorities',category:'Demand',kind:'decision',story:'Two stakeholders each believe their new request should go first.',prompt:'How will the team manage the conflicting expectations?',choices:[['visible','Create two visible requests for replenishment'],['expedite','Create two requests and designate one urgent']]},
 {key:'expedite',title:'Expedite request at full WIP',category:'Service',kind:'decision',story:'An important request is called an emergency just as work is piling up.',prompt:'What policy will the team use?',choices:[['queue','Mark the request urgent but respect WIP'],['bypass','Start the urgent request immediately, possibly breaching WIP']]},
 {key:'handoff',title:'A handoff needs clarification',category:'Collaboration',kind:'learning',story:'An item moving toward Review has ambiguous acceptance expectations.',prompt:'What should the team discuss?',choices:[['clarify','Clarify acceptance expectations before handoff'],['assume','Proceed with existing assumptions and monitor the outcome']]},
 {key:'risk',title:'Risk is discovered midstream',category:'Risk',kind:'decision',story:'A new business risk affects an item already in progress.',prompt:'What is the most useful response for the team?',choices:[['flag','Flag the risk on an active item for immediate attention'],['discuss','Discuss the risk but do not update the board']]},
 {key:'swarm_event',title:'Another team offers to help',category:'Collaboration',kind:'decision',story:'An external colleague has offered to help remove a blocker.',prompt:'How will the team use the offer?',choices:[['resolve','Use the assistance to unblock an item'],['decline','Decline for now and keep the current work arrangement']]},
 {key:'scope',title:'A follow-up feature is requested',category:'Scope',kind:'decision',story:'A stakeholder asks for an additional enhancement related to an active item.',prompt:'How should the team show this additional work?',choices:[['ticket','Create a separate linked backlog item'],['absorb','Expand the active item without recording new demand']]}
];
// One scenario per day. Each ten-day phase receives ten distinct, seeded events.
// Quality and disruptive scenarios are spread throughout, not hard-coded to a single day.
export function makeScenarios(seed) {
 const r=rng(seed+917);
 return Array.from({length:3},(_,phase)=>{
   const candidates=shuffle(SCENARIO_TEMPLATES,r).slice(0,10);
   // Avoid requiring a completed item or a mature flow on the very first day.
   const earlyRestricted=new Set(['quality','aging','review_overload','late_feedback','swarm_event']);
   if(earlyRestricted.has(candidates[0].key)){
     const swap=candidates.findIndex((s,i)=>i>0&&!earlyRestricted.has(s.key));
     if(swap>0)[candidates[0],candidates[swap]]=[candidates[swap],candidates[0]];
   }
   return candidates.map((scenario,i)=>({...scenario,token:`${phase+1}.${i+1}`,day:phase*10+i+1}));
 }).flat();
}
export const phaseForDay = day => Math.min(3,Math.floor((day-1)/10)+1);
export const localDay = day => (day-1)%10;
export function limitFor(state) {return state.settings[phaseForDay(state.day)-1]?.wip||3;}
// Backlog order is explicit and independent of work status. New intake is appended.
export function orderedBacklog(state) {
 const queue=state.tasks.filter(t=>t.status===0);
 const ranks=new Map((state.backlogOrder||[]).map((id,i)=>[id,i]));
 return [...queue].sort((a,b)=>(ranks.get(a.id)??Number.MAX_SAFE_INTEGER)-(ranks.get(b.id)??Number.MAX_SAFE_INTEGER) || a.id-b.id);
}
export function reorderBacklog(state,id,newIndex){
 if(state.gate!=='replenishment')return state;
 const ids=orderedBacklog(state).map(t=>t.id),old=ids.indexOf(id);
 if(old<0||newIndex<0||newIndex>=ids.length||old===newIndex)return state;
 ids.splice(old,1);ids.splice(newIndex,0,id);
 const next=structuredClone(state);next.backlogOrder=ids;
 return next;
}
export function completeReplenishment(state,note=''){
 if(state.gate!=='replenishment')return state;
 const next=structuredClone(state);
 const top=orderedBacklog(next).slice(0,5).map(t=>`#${t.id}`).join(', ');
 const reason=String(note||'').trim().slice(0,500);
 next.events.push({day:next.day,who:null,text:`Replenishment (${next.replenishmentSource==='phase'?'phase start':'scenario response'}) · Priority order: ${top||'no backlog'}${reason?' · Rationale: '+reason:''}`,replenishment:true,reason});
 next.gate=next.replenishmentReturn||'scenario';next.replenishmentReturn=null;next.replenishmentSource=null;
 return next;
}
// Scenario changes that justify an immediate, optional replenishment conversation.
export const REPLENISHMENT_SCENARIOS=new Set(['urgent','demand','surge','priority','expedite','hidden_work','split','scope']);
export function tally(tasks) {return {backlog:tasks.filter(t=>t.status===0).length,working:tasks.filter(t=>t.status===1).length,review:tasks.filter(t=>t.status===2).length,done:tasks.filter(t=>t.status===3).length,blocked:tasks.filter(t=>t.blocked).length,urgent:tasks.filter(t=>t.urgent&&t.status!==3).length};}
export function completedPlayers(state) {return Object.keys(state.turns||{}).filter(p=>state.turns[p]?.done).length;}
export function cardFor(state,p) {return state.cards[localDay(state.day)]?.[p-1];}
export function legal(state,p) {
 if(state.gate!=='play'||!p||p<1||p>state.players)return [];
 const turn=state.turns[p]||{done:false,step:'block'};
 if(turn.done)return [];
 const {tasks}=state, wip=limitFor(state), counts=tally(tasks), freeWorking=counts.working<wip,freeReview=counts.review<wip;
 const own=tasks.filter(t=>t.owner===p && [1,2].includes(t.status));
 const activeOwn=own.filter(t=>!t.blocked);
 const ownActions=own.flatMap(t=>t.blocked?[{type:'unblock',id:t.id}]:t.status===2||freeReview?[{type:'advance',id:t.id}]:[]);
 const queue=orderedBacklog(state);
 // Only the highest-priority backlog item is eligible for a normal pull.
 // An explicit, logged exception can be used to select a lower-priority item.
 const pulls=freeWorking&&queue.length?[{type:'pull',id:queue[0].id}]:[];
 const help=tasks.filter(t=>t.owner!==null&&t.owner!==p&&[1,2].includes(t.status)).flatMap(t=>t.blocked?[{type:'helpUnblock',id:t.id}]:t.status===2||freeReview?[{type:'helpAdvance',id:t.id}]:[]);
 // Reduced-capacity scenario: this person cannot start or advance their own tasks,
 // but can still help another player (for example, unblock their work).
 // Blocked work still counts toward WIP; help never bypasses review capacity.
 if(state.unavailable===p)return help.length?help:[{type:'pass',id:null}];
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
// Explicitly justify bypassing the highest-priority item. Never bypass WIP/card rules.
export function pullWithException(state,p,id,reason){
 const text=String(reason||'').trim();
 if(text.length<5||text.length>500)return state;
 const queue=orderedBacklog(state);
 if(!queue.some(t=>t.id===id)||queue[0]?.id===id)return state;
 if(!legal(state,p).some(a=>a.type==='pull'))return state;
 const next=structuredClone(state);
 const t=next.tasks.find(t=>t.id===id);
 t.status=1;t.owner=p;t.started=next.day;
 const turn=next.turns[p]||{done:false,step:'block'};
 turn.done=true;next.turns[p]=turn;
 next.events.push({day:next.day,who:p,text:`Pull priority exception · Task #${id} was selected instead of #${queue[0].id} · Reason: ${text}`,priorityException:true,reason:text});
 return next;
}
export function phaseMetric(state, phase){
 const end=(phase*10),snap=state.snapshots.find(x=>x.day===end), phaseSnap=state.snapshots.filter(x=>x.day>=(phase-1)*10+1&&x.day<=end);
 const completed=snap?.counts.done??0;const lead=snap? snap.tasks.filter(t=>t.status===3&&t.started!==null).map(t=>t.finished-t.started+1):[];
 const sorted=[...lead].sort((a,b)=>a-b);const percentile=p=>sorted.length?sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)]:null;
 return {completed,rate:completed/10,blocked:snap?.counts.blocked??0,wip:(snap?.counts.working??0)+(snap?.counts.review??0),backlog:snap?.counts.backlog??0,leadAverage:lead.length?lead.reduce((a,b)=>a+b,0)/lead.length:null,p85:percentile(.85),daily:phaseSnap.map(x=>({day:x.day-(phase-1)*10,done:x.counts.done})),events:state.events.filter(x=>x.day>(phase-1)*10&&x.day<=end).length};
}
export function createGame(players,names,seed=Date.now()%1000000000){const tasks=newTasks(1);return {version:1,players,names:names.slice(0,players).map((n,i)=>n.trim()||`Player ${i+1}`),seed,day:1,gate:'phase-setup',cards:makeDeck(seed,players),scenarios:makeScenarios(seed),tasks,turns:{},settings:[null,null,null],reflect:[null,null,null],events:[],snapshots:[],unavailable:null,scenarioDecision:null,backlogOrder:tasks.map(t=>t.id),replenishmentReturn:null,replenishmentSource:null};}
export function choosePhase(state,wip,practice,reason){const next=structuredClone(state),idx=phaseForDay(next.day)-1;next.settings[idx]={wip,practice,reason};next.gate='replenishment';next.replenishmentReturn='scenario';next.replenishmentSource='phase';return next;}
export function resolveScenario(state,decision){
 if(state.gate!=='scenario')return state;
 const sc=state.scenarios[state.day-1];
 if(!sc||!sc.choices.some(([choice])=>choice===decision))return state;
 const next=structuredClone(state),r=rng(next.seed*11+next.day*131);
 const active=next.tasks.filter(t=>[1,2].includes(t.status)&&!t.blocked);
 const completed=next.tasks.filter(t=>t.status===3);
 const working=next.tasks.filter(t=>t.status===1&&!t.blocked);
 const reviewed=next.tasks.filter(t=>t.status===2);
 const blocked=next.tasks.filter(t=>t.blocked&&[1,2].includes(t.status));
 const wip=limitFor(next);
 let change='Discussion recorded. No work item moved.';
 const select=items=>items.length?items[Math.floor(r()*items.length)]:null;
 const newItem=(title,opts={})=>{
   const id=Math.max(0,...next.tasks.map(t=>t.id))+1;
   const t={id,title,status:0,owner:null,blocked:false,started:null,finished:null,urgent:false,blockedSince:null,rework:0,...opts};
   next.tasks.push(t);return t;
 };
 const startWork=t=>{t.status=1;t.owner=1+Math.floor(r()*next.players);t.started=next.day;};
 const addBlock=t=>{t.blocked=true;t.blockedSince=next.day;};
 const queueText=(n)=>`${n} ${n===1?'new ticket':'new tickets'} added to To-Do.`;
 const wipText=(column)=>{
   const count=next.tasks.filter(t=>t.status===column).length;
   return `${column===1?'Working On':'Review'} now has ${count}/${wip}${count>wip?' — ABOVE WIP LIMIT':''}.`;
 };
 switch(sc.key){
  case 'urgent':{
   const t=newItem('Unexpected customer request',{urgent:decision==='prioritize'});
   change=`Request #${t.id} added to To-Do${t.urgent?' and marked urgent':''}. Existing WIP rules still apply.`;break;
  }
  case 'demand':{
   newItem('Incoming customer request');change=`${queueText(1)} Replenishment discussion ${decision==='replenish'?'agreed':'not requested'}.`;break;
  }
  case 'dependency':case 'blocker':{
   const t=select(active);if(t){addBlock(t);change=`Task #${t.id} became blocked. ${decision==='swarm'||decision==='help'?'Help or coordination was requested.':'The blocker was recorded.'} The task counts toward WIP.`;}else change='No eligible active unblocked task. The team recorded the disruption without changing a ticket.';break;
  }
  case 'capacity':{
   next.unavailable=1+Math.floor(r()*next.players);change=`${next.names[next.unavailable-1]} cannot advance their own work today but may help teammates when legal. ${decision==='replan'?'A capacity conversation was recorded.':'The team chose to focus on current work.'}`;break;
  }
  case 'quality':{
   const source=select(completed);
   if(source){
    if(decision==='return'){
     source.status=2;source.finished=null;source.rework=(source.rework||0)+1;
     change=`Task #${source.id} moved backward from Done into Review. ${wipText(2)} Previously reported completion is reversed; the original lead time now includes rework.`;
    }else{
     const bug=newItem(`Bug: Defect in Task ${source.id}`,{type:'bug',sourceId:source.id});
     change=`Linked bug #${bug.id} added to To-Do. Original Task #${source.id} remains Done; corrective work enters by normal WIP rules.`;
    }
   }else change='No Done item exists yet. The team discussed both options; no ticket could be selected.';
   break;
  }
  case 'forecast':{
   change=decision==='range'?'The team recorded an evidence-based range with uncertainty. No board changes.':'The team recorded a single aspirational target; the risk of certainty without sufficient evidence will be revisited at reflection.';break;
  }
  case 'policy':{
   if(decision==='override'){
    const t=select(next.tasks.filter(t=>t.status===0));if(t){startWork(t);change=`Task #${t.id} started outside the normal card actions. ${wipText(1)} Observe the impact of starting another item.`;}else change='No available To-Do ticket exists to start.';
   }else change='The team kept the WIP agreement. No ticket was started outside the card rules.';
   break;
  }
  case 'review_overload':{
   const t=select(working);
   if(decision==='push'&&t){t.status=2;change=`Task #${t.id} was pushed into Review outside the normal card action. ${wipText(2)} Observe how handoffs affect queue pressure.`;}
   else change=decision==='push'?'No eligible Working On ticket was available to hand off.':'The team respected the Review WIP limit and did not push a new ticket.';
   break;
  }
  case 'hidden_work':{
   if(decision==='surface'){const t=newItem('Previously untracked request');change=`Hidden demand is now visible as Task #${t.id} in To-Do.`;}
   else change='Work remains untracked outside the board. Flow metrics will not capture this hidden demand.';
   break;
  }
  case 'surge':{
   const added=[newItem('Surge request A'),newItem('Surge request B'),newItem('Surge request C')];
   if(decision==='push'){startWork(added[0]);change=`Three requests arrived. Task #${added[0].id} started immediately outside card rules; two remain in To-Do. ${wipText(1)}`;}
   else change='Three requests were added to To-Do. Existing WIP limits remain in place.';
   break;
  }
  case 'aging':{
   const t=[...blocked].sort((a,b)=>(a.blockedSince??999)-(b.blockedSince??999))[0];
   if(!t){change='No blocked item was present. The team discussed how to detect aging work.';}
   else if(decision==='escalate'){t.blocked=false;t.blockedSince=null;change=`Escalation resolved the blocker on Task #${t.id}; the ticket remains in its current column.`;}
   else change=`Task #${t.id} remains blocked. The team chose to wait, so its age continues accumulating.`;
   break;
  }
  case 'split':{
   const t=select(next.tasks.filter(t=>t.status===0));
   if(decision==='split'&&t){t.title+=' · Part A';const n=newItem(`Part B of Task ${t.id}`,{parentId:t.id});change=`Task #${t.id} was split into two linked backlog items (#${t.id} and #${n.id}). This changes item counts; assess whether each part delivers value independently.`;}
   else change=decision==='split'?'No backlog item is available to split.':'The item stayed intact; the team discussed its size.';
   break;
  }
  case 'late_feedback':{
   const t=select(reviewed.filter(t=>!t.blocked));if(t){addBlock(t);change=`Task #${t.id} is blocked in Review waiting for feedback and still counts toward WIP. ${decision==='coordinate'?'A clarification meeting was requested.':'The blocker was made visible.'}`;}
   else change='No unblocked Review item is available; the feedback risk was recorded.';
   break;
  }
  case 'priority':{
   const a=newItem('Stakeholder A request',{urgent:decision==='expedite'}),b=newItem('Stakeholder B request');
   change=`Requests #${a.id} and #${b.id} entered To-Do.${a.urgent?' The team marked one urgent.':' Neither request bypassed prioritization.'}`;break;
  }
  case 'expedite':{
   const t=newItem('Expedited customer request',{urgent:true});
   if(decision==='bypass'){startWork(t);change=`Urgent Task #${t.id} started directly, bypassing the normal card turn. ${wipText(1)} Normal work still competes for capacity.`;}
   else change=`Urgent Task #${t.id} entered To-Do; the team retained its WIP agreement.`;
   break;
  }
  case 'handoff':{
   change=decision==='clarify'?'The team clarified acceptance expectations before the next handoff. Discussion recorded.':'The team proceeded using assumptions. Discussion recorded; no automatic penalty is imposed.';break;
  }
  case 'risk':{
   const t=select(active);if(t&&decision==='flag'){t.risk=true;change=`Task #${t.id} was visibly flagged for risk review; its workflow position did not change.`;}
   else change='The team discussed risk without changing its board.';
   break;
  }
  case 'swarm_event':{
   const t=select(blocked);if(t&&decision==='resolve'){t.blocked=false;t.blockedSince=null;change=`Assistance removed the blocker on Task #${t.id}. The item remains in its current column.`;}
   else change=t?'The offer was declined; blocked work remains blocked.':'No blocked task is present; the offer was discussed only.';
   break;
  }
  case 'scope':{
   const t=select(next.tasks.filter(t=>[1,2].includes(t.status)));
   if(decision==='ticket'&&t){const follow=newItem(`Follow-up to Task ${t.id}`,{sourceId:t.id});change=`Follow-up Task #${follow.id} was added to To-Do and linked to active Task #${t.id}.`;}
   else if(decision==='absorb'&&t){t.scopeExpanded=(t.scopeExpanded||0)+1;change=`Task #${t.id} absorbed extra scope without adding a ticket. The board's item count did not reveal the increase.`;}
   else change='No active ticket was available; scope discussion recorded.';
   break;
  }
 }
 next.scenarioDecision={day:next.day,scenario:sc.key,decision,change,kind:sc.kind};
 next.events.push({day:next.day,who:null,text:`Scenario · ${sc.title}: ${decision} — ${change}`,scenarioKey:sc.key,scenarioKind:sc.kind,scenarioDecision:decision,scenarioDetail:change,...(sc.key==='quality'?{qualityDecision:decision,qualityDetail:change}:{})});
 next.gate=REPLENISHMENT_SCENARIOS.has(sc.key)?'replenishment':'play';
 if(next.gate==='replenishment'){next.replenishmentSource='scenario';next.replenishmentReturn='play';}
 return next;
}
export function endDay(state){if(state.gate!=='play'||completedPlayers(state)!==state.players)return state;
 const next=structuredClone(state);next.snapshots.push({day:next.day,tasks:structuredClone(next.tasks),counts:tally(next.tasks),wip:limitFor(next),scenario:next.scenarios[next.day-1].title,decision:next.scenarioDecision?.decision});
 if(next.day%10===0){next.gate='reflection';}else{next.day++;next.turns={};next.unavailable=null;next.scenarioDecision=null;next.gate='scenario';}
 return next;
}
export function submitReflection(state,reflection){if(state.gate!=='reflection')return state;const next=structuredClone(state),p=phaseForDay(next.day);next.reflect[p-1]=reflection;
 if(next.day===30){next.gate='finished';}else{next.day++;next.tasks=newTasks(p+1);next.backlogOrder=next.tasks.map(t=>t.id);next.turns={};next.unavailable=null;next.scenarioDecision=null;next.gate='phase-setup';}return next;
}
