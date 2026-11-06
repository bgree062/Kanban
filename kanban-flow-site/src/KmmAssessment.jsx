import React,{useMemo,useState} from 'react';
import practices from './kmm-practices.json';
import './kmm.css';

const statuses=[
 {id:'fully',label:'Fully Applied',className:'kmm-fully'},
 {id:'partly',label:'Partly Applied',className:'kmm-partly'},
 {id:'missing',label:'Not Present',className:'kmm-missing'},
 {id:'na',label:"Not Needed / Doesn't Apply",className:'kmm-na'}
];
const levels=['Oblivious','Team Focused','Customer Driven','Fit for Purpose','Risk Hedged','Market Leader','Built for Survival'];
const shortStatus=s=>statuses.find(x=>x.id===s)?.label||'Not assessed';
const escCsv=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
const saveBlob=(data,name,type)=>{const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2500)};
const ID='kmm';
export default function KmmAssessment(){
 const [team,setTeam]=useState('');
 const [assessment,setAssessment]=useState({});
 const [notes,setNotes]=useState({});
 const [focus,setFocus]=useState({});
 const [plan,setPlan]=useState({});
 const [level,setLevel]=useState('all');
 const [kind,setKind]=useState('all');
 const [category,setCategory]=useState('all');
 const [query,setQuery]=useState('');
 const [tab,setTab]=useState('assess');
 const [confirmReset,setConfirmReset]=useState(false);
 const rows=useMemo(()=>practices.filter(p=>(level==='all'||p.level===Number(level))&&(kind==='all'||p.kind===kind)&&(category==='all'||p.category===category)&&(`${p.code} ${p.title}`.toLowerCase().includes(query.toLowerCase()))),[level,kind,category,query]);
 const covered=practices.filter(p=>assessment[p.id]);
 const counts=Object.fromEntries(statuses.map(x=>[x.id,covered.filter(p=>assessment[p.id]===x.id).length]));
 const selected=practices.filter(p=>focus[p.id]);
 const statusFor=(p)=>assessment[p.id]||'';
 const setStatus=(p,v)=>setAssessment(old=>({...old,[p.id]:v}));
 const exportCsv=()=>{
   const header=['Team','Practice code','Practice','Maturity level','Category','Practice type','Status','Assessment notes','Improvement focus','Improvement action'];
   const values=[header,...practices.map(p=>[team,p.code,p.title,p.level,p.category,p.kind,shortStatus(assessment[p.id]),notes[p.id]||'',focus[p.id]?'Yes':'No',plan[p.id]||''])];
   saveBlob('\uFEFF'+values.map(r=>r.map(escCsv).join(',')).join('\r\n'),`kanban-kmm-assessment-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8');
 };
 const exportJson=()=>saveBlob(JSON.stringify({format:'kanban-flow-lab-kmm-v1',team,assessment,notes,focus,plan},null,2),`kanban-kmm-assessment-${new Date().toISOString().slice(0,10)}.json`,'application/json');
 const importJson=async(e)=>{const file=e.target.files?.[0];if(!file)return;try{const v=JSON.parse(await file.text());if(v.format!=='kanban-flow-lab-kmm-v1')throw Error('Not a compatible assessment file');const valid=new Set(practices.map(p=>p.id));const keep=obj=>Object.fromEntries(Object.entries(obj||{}).filter(([k])=>valid.has(k)));setTeam(String(v.team||''));setAssessment(keep(v.assessment));setNotes(keep(v.notes));setFocus(keep(v.focus));setPlan(keep(v.plan));}catch(err){alert(err.message||'Could not load assessment')}e.target.value=''};
 return <div className="kmm-page" id="kmm-assessment">
   <section className="kmm-hero"><div className="wrap"><div className="eyebrow">ASSESSMENTS · KANBAN FLOW LAB</div><h1>KMM Practice <em>Assessment.</em></h1><p>Make current practices visible, discuss gaps, and choose your next improvement experiment.</p><p className="kmm-disclaimer">Based on the structure of KMM HeatMap v2.3. This is a self-assessment aid, not an official KMM certification or automated maturity determination.</p></div></section>
   <div className="wrap kmm-main">
     <div className="kmm-toolbar">
       <label className="kmm-team">Team or service name <input value={team} onChange={e=>setTeam(e.target.value)} placeholder="e.g. API Banking" maxLength={90}/></label>
       <div className="kmm-buttons"><button type="button" className="kmm-action secondary" onClick={exportCsv}>Export CSV</button><button type="button" className="kmm-action secondary" onClick={exportJson}>Save assessment file</button><label className="kmm-action secondary km-file">Load assessment file<input type="file" accept=".json,application/json" onChange={importJson}/></label><button type="button" className="kmm-action" onClick={()=>window.print()}>Print / Save PDF</button></div>
     </div>
     <p className="kmm-note">Your responses are kept only in this browser session. To resume later, save a JSON assessment file and load it again. No account or database is required.</p>
     <div className="kmm-summary">
       <div><strong>{practices.length}</strong><span>Practices</span></div><div><strong>{covered.length}</strong><span>Assessed</span></div><div><strong>{counts.fully}</strong><span>Fully applied</span></div><div><strong>{counts.partly}</strong><span>Partly applied</span></div><div><strong>{counts.missing}</strong><span>Not present</span></div><div><strong>{selected.length}</strong><span>Improvement focus</span></div>
     </div>
     <div className="kmm-progress"><span style={{width:`${100*covered.length/practices.length}%`}}/></div>
     <div className="kmm-tabs" role="tablist" aria-label="Assessment pages">
      {['assess','heatmap','plan'].map(t=><button type="button" role="tab" aria-selected={tab===t} className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t==='assess'?'Assess practices':t==='heatmap'?'Heatmap & insights':'Improvement plan'}</button>)}
     </div>
     {tab==='assess'&&<section className="kmm-panel" aria-label="Assess practices">
       <div className="kmm-heading"><div><h2>Review practices</h2><p>Use the workbook's response choices. Assess evidence and outcomes, not just whether a tool or board exists.</p></div><span>{rows.length} practices shown</span></div>
       <div className="kmm-filters"><label>Maturity level<select value={level} onChange={e=>setLevel(e.target.value)}><option value="all">All levels</option>{levels.map((t,i)=><option key={i} value={i}>ML{i} — {t}</option>)}</select></label><label>Practice type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">Consolidation + Transition</option><option>Consolidation</option><option>Transition</option></select></label><label>Practice group<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All practice groups</option><option>Operational Practices</option><option>Managerial Practices</option></select></label><label>Search<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Code or practice name"/></label></div>
       <div className="kmm-practices">{rows.map(p=><article className="kmm-practice" key={p.id}><div className="kmm-practice-head"><div><span className="kmm-code">{p.code||'Practice'}</span> <span className="kmm-label">ML{p.level} · {p.kind} · {p.category}</span><h3>{p.title}</h3></div><label className="kmm-focus"><input type="checkbox" checked={!!focus[p.id]} onChange={e=>setFocus(v=>({...v,[p.id]:e.target.checked}))}/> Focus practice</label></div><div className="kmm-statuses">{statuses.map(x=><label key={x.id} className={`${x.className} ${assessment[p.id]===x.id?'selected':''}`}><input type="radio" name={'status-'+p.id} checked={assessment[p.id]===x.id} onChange={()=>setStatus(p,x.id)}/>{x.label}</label>)}</div><label className="kmm-notelabel">Evidence / discussion notes<textarea value={notes[p.id]||''} rows={2} onChange={e=>setNotes(old=>({...old,[p.id]:e.target.value}))} placeholder="What evidence supports the assessment? What needs to change?"/></label></article>)}</div>
       {rows.length===0&&<p>No practices match these filters.</p>}
     </section>}
     {tab==='heatmap'&&<section className="kmm-panel"><div className="kmm-heading"><div><h2>Practice heatmap</h2><p>Each cell is one practice. Hover for its name and status; select a cell to return to its assessment.</p></div></div><div className="kmm-key"><span className="kmm-dot unassessed"/>Not assessed <span className="kmm-dot fully"/>Fully Applied <span className="kmm-dot partly"/>Partly Applied <span className="kmm-dot missing"/>Not Present <span className="kmm-dot na"/>Not Needed / Doesn't Apply</div>
       {levels.map((l,n)=>{const list=practices.filter(p=>p.level===n);return <section key={n} className="kmm-level"><h3>ML{n} · {l} <small>{list.filter(p=>assessment[p.id]).length}/{list.length} assessed</small></h3>{['Consolidation','Transition'].map(k=>{const items=list.filter(p=>p.kind===k);return items.length?<div className="kmm-heat-row" key={k}><strong>{k}</strong><div className="kmm-heat-cells">{items.map(p=><button key={p.id} type="button" title={`${p.code} — ${p.title}: ${shortStatus(assessment[p.id])}`} aria-label={`${p.code} ${shortStatus(assessment[p.id])}`} className={'kmm-heat-cell '+(assessment[p.id]||'unassessed')} onClick={()=>{setLevel(String(p.level));setKind(p.kind);setCategory('all');setQuery(p.code);setTab('assess')}}>{p.code||'•'}</button>)}</div></div>:null})}</section>})}
       <p className="kmm-note"><strong>Interpretation:</strong> Counts show reported practice statuses, not an official maturity score. Check behaviors, feedback loops, capability, and outcomes before drawing maturity conclusions.</p></section>}
     {tab==='plan'&&<section className="kmm-panel"><div className="kmm-heading"><div><h2>Improvement focus</h2><p>Select candidate practices from the assessment, then define a small experiment and observable evidence of improvement.</p></div><strong>{selected.length} selected</strong></div>{selected.length===0?<div className="kmm-empty">No focus practices selected. Go to <button type="button" onClick={()=>setTab('assess')}>Assess practices</button> and mark the practices you want to work on.</div>:selected.map(p=><article className="kmm-plan-item" key={p.id}><div className="kmm-practice-head"><div><span className="kmm-code">{p.code}</span><span className="kmm-label"> ML{p.level} · {p.kind} · {shortStatus(assessment[p.id])}</span><h3>{p.title}</h3></div><button type="button" className="kmm-link" onClick={()=>setFocus(old=>({...old,[p.id]:false}))}>Remove</button></div><label>Proposed experiment / next action<textarea rows={3} value={plan[p.id]||''} onChange={e=>setPlan(old=>({...old,[p.id]:e.target.value}))} placeholder="What will we try, with whom, and how will we know whether it helped?"/></label></article>)}</section>}
     <div className="kmm-bottom"><button type="button" className="kmm-link" onClick={()=>setConfirmReset(x=>!x)}>Reset assessment</button>{confirmReset&&<div className="kmm-reset"><span>Clear all entries, notes, and focus choices?</span><button type="button" onClick={()=>{setAssessment({});setNotes({});setFocus({});setPlan({});setConfirmReset(false)}}>Clear all</button><button type="button" onClick={()=>setConfirmReset(false)}>Cancel</button></div>}</div>
     <footer className="kmm-footer">Kanban Flow Lab · Practice labels and maturity groupings adapted from the user-provided KMM HeatMap v2.3 workbook. Verify public redistribution rights for any third-party KMM materials before public launch.</footer>
   </div>
 </div>
}
