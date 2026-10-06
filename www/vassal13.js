
const SAVE13="dynasty_realms_save_v13";
const baseMonthlyTick13=monthlyTick;
const baseRenderRealm13=renderRealm;
const baseRenderDiplomacy13=renderDiplomacy;
const baseSync13=syncWorldState;

function vassalInfo13(id){
  const c=char(id);if(!c)return null;
  const countyHeld=WORLD.counties.find(x=>x.holder===id);
  if(countyHeld){const d=duchy(countyHeld.duchy),dh=d?titleHolder(d.id):null;return {id,rank:"count",title:countyHeld.name,overlord:dh};}
  const dHeld=WORLD.duchies.find(x=>titleHolder(x.id)===id);
  if(dHeld){const k=title(dHeld.parent),kh=k?titleHolder(k.id):null;return {id,rank:"duke",title:dHeld.name,overlord:kh};}
  return null;
}
function allVassals13(overlord){
  const out=[];
  WORLD.counties.forEach(c=>{const info=vassalInfo13(c.holder);if(info?.overlord===overlord&&!out.some(x=>x.id===info.id))out.push(info);});
  WORLD.duchies.forEach(d=>{const h=titleHolder(d.id),info=h&&vassalInfo13(h);if(info?.overlord===overlord&&!out.some(x=>x.id===info.id))out.push(info);});
  return out.map(x=>({...x,char:char(x.id),power:Math.floor(vassalPower(x.id))}));
}
function vassalLoyalty13(v){
  if(!v)return 0;const info=vassalInfo13(v.id);if(!info||!info.overlord)return 100;
  let n=opinion(v.id),con=contract(v.id);
  if(con.tax==="high")n-=12;if(con.levy==="high")n-=10;
  if(S.crownAuthority==="medium")n-=6;if(S.crownAuthority==="high")n-=14;
  n+=S.legitimacy-70;n-=Math.max(0,(v.stress||0)-60)*.15;
  return clamp(n,-100,100);
}
function independencePressure13(v){
  const loyalty=vassalLoyalty13(v);let p=Math.max(0,(30-loyalty))*1.35;
  if(loyalty<0)p+=18;if((v.traits||[]).includes("Ambitious"))p+=12;if((v.traits||[]).includes("Content"))p-=18;
  if(S.crownAuthority==="high")p+=8;return clamp(p,0,100);
}
function directVassalPower13(overlord){return allVassals13(overlord).reduce((n,v)=>n+v.power,0)}
function launchIndependenceWar13(v){
  const info=vassalInfo13(v.id);if(!info||!info.overlord||S.wars.some(w=>w.kind==="independence"&&w.attacker===v.id))return false;
  const target=WORLD.counties.find(c=>c.holder===v.id);if(!target)return false;
  const w={id:"w_ind_"+Date.now().toString(36)+Math.floor(Math.random()*99),kind:"independence",attacker:v.id,defender:info.overlord,name:v.name+" seeks independence",target:target.id,targetDuchy:target.duchy,goal:"independence",score:0,months:0,siege:0,enemy:Math.max(180,Math.floor(vassalPower(v.id)*.85)),battles:0,fronts:{[target.id]:{siege:0}},vassalWar:true};
  S.wars.push(w);S.independenceFactions[v.id]={formed:S.year*12+S.month,strength:vassalPower(v.id),members:[v.id]};
  log(v.name+" rose in a war for independence.","war");toast(v.id===S.rulerId?"Your realm is seeking independence":"Independence war has begun");return true;
}
function processIndependenceWar13(w){
  const v=char(w.attacker),t=county(w.target);if(!v||!t)return false;
  const attackerPower=Math.max(150,vassalPower(v.id)+(v.martial||5)*55);
  const liegePower=Math.max(180,(w.defender===S.rulerId?playerPower():directVassalPower13(w.defender)*.45)+((char(w.defender)?.martial||5)*60));
  const ratio=attackerPower/liegePower;w.months++;w.score+=clamp((ratio-1)*12,-9,9);
  const gain=clamp(2+ratio*2.4,1,9);w.fronts[t.id]=w.fronts[t.id]||{siege:0};w.fronts[t.id].siege=clamp((w.fronts[t.id].siege||0)+(w.score>0?gain:gain*.45),0,100);t.siege=w.fronts[t.id].siege;
  if(w.fronts[t.id].siege>=100){setTitleHolder(t.id,v.id);t.status="neutral";t.control=clamp(t.control-10,0,100);t.occupiedBy=null;t.occupationWar=null;delete S.independenceFactions[v.id];S.wars=S.wars.filter(x=>x.id!==w.id);log(v.name+" won independence and now rules "+t.name+".","war");return true;}
  if(w.months>=18&&w.score<-25){delete S.independenceFactions[v.id];S.wars=S.wars.filter(x=>x.id!==w.id);log(v.name+" failed to win independence.","war");return true;}
  return true;
}
const LEGACY_MONTHLY_WAR_13=monthlyWar;
function monthlyWar(w){if(w?.kind==="independence")return processIndependenceWar13(w);return LEGACY_MONTHLY_WAR_13(w)}
function syncWorldState(){baseSync13();S.version=13}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE13,JSON.stringify(S))}catch(e){}}
function reset(){[SAVE13,"dynasty_realms_save_v12","dynasty_realms_save_v11","dynasty_realms_save_v10","dynasty_realms_save_v09","dynasty_realms_save_v08","dynasty_realms_save_v07","dynasty_realms_save_v06","dynasty_realms_save_v05","dynasty_realms_save_v03","dynasty_realms_save_v02"].forEach(k=>localStorage.removeItem(k));location.reload()}
function initVassal13(){S.independenceFactions=S.independenceFactions&&typeof S.independenceFactions==="object"?S.independenceFactions:{};S.vassalHistory=Array.isArray(S.vassalHistory)?S.vassalHistory:[]}
function processVassalPolitics13(){
  allVassals13(S.rulerId).forEach(v=>{
    const c=v.char;if(!c||!c.alive)return;const pressure=independencePressure13(c);
    if(pressure>=45)S.independenceFactions[c.id]=S.independenceFactions[c.id]||{formed:S.year*12+S.month,strength:v.power,members:[c.id]};
    else if(pressure<25&&S.independenceFactions[c.id])delete S.independenceFactions[c.id];
    if(S.independenceFactions[c.id]&&pressure>=75&&Math.random()<.18){launchIndependenceWar13(c);delete S.independenceFactions[c.id]}
  });
}
function renderRealm(){
  baseRenderRealm13();let box=$("vassalHierarchy13");if(box)box.remove();
  box=document.createElement("div");box.id="vassalHierarchy13";const direct=allVassals13(S.rulerId);
  const rows=direct.map(v=>{const loy=vassalLoyalty13(v.char);return "<div class='vassal-row'><div><b>"+esc(v.char?.name||"Unknown")+"</b><small>"+esc(v.title)+" · "+esc(v.rank)+" · "+Math.floor(v.power)+" power</small></div><div><span class='loyalty "+(loy>20?"good":loy<0?"bad":"mid")+"'>"+Math.round(loy)+" loyalty</span><small>"+(S.independenceFactions[v.id]?"Independence faction":"Loyal")+"</small></div></div>"}).join("");
  box.innerHTML="<div class='section-title'>Vassal hierarchy</div>"+(rows||"<div class='empty'>No direct vassals.</div>");
  const anchor=$("society");if(anchor?.parentElement&&!box.parentElement)anchor.parentElement.appendChild(box);
}
function renderDiplomacy(){
  baseRenderDiplomacy13();const old=$("independenceFactions13");if(old)old.remove();const box=document.createElement("div");box.id="independenceFactions13";
  const rows=Object.entries(S.independenceFactions||{}).map(([id,f])=>{if(!f)return "";const c=char(id);return "<div class='faction-row'><span><b>"+esc(c?.name||id)+"</b><small>Independence movement · strength "+Math.floor(f.strength||0)+"</small></span><span>"+Math.max(0,(S.year*12+S.month)-(f.formed||0))+" mo</span></div>"}).join("");
  box.innerHTML="<div class='section-title'>Independence movements</div>"+(rows||"<div class='empty'>No active independence movements.</div>");
  $("tab-diplomacy").appendChild(box);
}
function monthlyTick(){const wasPaused=S.paused;baseMonthlyTick13();if(wasPaused)return;processVassalPolitics13();render();saveSilent()}
function load13(){
  try{const raw=localStorage.getItem(SAVE13)||localStorage.getItem("dynasty_realms_save_v12")||localStorage.getItem("dynasty_realms_save_v11")||localStorage.getItem("dynasty_realms_save_v10");if(raw){Object.assign(S,JSON.parse(raw),{version:13});applyWorldState()}}catch(e){}
  S.version=13;initVassal13();normalizeWarState();render();saveSilent();
}
load13();
