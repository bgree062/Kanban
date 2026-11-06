import React,{useMemo,useState} from 'react';
import checkpoints from './flow-checkpoints.json';
import './kmm.css';

// Independently authored self-assessment. No third-party practice catalog is bundled.
const stages=[
  {name:'Discover',description:'Notice how work happens'},
  {name:'Align',description:'Make expectations visible'},
  {name:'Stabilize',description:'Support reliable completion'},
  {name:'Learn',description:'Use feedback to adjust'},
  {name:'Evolve',description:'Adapt across changing needs'}
];
const domains=[
  {code:'VIS',name:'Work visibility',group:'operational'},
  {code:'CAP',name:'Capacity choices',group:'operational'},
  {code:'MOV',name:'Work movement',group:'operational'},
  {code:'AGR',name:'Working agreements',group:'manager'},
  {code:'COO',name:'Coordination',group:'manager'},
  {code:'LRN',name:'Learning habits',group:'manager'},
  {code:'OUT',name:'Outcome signals',group:'metrics'}
];
const statusList=[
  {id:'observed',label:'Consistently observed'},
  {id:'emerging',label:'Sometimes observed'},
  {id:'absent',label:'Not yet observed'},
  {id:'unsure',label:'Not sure / Not relevant'}
];
const statusText=id=>statusList.find(s=>s.id===id)?.label||'Not assessed';
const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const download=(text,filename,mime)=>{const url=URL.createObjectURL(new Blob([text],{type:mime}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),3000)};
const FORMAT='kanban-flow-lab-independent-flow-assessment-v1';
export default function FlowAssessment(){
 const [team,setTeam]=useState('');
 const [answers,setAnswers]=useState({});
 const [notes,setNotes]=useState({});
 const [focus,setFocus]=useState({});
 const [plan,setPlan]=useState({});
 const [stage,setStage]=useState('all');
 const [domain,setDomain]=useState('all');
 const [search,setSearch]=useState('');
 const [tab,setTab]=useState('practices');
 const [view,setView]=useState('matrix');
 const [active,setActive]=useState(null);
 const [resetPrompt,setResetPrompt]=useState(false);
 const filtered=useMemo(()=>checkpoints.filter(p=>(stage==='all'||p.stage===Number(stage))&&(domain==='all'||p.domain===domain)&&(`${p.code} ${p.title}`.toLowerCase().includes(search.toLowerCase()))),[stage,domain,search]);
 const chosen=checkpoints.filter(p=>focus[p.id]);
 const count=Object.keys(answers).filter(k=>checkpoints.some(p=>p.id===k)).length;
 const item=checkpoints.find(p=>p.id===active);
 const modify=(setter,id,value)=>setter(old=>({...old,[id]:value}));
 const clear=()=>{setAnswers({});setNotes({});setFocus({});setPlan({});setResetPrompt(false);setActive(null)};
 const csv=()=>{
  const data=[['Team or service','Checkpoint','Stage','Theme','Original diagnostic question','Suggested evidence','Response','Evidence notes','Focus','Next experiment'],...checkpoints.map(p=>[team,p.code,stages[p.stage].name,domains.find(d=>d.code===p.domain).name,p.title,p.evidence,statusText(answers[p.id]),notes[p.id]||'',focus[p.id]?'Yes':'No',plan[p.id]||''])];
  download('\uFEFF'+data.map(r=>r.map(csvCell).join(',')).join('\r\n'),`flow-assessment-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8');
 };
 const save=()=>download(JSON.stringify({format:FORMAT,team,answers,notes,focus,plan},null,2),`flow-assessment-${new Date().toISOString().slice(0,10)}.json`,'application/json');
 const load=async(e)=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.format!==FORMAT)throw new Error('This file is not a compatible independent Flow Assessment. Older KMM assessment files cannot be imported automatically.');const ids=new Set(checkpoints.map(p=>p.id));const clean=o=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>ids.has(k)));setTeam(String(data.team||''));setAnswers(clean(data.answers));setNotes(clean(data.notes));setFocus(clean(data.focus));setPlan(clean(data.plan));}catch(err){alert(err.message||'Could not load the assessment file')}e.target.value='';};
 const assessor=p=><div className="kmm-detail-form" key={p.id}>
   <div><div className="kmm-detail-title"><div><span className="kmm-code">{p.code}</span> <span className="kmm-label">{stages[p.stage].name} · {domains.find(d=>d.code===p.domain).name}</span><h3>{p.title}</h3></div></div><p className="muted small-text"><b>Look for:</b> {p.evidence}</p><div className="kmm-statuses">{statusList.map(s=><label key={s.id} className={`flow-answer ${answers[p.id]===s.id?'selected':''}`}><input type="radio" name={`response-${p.id}`} checked={answers[p.id]===s.id} onChange={()=>modify(setAnswers,p.id,s.id)}/>{s.label}</label>)}</div></div>
   <label className="kmm-focus"><input type="checkbox" checked={!!focus[p.id]} onChange={e=>modify(setFocus,p.id,e.target.checked)}/> Improvement focus</label>
   <label className="kmm-notelabel">Evidence / discussion notes<textarea value={notes[p.id]||''} rows={3} onChange={e=>modify(setNotes,p.id,e.target.value)} placeholder="What happened in a real example? What evidence could change your interpretation?"/></label>
 </div>;
 return <div className="kmm-page flow-page" id="flow-assessment">
  <section className="kmm-hero"><div className="wrap"><div className="eyebrow">KANBAN FLOW LAB · INDEPENDENT ASSESSMENT</div><h1>Flow Improvement <em>Assessment.</em></h1><p>Discover how work happens, assess team habits, and plan your next improvement experiment.</p><p className="kmm-disclaimer">Original Kanban Flow Lab self-assessment. Not a Kanban Maturity Model assessment, certification, or official Kanban University product.</p></div></section>
  <div className="wrap kmm-main"><div className="kmm-toolbar"><label className="kmm-team">Team or service name<input maxLength={90} placeholder="e.g. Customer Support Team" value={team} onChange={e=>setTeam(e.target.value)}/></label><div className="kmm-buttons"><button type="button" className="kmm-action secondary" onClick={csv}>Export CSV</button><button type="button" className="kmm-action secondary" onClick={save}>Save assessment file</button><label className="kmm-action secondary km-file">Load assessment file<input type="file" accept=".json,application/json" onChange={load}/></label><button type="button" className="kmm-action" onClick={()=>window.print()}>Print / Save PDF</button></div></div>
  <p className="kmm-note">Responses remain in this browser session. Save a JSON file to return later. No account or server-side assessment archive is required.</p>
  <div className="kmm-summary"><div><strong>{checkpoints.length}</strong><span>Original questions</span></div><div><strong>{count}</strong><span>Answered</span></div><div><strong>{Object.values(answers).filter(x=>x==='observed').length}</strong><span>Consistent</span></div><div><strong>{Object.values(answers).filter(x=>x==='emerging').length}</strong><span>Sometimes</span></div><div><strong>{Object.values(answers).filter(x=>x==='absent').length}</strong><span>Not yet</span></div><div><strong>{chosen.length}</strong><span>Improvement focus</span></div></div>
  <div className="kmm-progress"><span style={{width:`${Math.round(100*count/checkpoints.length)}%`}}/></div>
  <div className="kmm-workspace"><aside className="kmm-sidebar" aria-label="Assessment sections"><strong className="kmm-side-title">Flow Assessment</strong>{[['overview','Overview','◈'],['practices','Questions','▦'],['insights','Heatmap','▤'],['plan','Improvement plan','☑']].map(([k,t,i])=><button type="button" key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}><span className="kmm-side-icon">{i}</span>{t}</button>)}</aside>
  <div className="kmm-work-area">
  {tab==='overview'&&<section className="kmm-panel"><h2>Use evidence, not a maturity score</h2><p>These 35 questions were written for Kanban Flow Lab. They support a conversation about system capability across five learning stages; they do not reproduce or determine official KMM maturity levels.</p><div className="kmm-overview-guide"><div><b>01 · Explore</b><p>Compare your team's experiences against original diagnostic questions.</p><button className="kmm-action" onClick={()=>setTab('practices')}>Open questions</button></div><div><b>02 · Discuss</b><p>Notice which answers have supporting evidence and which need investigation.</p><button className="kmm-action secondary" onClick={()=>setTab('insights')}>Open heatmap</button></div><div><b>03 · Experiment</b><p>Choose a few meaningful improvement opportunities rather than chasing a score.</p><button className="kmm-action secondary" onClick={()=>setTab('plan')}>Plan improvements</button></div></div></section>}
  {tab==='practices'&&<section className="kmm-panel"><div className="kmm-heading"><div><h2>Review flow questions</h2><p>Select a cell in the matrix to assess an observable team behavior, or switch to list view.</p></div><span>{filtered.length} questions shown</span></div>
   <div className="kmm-filters flow-filters"><label>Improvement stage<select value={stage} onChange={e=>{setStage(e.target.value);setActive(null)}}><option value="all">All stages</option>{stages.map((s,i)=><option key={s.name} value={i}>{i+1}. {s.name}</option>)}</select></label><label>Theme<select value={domain} onChange={e=>{setDomain(e.target.value);setActive(null)}}><option value="all">All themes</option>{domains.map(d=><option key={d.code} value={d.code}>{d.name}</option>)}</select></label><label>Search<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Code or question"/></label></div>
   <div className="kmm-display-toolbar"><div className="kmm-matrix-legend"><span className="kmm-key-pip fully"/>Consistent <span className="kmm-key-pip partly"/>Sometimes <span className="kmm-key-pip missing"/>Not yet <span className="kmm-key-pip na"/>Unsure <span className="kmm-key-pip unassessed"/>Unanswered</div><div className="kmm-view-switch"><button className={view==='matrix'?'active':''} onClick={()=>setView('matrix')}>Matrix</button><button className={view==='list'?'active':''} onClick={()=>setView('list')}>List</button></div></div>
   {view==='matrix'?<><p className="kmm-matrix-instruction">Stages are prompts for learning, not levels awarded to a team. Select any question to record evidence and improvement priorities.</p><div className="kmm-matrix-scroller"><table className="kmm-matrix flow-matrix"><thead><tr className="kmm-matrix-superhead"><th rowSpan="2" className="kmm-maturity-col">Improvement stage</th><th rowSpan="2" className="kmm-level-col">Focus</th><th colSpan="3" className="kmm-operational">Work Practices</th><th colSpan="3" className="kmm-manager">Team Habits</th><th className="kmm-metrics">Outcomes</th></tr><tr className="kmm-matrix-subhead">{domains.map(d=><th key={d.code} className={'kmm-head-'+d.group}>{d.name}</th>)}</tr></thead><tbody>{stages.map((s,i)=>{const visible=filtered.filter(p=>p.stage===i);return visible.length?<tr key={s.name}><th scope="row" className="kmm-band-cell"><b>{i+1}. {s.name}</b><small>{s.description}</small></th><td className="kmm-level-cell">Stage {i+1}</td>{domains.map(d=>{const found=visible.filter(p=>p.domain===d.code);return <td className="kmm-matrix-cell" key={d.code}>{found.map(p=><button type="button" key={p.id} title={p.title} className={'kmm-matrix-practice '+({observed:'fully',emerging:'partly',absent:'missing',unsure:'na'}[answers[p.id]]||'unassessed')+(active===p.id?' is-active':'')} onClick={()=>setActive(p.id)}><span className="kmm-matrix-title"><b>{p.code}</b> {p.title}</span><span className="kmm-matrix-markers">{answers[p.id]?statusText(answers[p.id]):''} {focus[p.id]?'★':''}</span></button>)}{!found.length&&<span className="kmm-cell-empty">—</span>}</td>})}</tr>:null})}</tbody></table></div><div className="kmm-detail-panel">{item?<><div className="kmm-detail-title"><h3>Selected question</h3><button className="kmm-action secondary" onClick={()=>setActive(null)}>Close</button></div>{assessor(item)}</>:<div className="kmm-detail-placeholder"><strong>Select a question in the matrix</strong><p>Its status options, evidence prompt and improvement checkbox will appear here.</p></div>}</div></>:<div className="kmm-practices">{filtered.map(p=><article className="kmm-practice" key={p.id}>{assessor(p)}</article>)}</div>}{!filtered.length&&<p>No questions match these filters.</p>}</section>}
  {tab==='insights'&&<section className="kmm-panel"><div className="kmm-heading"><div><h2>Assessment heatmap</h2><p>These colors summarize what the team reported. They are not a certified maturity rating.</p></div></div><div className="kmm-key"><span className="kmm-dot unassessed"/>Unanswered <span className="kmm-dot fully"/>Consistent <span className="kmm-dot partly"/>Sometimes <span className="kmm-dot missing"/>Not yet <span className="kmm-dot na"/>Unsure</div>{stages.map((s,i)=><section className="kmm-level" key={s.name}><h3>{i+1}. {s.name} <small>{checkpoints.filter(p=>p.stage===i&&answers[p.id]).length}/7 answered</small></h3><div className="kmm-heat-row"><strong>{s.description}</strong><div className="kmm-heat-cells">{checkpoints.filter(p=>p.stage===i).map(p=><button type="button" key={p.id} title={`${p.title}: ${statusText(answers[p.id])}`} className={'kmm-heat-cell '+({observed:'fully',emerging:'partly',absent:'missing',unsure:'na'}[answers[p.id]]||'unassessed')} onClick={()=>{setStage(String(i));setDomain(p.domain);setSearch('');setActive(p.id);setTab('practices')}}>{p.code}</button>)}</div></div></section>)}<p className="kmm-note">Interpret these results alongside evidence, service outcomes, and team conversations. Do not infer official KMM maturity or certification.</p></section>}
  {tab==='plan'&&<section className="kmm-panel"><div className="kmm-heading"><div><h2>Improvement experiments</h2><p>Select focus questions and define one practical experiment for each.</p></div><strong>{chosen.length} selected</strong></div>{chosen.length?chosen.map(p=><article className="kmm-plan-item" key={p.id}><div className="kmm-practice-head"><div><span className="kmm-code">{p.code}</span><h3>{p.title}</h3></div><button className="kmm-link" onClick={()=>modify(setFocus,p.id,false)}>Remove</button></div><label>Next experiment / intended evidence<textarea rows={3} value={plan[p.id]||''} onChange={e=>modify(setPlan,p.id,e.target.value)} placeholder="What will we change? For how long? What evidence would tell us if it helped?"/></label></article>):<div className="kmm-empty">No focus questions yet. <button onClick={()=>setTab('practices')}>Review the matrix</button> and select a few.</div>}</section>}
  </div></div>
  <div className="kmm-bottom"><button type="button" className="kmm-link" onClick={()=>setResetPrompt(v=>!v)}>Reset assessment</button>{resetPrompt&&<div className="kmm-reset"><span>Clear all responses, notes, and improvement priorities?</span><button onClick={clear}>Clear all</button><button onClick={()=>setResetPrompt(false)}>Cancel</button></div>}</div>
  <footer className="kmm-footer"><strong>Acknowledgment.</strong> Kanban Flow Lab is informed by widely used Kanban, Lean, and continuous-improvement ideas. The Kanban Maturity Model is associated with Kanban University; learn about the official model at <a href="https://kanban.university/kanban-maturity-model/" target="_blank" rel="noopener noreferrer">Kanban University</a>. This independent questionnaire uses original wording and its own organization. It does not reproduce the KMM practice catalog, and is not endorsed by, affiliated with, or certified by Kanban University.</footer>
  </div>
 </div>;
}
