// Dynasty Realms v1.10 - QA, Persistence, Tutorial & Mobile UX
const SAVE110="dynasty_realms_save_v110";
const SETTINGS110="dynasty_realms_settings_v110";
const SLOT_PREFIX110="dynasty_realms_slot_v110_";
const baseAction110=action;
const baseMonthly110=monthlyTick;
const baseRenderRealm110=renderRealm;
const baseRenderCourt110=renderCourt;
const baseRenderDynasty110=renderDynasty;
const baseRenderDiplomacy110=renderDiplomacy;
const baseRenderWar110=renderWar;
const baseRenderSelected110=renderSelected;
const baseSave110=saveSilent;
const baseReset110=reset;
const baseBegin110=typeof beginStart45==="function"?beginStart45:null;
const baseRenderTop110=typeof renderTop==="function"?renderTop:null;

function settings110(){
 try{const x=JSON.parse(localStorage.getItem(SETTINGS110)||"null");return Object.assign({tutorial:true,autosave:true,reducedMotion:false,confirmDanger:true,mapLabels:true},x||{})}catch(e){return{tutorial:true,autosave:true,reducedMotion:false,confirmDanger:true,mapLabels:true}}
}
function putSettings110(x){try{localStorage.setItem(SETTINGS110,JSON.stringify(x))}catch(e){}}
function characterSnapshot110(){
 const out={};
 Object.values(WORLD.characters||{}).forEach(c=>{
  out[c.id]={age:c.age,alive:c.alive,spouse:c.spouse,children:Array.isArray(c.children)?c.children.slice():[],health:c.health,opinion:c.opinion,
   influence:c.influence,ambition:c.ambition,fearOfCrown:c.fearOfCrown,culture:c.culture,faith:c.faith,title:c.title,
   martial:c.martial,diplomacy:c.diplomacy,stewardship:c.stewardship,intrigue:c.intrigue,learning:c.learning,traits:Array.isArray(c.traits)?c.traits.slice():[]};
 });
 return out;
}
function applyCharacterSnapshot110(){
 const snap=S.characterSnapshot110;
 if(!snap||typeof snap!=="object")return;
 Object.entries(snap).forEach(([id,x])=>{
  const c=char(id);if(!c||!x)return;
  Object.assign(c,x);c.children=Array.isArray(x.children)?x.children.slice():[];c.traits=Array.isArray(x.traits)?x.traits.slice():[];
 });
}
function ensure110(){
 S.version=110;
 S.settings110=settings110();
 S.characterSnapshot110=S.characterSnapshot110||{};
 S.runtime110=S.runtime110||{errors:[],warnings:[],boots:0,lastSave:null};
 S.runtime110.boots++;
 S.gameOver110=S.gameOver110||null;
 S.campaignStats100=S.campaignStats100||{};
 const defaults={months:0,battles:0,warsWon:0,warsLost:0,countiesWon:0,countiesLost:0,charactersDied:0,royalDeaths:0,bankruptcies:0,reforms:0};
 Object.keys(defaults).forEach(k=>{if(!Number.isFinite(S.campaignStats100[k]))S.campaignStats100[k]=defaults[k]});
}
function syncCharacters110(){
 S.characterSnapshot110=characterSnapshot110();
}
function robustSave110(){
 ensure110();syncCharacters110();
 try{baseSave110();localStorage.setItem(SAVE110,JSON.stringify(S));S.runtime110.lastSave=S.year+"."+String(S.month).padStart(2,"0")+"."+S.day;localStorage.setItem(SAVE110+"_meta",JSON.stringify({year:S.year,month:S.month,day:S.day,ruler:S.rulerId,updated:Date.now()}))}catch(e){runtimeError110(e,"save")}
}
function load110(){
 try{
  const raw=localStorage.getItem(SAVE110);
  if(raw){Object.assign(S,JSON.parse(raw),{version:110});ensure110();applyCharacterSnapshot110();applyWorldState()}
  else{ensure110()}
 }catch(e){ensure110();runtimeError110(e,"load")}
}
function runtimeError110(err,where){
 ensure110();const msg=String(err?.message||err).slice(0,180);
 S.runtime110.errors.unshift({where,msg,year:S.year,month:S.month});S.runtime110.errors=S.runtime110.errors.slice(0,12);
}
window.addEventListener("error",e=>{try{runtimeError110(e.error||e.message,"runtime")}catch(x){}});
window.addEventListener("unhandledrejection",e=>{try{runtimeError110(e.reason,"promise")}catch(x){}});
function gov(){return typeof gov100==="function"?gov100():({name:"Feudal Monarchy",tax:1,levy:1,order:1})}

