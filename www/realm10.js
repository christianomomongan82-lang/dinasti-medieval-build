const SAVE10="dynasty_realms_save_v10";
const baseSync10=syncWorldState;
const baseRenderRealm10=renderRealm;
const baseRenderDecisions10=renderDecisions;
const baseDecision10=decision;
const baseMonthlyTick10=monthlyTick;

function initRealm10(){
  let migrated=false;
  const raw=localStorage.getItem(SAVE10);
  if(raw){try{Object.assign(S,JSON.parse(raw),{version:10});applyWorldState();migrated=true}catch(e){}}
  S.version=10;
  if(!S.realm||typeof S.realm!=="object")S.realm={};
  if(!S.realm.prosperity)S.realm.prosperity={};
  if(!Array.isArray(S.realm.lastLedger))S.realm.lastLedger=[];
  WORLD.counties.forEach(c=>{
    const p=clamp(S.countyState?.[c.id]?.prosperity??S.realm.prosperity[c.id]??58+c.dev*2,0,100);
    S.realm.prosperity[c.id]=p;c.prosperity=p;
  });
  S.realm.tradeIncome=S.realm.tradeIncome??0;
  S.decisions=S.decisions&&typeof S.decisions==="object"?S.decisions:{};
  S.decisions.census=S.decisions.census||0;
  return migrated;
}
function realmProsperity(c){return clamp(c?.prosperity??S.realm?.prosperity?.[c?.id]??50,0,100)}
function prosperityTaxFactor(c){return .72+realmProsperity(c)/360}
function prosperityLevyFactor(c){return .78+realmProsperity(c)/420}
function countyTradeValue(c){
  if(!c)return 0;
  const market=c.buildings?.market||0,coast=c.terrain==="coast"?1.35:1;
  const neigh=(WORLD.adjacency[c.id]||[]).map(county).filter(Boolean).reduce((n,x)=>n+(x.buildings?.market||0),0);
  return market*coast*(.8+c.dev*.05)+neigh*.12;
}
function realmTradeValue(){
  return WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder)).reduce((n,c)=>n+countyTradeValue(c)*(.7+realmProsperity(c)/250),0);
}
function realmTax(){
  const st=char(S.council.steward),eff=1+clamp(((st?.stewardship||5)-8)*.025,-.25,.45),cap=overDomainFactor();
  return WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder)).reduce((n,c)=>{
    const base=c.tax*(c.dev/7)*eff*(.55+c.control/100*.45)*prosperityTaxFactor(c);
    if(c.holder===S.rulerId)return n+base*cap*buildingTaxMultiplier(c);
    return n+base*.55*contractTaxFactor(char(c.holder))*buildingTaxMultiplier(c);
  },0);
}
function totalLevySource(){
  return ownedCounties().reduce((n,c)=>{
    const pf=prosperityLevyFactor(c);
    if(c.holder===S.rulerId)return n+c.levy*overDomainFactor()*pf;
    return n+c.levy*.65*contractLevyFactor(char(c.holder))*pf;
  },0);
}
function realm10CountyTick(c){
  let delta=0;
  if(c.occupiedBy)delta-=1.8;else if(c.status==="rival")delta-=.35;else if(c.status==="yours")delta+=.24;else delta+=.08;
  delta+=(c.control-65)*.006+(c.dev-7)*.012+(c.buildings?.market||0)*.035+(c.buildings?.farm||0)*.02;
  if(c.control<35)delta-=.28;
  c.prosperity=clamp(realmProsperity(c)+delta,0,100);
  if(c.status==="yours"&&!c.occupiedBy&&c.control<90)c.control=clamp(c.control+.18,0,100);
  if(c.occupiedBy===S.rulerId)c.control=clamp(c.control+.45,0,100);
  S.realm.prosperity[c.id]=c.prosperity;
}
function processRealmSimulation(){
  WORLD.counties.forEach(realm10CountyTick);
  const tradeGold=realmTradeValue()*.035;
  S.realm.tradeIncome=tradeGold;S.gold+=tradeGold;
  S.realm.lastLedger.unshift({year:S.year,month:S.month,tax:realmTax(),trade:tradeGold});
  S.realm.lastLedger=S.realm.lastLedger.slice(0,24);
  const player=ownedCounties(),avg=player.length?player.reduce((n,c)=>n+realmProsperity(c),0)/player.length:0;
  if(avg<30&&Math.random()<.035){S.legitimacy=clamp(S.legitimacy-2,0,100);S.stress=clamp(S.stress+3,0,100);log("Poor prosperity across the realm is weakening royal confidence.","court")}
  if(avg>78&&Math.random()<.025){S.prestige+=3;log("Prosperous counties strengthened the prestige of the crown.","court")}
}
function aiRealmAdministration(){
  notableRulers().forEach(v=>{
    const agenda=aiAgendaFor(v);
    WORLD.counties.filter(c=>c.holder===v.id).forEach(c=>{
      if(agenda==="consolidate"&&c.control<80&&Math.random()<.14)c.control=clamp(c.control+2,0,100);
      if(agenda==="consolidate"&&c.dev<10&&Math.random()<.035)c.dev+=1;
      if(agenda==="expand"&&Math.random()<.05)c.prosperity=clamp(realmProsperity(c)+.4,0,100);
      if(agenda==="war"&&Math.random()<.08)c.garrison+=4;
    });
  });
}
function fabricateCensus(){
  if((S.decisions.census||0)>0)return toast("Royal Census is on cooldown");
  if(S.gold<25)return toast("Need 25 gold");
  S.gold-=25;
  WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder)).forEach(c=>{c.control=clamp(c.control+6,0,100);c.prosperity=clamp(realmProsperity(c)+3,0,100)});
  S.decisions.census=18;log("The crown completed a Royal Census across its lands.","court");toast("Royal Census completed");render();saveSilent();
}
function decision(id){return id==="census"?fabricateCensus():baseDecision10(id)}
function renderDecisions(){
  baseRenderDecisions10();
  $("decisions").insertAdjacentHTML("beforeend","<button class='decision-card' data-decision='census'><b>Royal Census</b><span>-25 gold · +control · +prosperity realm-wide</span><small>"+((S.decisions.census||0)>0?S.decisions.census+" mo remaining":"18 mo cooldown")+"</small></button>");
  document.querySelectorAll("[data-decision]").forEach(b=>b.onclick=()=>{S.pendingDecision=b.dataset.decision;decision(b.dataset.decision)});
}
function renderRealm(){
  baseRenderRealm10();
  let box=$("realmSimulation");
  if(!box){box=document.createElement("div");box.id="realmSimulation";const anchor=$("society");anchor?.parentElement?.appendChild(box)}
  const counties=WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder)).sort((a,b)=>realmProsperity(b)-realmProsperity(a));
  const avg=counties.length?counties.reduce((n,c)=>n+realmProsperity(c),0)/counties.length:0;
  box.innerHTML="<div class='section-title'>Realm simulation</div><div class='realm-metrics'><div><span>Average prosperity</span><b>"+avg.toFixed(1)+"</b></div><div><span>Trade income</span><b>+"+S.realm.tradeIncome.toFixed(2)+"/mo</b></div><div><span>Controlled counties</span><b>"+counties.length+"</b></div></div><div class='realm-ledger'>"+counties.map(c=>{const p=realmProsperity(c),state=p>=75?"Prosperous":p>=50?"Stable":p>=30?"Strained":"Poor";return "<button class='ledger-row' data-realm-county='"+c.id+"'><span><b>"+esc(c.name)+"</b><small>"+state+" · Control "+Math.round(c.control)+" · Dev "+c.dev+"</small></span><strong>"+Math.round(p)+"</strong></button>"}).join("")+"</div>";
  document.querySelectorAll("[data-realm-county]").forEach(b=>b.onclick=()=>{S.selectedCounty=b.dataset.realmCounty;render()});
}
function syncWorldState(){
  baseSync10();S.version=10;S.countyState=S.countyState||{};
  WORLD.counties.forEach(c=>{if(S.countyState[c.id]){S.countyState[c.id].prosperity=realmProsperity(c);S.countyState[c.id].tradeValue=countyTradeValue(c)}});
}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE10,JSON.stringify(S))}catch(e){}}
function reset(){localStorage.removeItem(SAVE10);localStorage.removeItem("dynasty_realms_save_v09");localStorage.removeItem("dynasty_realms_save_v08");localStorage.removeItem("dynasty_realms_save_v07");localStorage.removeItem("dynasty_realms_save_v06");localStorage.removeItem("dynasty_realms_save_v05");localStorage.removeItem("dynasty_realms_save_v03");localStorage.removeItem("dynasty_realms_save_v02");location.reload()}
function monthlyTick(){
  const wasPaused=S.paused;
  baseMonthlyTick10();
  if(!wasPaused){processRealmSimulation();aiRealmAdministration();S.decisions.census=Math.max(0,(S.decisions.census||0)-1);render();saveSilent()}
}
initRealm10();normalizeWarState();render();saveSilent();