function inject110Style(){
 if($("style110"))return;
 const st=document.createElement("style");st.id="style110";st.textContent=
 ".ux110{margin-top:5px}.ux110-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:7px 14px 10px}.ux110-grid>div{background:#101216;border:1px solid rgba(255,255,255,.05);border-radius:9px;padding:9px}.ux110-grid span{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.6px}.ux110-grid b{display:block;font-size:13px;margin-top:4px}.ux110-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:0 14px 10px}.ux110-actions button{background:#101216;border:1px solid var(--line);border-radius:8px;padding:8px;font-size:8px;color:var(--text)}.ux110-history{max-height:180px;overflow:auto;padding:0 14px 10px}.ux110-history>div{display:grid;grid-template-columns:52px 1fr;gap:7px;padding:7px 0;border-top:1px solid rgba(255,255,255,.05)}.ux110-history b{font-size:8px;color:var(--gold)}.ux110-history span{font-size:8px;line-height:1.4;color:var(--muted)}.guide110{display:grid;gap:7px;margin-top:12px}.guide110 button{background:#101216;border:1px solid var(--line);border-radius:9px;padding:10px;text-align:left}.guide110 b{display:block;font-size:10px}.guide110 span{display:block;color:var(--muted);font-size:8px;line-height:1.4;margin-top:3px}.toggle110{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,.05)}.toggle110 button{background:#101216;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:8px}.slot110{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}.slot110 button{background:#101216;border:1px solid var(--line);border-radius:8px;padding:8px;font-size:8px}.diag110{padding:8px 14px;color:var(--muted);font-size:8px;line-height:1.5}@media(max-width:560px){.ux110-grid{grid-template-columns:1fr 1fr}.ux110-actions{grid-template-columns:1fr 1fr}}";
 document.head.appendChild(st);
}
function showGuide110(){
 inject110Style();$("modal").classList.add("open");
 $("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>DYNASTY REALMS</span><h2>How to rule</h2></div><button id='closeModal'>×</button></div><p class='muted'>This campaign is built around five loops: rule your domain, manage people, build wealth, fight wars and secure succession.</p><div class='guide110'>"+
 [["Realm","Develop counties, manage holdings, laws, crown authority and vassals."],["Court","Council tasks, favors, secrets, plots, prisoners and political loyalty."],["Dynasty","Marriages, succession, claims, faith, culture, legacy and long-term survival."],["Diplomacy","Trade, alliances, non-aggression and defensive blocs let you win without every war."],["War","Move armies, preserve supply and morale, siege targets, then negotiate the peace."],["Economy","Food and population shape prices; markets, roads, debt and trade shape treasury."]].map(x=>"<button><b>"+x[0]+"</b><span>"+x[1]+"</span></button>").join("")+"</div>";
 $("closeModal").onclick=()=>$("modal").classList.remove("open");
}
function showSettings110(){
 inject110Style();$("modal").classList.add("open");const s=settings110();
 $("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>SETTINGS</span><h2>Campaign settings</h2></div><button id='closeModal'>×</button></div>"+
 [["tutorial","Show first-start tutorial"],["autosave","Autosave every campaign month"],["confirmDanger","Warn before dangerous actions"],["mapLabels","Show county labels on the map"]].map(x=>"<div class='toggle110'><span class='muted'>"+x[1]+"</span><button data-setting110='"+x[0]+"'>"+(s[x[0]]?"ON":"OFF")+"</button></div>").join("")+
 "<div class='section-title'>Difficulty</div><div class='slot110'><button data-diff110='easy'>Easy</button><button data-diff110='normal'>Normal</button><button data-diff110='hard'>Hard</button></div>"+
 "<div class='section-title'>Save slots</div><div class='slot110'><button data-slot110='save1'>Save 1</button><button data-slot110='save2'>Save 2</button><button data-slot110='save3'>Save 3</button><button data-slot110='load1'>Load 1</button><button data-slot110='load2'>Load 2</button><button data-slot110='load3'>Load 3</button></div>"+
 "<div class='section-title'>Diagnostics</div><div class='diag110'>Boots "+S.runtime110.boots+" · Runtime errors "+S.runtime110.errors.length+" · Last save "+(S.runtime110.lastSave||"none")+"</div>";
 $("closeModal").onclick=()=>$("modal").classList.remove("open");
 $("modalBody").querySelectorAll("[data-setting110]").forEach(b=>b.onclick=()=>{const s2=settings110();const k=b.dataset.setting110;s2[k]=!s2[k];putSettings110(s2);showSettings110()});
 $("modalBody").querySelectorAll("[data-diff110]").forEach(b=>b.onclick=()=>{if(typeof setDifficulty100==="function")setDifficulty100(b.dataset.diff110);else S.difficulty100=b.dataset.diff110;const s2=settings110();putSettings110(s2);showSettings110()});
 $("modalBody").querySelectorAll("[data-slot110]").forEach(b=>b.onclick=()=>{const a=b.dataset.slot110,slot=+a.slice(-1);if(a[0]==="s")saveSlot110(slot);else loadSlot110(slot)});
}
function saveSlot110(slot){
 ensure110();syncCharacters110();
 try{baseSave110();localStorage.setItem(SLOT_PREFIX110+slot,JSON.stringify(S));toast("Save "+slot+" created");}catch(e){runtimeError110(e,"slot-save");toast("Save failed")}
}
function loadSlot110(slot){
 try{
  const raw=localStorage.getItem(SLOT_PREFIX110+slot);if(!raw)return toast("Save "+slot+" is empty");
  Object.assign(S,JSON.parse(raw),{version:110});ensure110();applyCharacterSnapshot110();applyWorldState();rebuildHeir();render();robustSave110();$("modal").classList.remove("open");toast("Save "+slot+" loaded");
 }catch(e){runtimeError110(e,"slot-load");toast("Load failed")}
}
function stability110(){
 const owned=ownedCounties(),food=owned.length?owned.reduce((n,c)=>n+(c.food||0),0)/owned.length:0;
 const control=owned.length?owned.reduce((n,c)=>n+(c.control||0),0)/owned.length:0;
 const loyalty=directVassalCharacters().length?directVassalCharacters().reduce((n,v)=>n+vassalLoyalty100(v),0)/directVassalCharacters().length:100;
 const debt=S.treasury100?.debt||0,tyr=S.government100?.tyranny||0;
 return clamp(50+control*.25+loyalty*.2+food*.12-(debt*.035)-tyr*.28,0,100);
}
function score110(){
 const owned=ownedCounties(),kingdoms=(WORLD.kingdoms||[]).filter(k=>k.holder===S.rulerId).length;
 return Math.round(owned.length*3+(S.prestige||0)*.3+(S.legitimacy||0)*.8+(S.dynastyRenown||0)*.18+kingdoms*35+(S.campaignStats100?.warsWon||0)*12);
}
function checkGameOver110(){
 if(S.gameOver110)return;
 const r=ruler(),owned=ownedCounties();
 if(!r||!r.alive||owned.length===0){
  S.gameOver110={kind:"defeat",year:S.year,reason:"Your dynasty lost its last meaningful foothold."};
  S.paused=true;log("The campaign ended. The dynasty lost its realm.","dynasty");toast("Dynasty defeated");
 }
 if(owned.length>=Math.max(30,Math.floor(WORLD.counties.length*.72))&&((S.campaignStats100?.months||0)>=120)){
  S.gameOver110={kind:"victory",year:S.year,reason:"Your house dominates the majority of the known world."};
  S.paused=true;log("Victory: your dynasty became the dominant power of the known world.","dynasty");toast("Campaign victory");
 }
}
function campaignLedger110(){
 const hist=(S.chronicle100||[]).slice(0,10),s=S.campaignStats100;
 return "<div class='section-title'>Campaign record</div><div class='ux110-grid'>"+
 [["Stability",Math.round(stability110())],["Realm score",score110()],["Wars won",s.warsWon||0],["Battles",s.battles||0],["Counties gained",s.countiesWon||0],["Reforms",s.reforms||0]].map(x=>"<div><span>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("")+
 "</div><div class='section-title'>Chronicle</div><div class='ux110-history'>"+(hist.map(h=>"<div><b>"+h.year+"."+String(h.month).padStart(2,"0")+"</b><span>"+esc(h.text)+"</span></div>").join("")||"<div class='empty'>No history yet.</div>")+"</div>";
}
function renderUX110(){
 inject110Style();
 let box=$("ux110Panel");if(box)box.remove();box=document.createElement("div");box.id="ux110Panel";box.className="ux110";
 const r=ruler(),owned=ownedCounties(),food=owned.length?Math.round(owned.reduce((n,c)=>n+(c.food||0),0)/owned.length):0;
 box.innerHTML="<div class='section-title'>Realm Command v1.10</div><div class='ux110-grid'><div><span>Stability</span><b>"+Math.round(stability110())+"</b></div><div><span>Population</span><b>"+Math.floor(owned.reduce((n,c)=>n+(c.population||0),0))+"</b></div><div><span>Avg food</span><b>"+food+"</b></div><div><span>Realm score</span><b>"+score110()+"</b></div><div><span>Debt</span><b>"+Math.floor(S.treasury100?.debt||0)+"</b></div><div><span>Ruler</span><b>"+esc(r?.name||"Unknown")+"</b></div></div><div class='ux110-actions'><button data-ux110='guide'>Guide</button><button data-ux110='settings'>Settings</button><button data-ux110='save'>Quick Save</button><button data-ux110='focus'>Focus Realm</button></div>"+campaignLedger110();
 box.querySelectorAll("[data-ux110]").forEach(b=>b.onclick=()=>{const a=b.dataset.ux110;if(a==="guide")showGuide110();else if(a==="settings")showSettings110();else if(a==="save"){robustSave110();toast("Game saved")}else if(a==="focus"&&typeof focusPlayer50==="function"){focusPlayer50();render()}});
 $("tab-realm")?.appendChild(box);
}
function renderTop(){
 if(baseRenderTop110)baseRenderTop110();
 const r=ruler();
 let btn=$("settings110Top");
 if(!btn){const host=document.querySelector(".top-actions");if(host){btn=document.createElement("button");btn.id="settings110Top";btn.className="mini-btn";btn.textContent="⚙";host.appendChild(btn);btn.onclick=showSettings110}}
 if(r)document.title="Dynasty Realms · "+r.name;
}
function renderGovernment100(){
 let box=$("government100");if(box)box.remove();box=document.createElement("div");box.id="government100";const g=S.government100,loyal=directVassalCharacters().map(v=>vassalLoyalty100(v)),avg=loyal.length?Math.round(loyal.reduce((a,b)=>a+b,0)/loyal.length):100;
 const govBtns=Object.entries(GOV100).map(([k,v])=>"<button data-g100-gov='"+k+"'><b>"+esc(v.name)+"</b><span>"+v.desc+" · "+(k==="feudal"?"free":"cost "+({bureaucratic:320,merchant:280,elective:220}[k]||0)+" prestige")+"</span></button>").join("");
 const lawBtns=["medium","high","absolute"].map(x=>"<button data-g100-crown='"+x+"'>Crown "+x+"</button>").join("");
 box.innerHTML="<div class='section-title'>Statecraft v0.60</div><div class='g100-grid'><div><span>Government</span><b>"+esc(gov().name)+"</b></div><div><span>Crown authority</span><b>"+g.crown+"</b></div><div><span>Vassal loyalty</span><b>"+avg+"</b></div><div><span>Tyranny</span><b>"+Math.round(g.tyranny)+"</b></div><div><span>Parliament</span><b>"+Math.round(g.parliament)+"</b></div><div><span>War policy</span><b>"+g.military.replaceAll("_"," ")+"</b></div></div><div class='g100-buttons'>"+govBtns+"</div><div class='g100-buttons'>"+lawBtns+"</div><div class='g100-small'>"+esc(gov().desc)+"</div>";
 $("tab-realm")?.appendChild(box);box.querySelectorAll("[data-g100-gov]").forEach(b=>b.onclick=()=>govAction100(b.dataset.g100Gov));box.querySelectorAll("[data-g100-crown]").forEach(b=>b.onclick=()=>reformCrown100(b.dataset.g100Crown));
}
function renderRealm(){baseRenderRealm100();renderUX110()}
function renderCourt(){baseRenderCourt100();renderUX110()}
function renderDynasty(){baseRenderDynasty100();renderUX110()}
function renderDiplomacy(){baseRenderDiplomacy100()}
function renderWar(){baseRenderWar100()}
function renderSelected(){baseRenderSelected100()}

function action(a){
 ensure110();
 if(a==="guide")return showGuide110();
 if(a==="settings")return showSettings110();
 if(a==="autosave")return;
 baseAction110(a);
}
function saveSilent(){robustSave110()}
function reset(){localStorage.removeItem(SAVE110);localStorage.removeItem(SAVE110+"_meta");for(let i=1;i<=3;i++)localStorage.removeItem(SLOT_PREFIX110+i);baseReset110()}
function beginStart45(id){
 localStorage.removeItem(SAVE110);localStorage.removeItem(SAVE110+"_meta");
 return baseBegin110?baseBegin110(id):false;
}
function monthlyTick(){
 const paused=S.paused;baseMonthly110();if(paused)return;
 ensure110();checkGameOver110();
 if(settings110().autosave)robustSave110();
 render();
}
load110();ensure110();render();robustSave110();
(function firstGuide110(){
 const st=settings110();
 if(st.tutorial&&!localStorage.getItem(SAVE110+"_tutorial_seen")){localStorage.setItem(SAVE110+"_tutorial_seen","1");setTimeout(showGuide110,350)}
})();