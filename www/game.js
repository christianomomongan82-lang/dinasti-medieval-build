const KEY="dynasty_realms_save_v05";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const char=id=>WORLD.characters[id];
const county=id=>WORLD.counties.find(c=>c.id===id);
const duchy=id=>WORLD.duchies.find(d=>d.id===id);
const title=id=>WORLD.titles.find(t=>t.id===id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pick=a=>a[Math.floor(Math.random()*a.length)];

function freshState(){
  return {version:5,year:1066,month:9,day:3,paused:false,speed:1,selectedCounty:"c_northwatch",
    gold:72,prestige:85,piety:40,legitimacy:78,stress:18,levies:1280,troopCap:1900,
    succession:"male_preference",crownAuthority:"low",culture:"Arvendic",faith:"Old Church",
    rulerId:"c_edric",heirId:"c_rowan",claimCounty:null,
    council:{chancellor:"c_mara",marshal:"c_bren",steward:"c_elira",spymaster:"c_merek",chaplain:"c_sera"},
    relations:{c_bren:61,c_elira:74,c_roderic:-24,c_merek:-10,c_sera:18,c_alden:25,c_hadrik:42},
    marriages:[{a:"c_edric",b:"c_mara",year:1062}],children:["c_alina","c_rowan"],customCharacters:{},
    titleHolders:{k_arvend:"c_edric",d_north:"c_edric",d_east:"c_roderic",d_gold:"c_alden"},
    countyState:{},
    factions:[],wars:[],
    councilTasks:{chancellor:{task:"idle",progress:0},marshal:{task:"idle",progress:0},steward:{task:"idle",progress:0},spymaster:{task:"idle",progress:0},chaplain:{task:"idle",progress:0}},
    armies:[{id:"a_main",name:"Northern Host",men:1000,levy:850,menAtArms:150,morale:100,commander:"c_edric",location:"c_northwatch",supply:100,fatigue:0,raised:true}],
    events:[
      {text:"Border scouts report increased levies in Sunmere.",when:"3 days ago",kind:"war"},
      {text:"A travelling jurist offers to settle an inheritance dispute.",when:"5 days ago",kind:"court"},
      {text:"Lady Alina has begun her studies in rhetoric.",when:"8 days ago",kind:"dynasty"}]};
}

function applyWorldState(){
  Object.values(S.customCharacters||{}).forEach(c=>WORLD.characters[c.id]=c);
  Object.entries(S.countyState||{}).forEach(([id,v])=>Object.assign(county(id)||{},v));
  Object.entries(S.titleHolders||{}).forEach(([id,h])=>{const t=title(id);if(t)t.holder=h;const d=WORLD.duchies.find(x=>x.id===id);if(d)d.holder=h;if(id==="k_arvend")WORLD.kingdom.holder=h});
  WORLD.counties.forEach(c=>{
    const t=title(c.id);if(t)c.holder=t.holder;
    const b=title(c.id+"_barony");if(b)b.holder=c.holder;
    c.status=c.holder===S.rulerId||isPlayerVassal(c.holder)?"yours":c.status==="rival"?"rival":"neutral";
  });
}
function syncWorldState(){
  S.countyState={};
  WORLD.counties.forEach(c=>S.countyState[c.id]={holder:c.holder,status:c.status,dev:c.dev,tax:c.tax,garrison:c.garrison,levy:c.levy,control:c.control,siege:c.siege,culture:c.culture,faith:c.faith,fort:c.fort});
  S.titleHolders={};WORLD.titles.forEach(t=>S.titleHolders[t.id]=t.holder);
  Object.values(WORLD.characters).filter(c=>S.customCharacters&&S.customCharacters[c.id]).forEach(c=>S.customCharacters[c.id]=c);
}
function load(){
  try{
    const raw=localStorage.getItem(KEY)||localStorage.getItem("dynasty_realms_save_v03")||localStorage.getItem("dynasty_realms_save_v02");
    if(!raw)return null;
    const x=JSON.parse(raw),n=freshState();Object.assign(n,x,{version:5});
    n.events=Array.isArray(n.events)?n.events:n.events||[];
    n.marriages=Array.isArray(n.marriages)?n.marriages:[];
    n.children=Array.isArray(n.children)?n.children:["c_alina","c_rowan"];
    n.customCharacters=n.customCharacters&&typeof n.customCharacters==="object"?n.customCharacters:{};
    n.titleHolders=n.titleHolders&&typeof n.titleHolders==="object"?n.titleHolders:n.titles?.titleHolders||freshState().titleHolders;
    n.countyState=n.countyState&&typeof n.countyState==="object"?n.countyState:{};
    if(Array.isArray(n.wars)&&n.wars.length===0&&x.war)n.wars=[x.war];
    n.wars=Array.isArray(n.wars)?n.wars:[];
    n.factions=Array.isArray(n.factions)?n.factions:[];
    n.councilTasks=n.councilTasks||freshState().councilTasks;
    n.armies=Array.isArray(n.armies)&&n.armies.length?n.armies:freshState().armies;
    n.council=n.council||freshState().council;n.relations=n.relations||{};
    Object.values(n.customCharacters).forEach(c=>{c.children=c.children||[];c.health=c.health??100;c.fertility=c.fertility??.7});
    return n;
  }catch(e){return null}
}
let S=load()||freshState();
if(!S.titleHolders)S.titleHolders=freshState().titleHolders;
if(!S.countyState)S.countyState={};
applyWorldState();rebuildHeir();

function saveSilent(){syncWorldState();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function save(){saveSilent();toast("Game saved")}
function reset(){localStorage.removeItem(KEY);localStorage.removeItem("dynasty_realms_save_v03");localStorage.removeItem("dynasty_realms_save_v02");location.reload()}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1700)}
function log(text,kind="court"){S.events.unshift({text,when:"Now",kind});S.events=S.events.slice(0,16)}
function ruler(){return char(S.rulerId)}
function heir(){return char(S.heirId)}
function titleHolder(id){return S.titleHolders[id]||title(id)?.holder}
function setTitleHolder(id,h){S.titleHolders[id]=h;const t=title(id);if(t)t.holder=h;const d=duchy(id);if(d)d.holder=h;if(id==="k_arvend")WORLD.kingdom.holder=h;if(county(id)){county(id).holder=h;county(id).status=h===S.rulerId||isPlayerVassal(h)?"yours":"neutral";if(title(id+"_barony"))title(id+"_barony").holder=h}}
function ownedCounties(){return WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder))}
function isPlayerVassal(id){
  if(!id)return false;if(id===S.rulerId)return true;
  const dh=duchy(WORLD.counties.find(c=>c.holder===id)?.duchy||"");return dh?titleHolder(dh.id)===S.rulerId:false;
}
function countyLiege(c){
  if(!c)return null;const dh=titleHolder(c.duchy);return dh===c.holder?titleHolder("k_arvend"):dh;
}
function directVassalCharacters(){
  const ids=new Set();
  WORLD.counties.forEach(c=>{if(c.holder!==S.rulerId&&countyLiege(c)===S.rulerId)ids.add(c.holder)});
  WORLD.duchies.forEach(d=>{if(titleHolder(d.id)===S.rulerId)return; if(titleHolder(d.id)!==S.rulerId&&d.id==="d_north"){}});
  return [...ids].map(char).filter(Boolean);
}
function directVassalCounties(){return WORLD.counties.filter(c=>c.holder!==S.rulerId&&countyLiege(c)===S.rulerId)}
function realmTax(){
  const st=char(S.council.steward),eff=1+clamp(((st?.stewardship||5)-8)*.025,-.25,.45);
  return ownedCounties().reduce((n,c)=>n+c.tax*(c.dev/7)*eff*(.55+c.control/100*.45),0);
}
function opinion(id){return S.relations[id]??char(id)?.opinion??0}
function totalLevySource(){return ownedCounties().reduce((n,c)=>n+c.levy,0)}
function playerPower(){return S.armies.filter(a=>a.raised).reduce((n,a)=>n+a.men,0)+ownedCounties().reduce((n,c)=>n+c.garrison,0)}
function realmArmies(){return S.armies.filter(a=>a.raised)}
function activeWar(id){return S.wars.find(w=>w.id===id)}
function externalWars(){return S.wars.filter(w=>w.kind!=="revolt")}
function revoltWars(){return S.wars.filter(w=>w.kind==="revolt")}
function enemyTitleHolder(c){return c?titleHolder(c.duchy):null}
function enemyPower(c){return c?(c.levy+c.garrison):0}
function terrainMod(t){return ({plains:1,forest:.9,hills:.95,mountains:.78,coast:.97}[t]||1)}

function renderTop(){
  $("year").textContent=S.year+"."+String(S.month).padStart(2,"0");
  $("gold").textContent=Math.floor(S.gold);$("prestige").textContent=Math.floor(S.prestige);$("piety").textContent=Math.floor(S.piety);
  $("levies").textContent=Math.floor(S.levies);$("age").textContent=ruler().age.toFixed(1)+" years";$("stress").textContent=Math.round(S.stress);$("legitimacy").textContent=Math.round(S.legitimacy);
  $("rulerTitle").textContent=ruler().title;
}
function renderMap(){
  $("mapRegions").innerHTML=WORLD.counties.map(c=>"<polygon class='region "+(c.status==="yours"?"yours":c.status==="rival"?"rival":"neutral")+(c.id===S.selectedCounty?" selected":"")+"' data-id='"+c.id+"' points='"+c.points+"'></polygon>").join("");
  $("mapLabels").innerHTML=WORLD.counties.map(c=>"<text class='map-label' x='"+c.x+"' y='"+c.y+"'>"+esc(c.name)+"</text>").join("");
  document.querySelectorAll(".region").forEach(e=>e.onclick=()=>{S.selectedCounty=e.dataset.id;render()});
}
function renderTitles(){
  const c=county(S.selectedCounty),d=duchy(c.duchy);
  $("baronyTitle").textContent=c.barony;$("countyTitle").textContent=c.name;$("duchyTitle").textContent=d.name.replace("Duchy of ","");$("kingdomTitle").textContent=WORLD.kingdom.name;
  $("realmTier").textContent=ownedCounties().length>=6?"KINGDOM":ownedCounties().length>=3?"DUCHY":"COUNTY";
  const branches=WORLD.duchies.map(dh=>{
    const counties=WORLD.counties.filter(cn=>cn.duchy===dh.id),owner=char(titleHolder(dh.id));
    return "<div class='title-branch'><b>"+esc(dh.name)+"</b><span>Duke: "+esc(owner?.name||"Vacant")+"</span><small>"+counties.map(cn=>cn.name+" — "+(char(cn.holder)?.name||"Vacant")).join(" · ")+"</small></div>";
  }).join("");
  $("titleHierarchy").innerHTML=branches;$("titleHierarchyRealm").innerHTML=branches;
}
function renderSelected(){
  const c=county(S.selectedCounty),h=char(c.holder),d=duchy(c.duchy);
  $("countyName").textContent=c.name;$("countyHolder").textContent=h?.name||"Vacant";$("countyDev").textContent=c.dev;$("countyTax").textContent=c.tax.toFixed(1)+"/mo";$("countyGarrison").textContent=c.garrison;$("countyLevy").textContent=c.levy;$("countyDuchy").textContent=d.name.replace("Duchy of ","");
  $("countyStatus").textContent=c.status==="yours"?(c.holder===S.rulerId?"DIRECT DOMAIN":"VASSAL DOMAIN"):c.status==="rival"?"RIVAL":"INDEPENDENT";
  let actions=[];
  if(c.status==="rival")actions=[["Fabricate Claim","-35 prestige","claim"],["Declare War","Requires adjacency + claim","war"],["Sway Ruler","+20 opinion","sway"],["Scout Province","Reveal strength","inspect"]];
  else if(c.status!=="yours")actions=[["Fabricate Claim","-35 prestige","claim"],["Send Gift","-15 gold · +25 opinion","gift"],["Arrange Marriage","Adult dynastic match","marry"],["Invite to Court","+10 opinion","invite"]];
  else if(c.holder!==S.rulerId)actions=[["Revoke Title","Risk faction revolt","revoke"],["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+troops · -12 gold","levy"],["Sway Vassal","+20 opinion","sway"]];
  else actions=[["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+troops · -12 gold","levy"],["Recruit Men-at-Arms","-35 gold · +100 MAA","recruit"],["Grant Title","Choose a direct vassal","grant"]];
  $("countyActions").innerHTML=actions.map(a=>"<button class='action-btn' data-action='"+a[2]+"'><b>"+esc(a[0])+"</b><span>"+esc(a[1])+"</span></button>").join("");
  document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderRuler(){
  const r=ruler(),h=heir();
  $("rulerName").textContent=r.name;$("rulerDynasty").textContent=r.dynasty;$("succession").textContent=S.succession.replace("_"," ");
  $("rulerStats").innerHTML=[["MART",r.martial],["DIP",r.diplomacy],["STEW",r.stewardship],["INTR",r.intrigue],["LEARN",r.learning]].map(x=>"<div><span>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("");
  $("traits").innerHTML=(r.traits||[]).map(t=>"<span class='trait'>"+esc(t)+"</span>").join("");
  $("heir").textContent=h?h.name+" · age "+h.age.toFixed(0):"No eligible heir";$("spouse").textContent=r.spouse?char(r.spouse)?.name:"None";$("dynasty").textContent=r.dynasty;
}
function renderSociety(){
  const owned=ownedCounties(),cult={},faith={};owned.forEach(c=>{cult[c.culture]=(cult[c.culture]||0)+1;faith[c.faith]=(faith[c.faith]||0)+1});
  const topCult=Object.keys(cult).sort((a,b)=>cult[b]-cult[a])[0]||"arvendic",topFaith=Object.keys(faith).sort((a,b)=>faith[b]-faith[a])[0]||"old_church";
  const sc=WORLD.laws.succession.find(x=>x.id===S.succession)||WORLD.laws.succession[0],ca=WORLD.laws.authority.find(x=>x.id===S.crownAuthority)||WORLD.laws.authority[0];
  const control=owned.length?Math.round(owned.reduce((n,c)=>n+c.control,0)/owned.length):0;
  $("society").innerHTML="<div class='society-item'><span class='eyebrow'>CULTURE</span><b>"+esc(WORLD.cultures[topCult].name)+"</b><small>"+esc(WORLD.cultures[topCult].description)+"</small></div><div class='society-item'><span class='eyebrow'>FAITH</span><b>"+esc(WORLD.faiths[topFaith].name)+"</b><small>"+esc(WORLD.faiths[topFaith].description)+"</small></div><div class='society-item'><span class='eyebrow'>SUCCESSION</span><b>"+esc(sc.name)+"</b><small>"+esc(sc.desc)+"</small><button class='order-btn' data-action='law_succession_equal'>Adopt Equal · 150 prestige</button></div><div class='society-item'><span class='eyebrow'>CROWN AUTHORITY</span><b>"+esc(ca.name)+"</b><small>"+esc(ca.desc)+"</small><button class='order-btn' data-action='law_authority_medium'>Raise Authority · 180 prestige</button></div><div class='society-item'><span class='eyebrow'>COUNTY CONTROL</span><b>"+control+"%</b><small>Low control reduces taxes and levy output.</small></div><div class='society-item'><span class='eyebrow'>DIVERSITY</span><b>"+Object.keys(cult).length+" cultures · "+Object.keys(faith).length+" faiths</b><small>Culture and faith mismatches increase political pressure.</small></div>";
  document.querySelectorAll("#tab-realm [data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderRealm(){
  $("domainCount").textContent=ownedCounties().length;$("duchyCount").textContent=WORLD.duchies.filter(d=>titleHolder(d.id)===S.rulerId).length;
  $("realmTax").textContent=realmTax().toFixed(1);$("armyPower").textContent=Math.floor(playerPower());$("law").textContent=S.succession.replace("_"," ");$("authority").textContent=S.crownAuthority;
  $("legitimacyDyn").textContent=Math.round(S.legitimacy);renderSociety();
}
function renderCouncilTasks(){
  const specs=[["Chancellor","chancellor","Reconcile Vassals","Improve the most hostile vassal."],["Marshal","marshal","Organize Levies","Prepare fresh troops."],["Steward","steward","Audit Taxes","Recover hidden revenue."],["Spymaster","spymaster","Find Secrets","Create leverage over a rival."],["Chaplain","chaplain","Religious Study","Generate piety and legitimacy."]];
  $("councilTasks").innerHTML=specs.map(x=>{const st=S.councilTasks[x[1]];return "<div class='task-row'><div><b>"+x[0]+" · "+x[2]+"</b><span>"+x[3]+"</span></div><button data-task='"+x[1]+"'>"+(st.task==="idle"?"Start":"Active")+" "+Math.round(st.progress)+"%</button></div>"}).join("");
  document.querySelectorAll("#councilTasks [data-task]").forEach(b=>b.onclick=()=>startTask(b.dataset.task));
}
function startTask(role){const st=S.councilTasks[role];if(!st)return;st.task=st.task==="idle"?"active":st.task;toast("Council task active");render()}
function processCouncilTasks(){
  const map={chancellor:"diplomacy",marshal:"martial",steward:"stewardship",spymaster:"intrigue",chaplain:"learning"};
  Object.keys(S.councilTasks).forEach(role=>{
    const st=S.councilTasks[role];if(st.task==="idle")return;const c=char(S.council[role]),skill=c?.[map[role]]||5;st.progress+=Math.max(3,skill*.75);
    if(st.progress<100)return;st.progress=0;st.task="idle";
    if(role==="chancellor"){const v=directVassalCharacters().sort((a,b)=>opinion(a.id)-opinion(b.id))[0];if(v){S.relations[v.id]=clamp(opinion(v.id)+20,-100,100);log("The chancellor reconciled with "+v.name+".","court")}}
    else if(role==="marshal"){recruitTroops(180,false);log("The marshal completed levy preparations. +180 troops.","war")}
    else if(role==="steward"){S.gold+=25;log("The steward recovered overdue taxes. +25 gold.","court")}
    else if(role==="spymaster"){const e=WORLD.counties.filter(c=>c.status==="rival"),t=pick(e);if(t){S.claimCounty=t.id;log("Evidence strengthened your claim on "+t.name+".","court")}}
    else{S.piety+=25;S.legitimacy=clamp(S.legitimacy+2,0,100);log("The chaplain completed a religious study. +25 piety.","dynasty")}
  });
}
function renderCourt(){
  const rows=[["Chancellor",S.council.chancellor,"Diplomacy"],["Marshal",S.council.marshal,"Army"],["Steward",S.council.steward,"Taxes"],["Spymaster",S.council.spymaster,"Intrigue"],["Chaplain",S.council.chaplain,"Faith"]];
  $("council").innerHTML=rows.map(x=>"<div class='court-row'><div><b>"+esc(x[0])+"</b><span>"+esc(x[2])+"</span></div><strong>"+esc(char(x[1])?.name||"Vacant")+"</strong><em>"+(char(x[1])?.[x[0]==="Chancellor"?"diplomacy":x[0]==="Marshal"?"martial":x[0]==="Steward"?"stewardship":x[0]==="Spymaster"?"intrigue":"learning"]||0)+"</em></div>").join("");
  $("vassals").innerHTML=directVassalCharacters().map(v=>"<button class='list-row' data-char='"+v.id+"'><span>"+esc(v.name)+"</span><b>"+opinion(v.id)+"</b><small>"+esc(titleNameForHolder(v.id))+" · "+esc(v.title)+"</small></button>").join("")||"<div class='empty'>No direct county vassals report to your crown.</div>";
  document.querySelectorAll("#tab-court [data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char));renderCouncilTasks();
}
function titleNameForHolder(id){const c=WORLD.counties.find(x=>x.holder===id);return c?c.name:"Court";}

function descendantsOf(id){
  const out=[],seen=new Set();
  function walk(p,depth){(char(p)?.children||[]).forEach(cid=>{if(seen.has(cid))return;const c=char(cid);if(!c||!c.alive)return;seen.add(cid);out.push({c,depth});walk(cid,depth+1)})}
  walk(id,1);return out;
}
function successionCandidates(){
  const r=ruler(),ds=descendantsOf(r.id);
  const fam=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===r.dynasty&&c.id!==r.id);
  const pool=ds.map(x=>x.c).concat(fam.filter(c=>!ds.some(d=>d.c.id===c.id)));
  const eligible=pool.filter(c=>S.succession!=="male_only"||c.sex==="m");
  const rank=c=>{const d=ds.find(x=>x.c.id===c.id);return d?d.depth:9};
  return [...new Map(eligible.map(c=>[c.id,c])).values()].sort((a,b)=>{
    const ra=rank(a),rb=rank(b);if(ra!==rb)return ra-rb;
    if(S.succession==="male_preference"&&a.sex!==b.sex)return a.sex==="m"?-1:1;
    return a.age-b.age;
  });
}
function rebuildHeir(){const c=successionCandidates()[0];S.heirId=c?.id||null}
function renderDynasty(){
  const r=ruler(),members=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===r.dynasty);
  $("dynastySize").textContent=members.length;$("successionListLaw").textContent=S.succession.replace("_"," ");$("legitimacyDyn").textContent=Math.round(S.legitimacy);
  $("marriages").innerHTML=(S.marriages||[]).slice(-8).reverse().map(m=>"<div class='marriage-row'><b>"+esc(char(m.a)?.name||"Unknown")+" × "+esc(char(m.b)?.name||"Unknown")+"</b><small>Dynastic tie · "+m.year+"</small></div>").join("")||"<div class='empty'>No recorded dynastic marriages.</div>";
  const kids=(r.children||[]).map(id=>char(id)).filter(Boolean);
  $("familyTree").innerHTML="<div class='family-summary'>"+esc(r.name)+" and "+esc(char(r.spouse)?.name||"no spouse")+" have "+kids.length+" known children. Bloodline order now follows the active succession law.</div><div class='family-links'>"+[r,char(r.spouse),...kids].filter(Boolean).map(c=>"<button class='family-card' data-char='"+c.id+"'><b>"+esc(c.name)+"</b><small>"+esc(c.title)+" · "+Math.floor(c.age)+" · "+(c.alive?"living":"dead")+"</small></button>").join("")+"</div>";
  $("successionList").innerHTML=successionCandidates().slice(0,10).map((c,i)=>"<button class='list-row' data-char='"+c.id+"'><span>"+esc(c.name)+"</span><b>"+(i===0?"HEIR":"#"+(i+1))+"</b><small>"+c.age.toFixed(0)+" · "+esc(c.title)+" · "+esc(c.sex==="m"?"male":"female")+"</small></button>").join("")||"<div class='empty'>No eligible heir.</div>";
  document.querySelectorAll("#tab-dynasty [data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char));
}
function renderFactions(){
  updateFactions();
  if(!S.factions.length){$("factions").innerHTML="<div class='empty'>No organized faction is strong enough to threaten the crown.</div>";return}
  $("factions").innerHTML=S.factions.map(f=>{
    const kind=f.type==="liberty"?"Liberty":f.type==="claimant"?"Claimant":"Independence";
    const leader=char(f.leader),str=Math.round(f.strength);
    const countdown=f.ultimatum>0?" · ultimatum "+f.ultimatum+" mo":"";
    return "<div class='faction'><div class='faction-name'><b>"+esc(leader?.name||"Unknown")+" · "+kind+"</b><span>"+esc(f.demand)+countdown+"</span><div class='faction-actions'><button data-faction='"+f.id+"' data-faction-action='concede'>Concede</button><button data-faction='"+f.id+"' data-faction-action='defy'>Defy</button></div></div><strong class='"+(str>=80?"danger":"")+"'>"+str+"%</strong></div>";
  }).join("");
  document.querySelectorAll("[data-faction-action]").forEach(b=>b.onclick=()=>handleFaction(b.dataset.faction,b.dataset.factionAction));
}
function updateFactions(){
  const vassals=directVassalCharacters();
  const libertyMembers=vassals.filter(v=>opinion(v.id)<35||S.crownAuthority!=="low");
  const claimantMembers=vassals.filter(v=>S.claimCounty&&county(S.claimCounty)?.status==="rival"&&opinion(v.id)<20);
  const independenceMembers=vassals.filter(v=>opinion(v.id)<0);
  const defs=[
    {id:"f_liberty",type:"liberty",members:libertyMembers,demand:"Reduce Crown Authority.",min:2},
    {id:"f_claimant",type:"claimant",members:claimantMembers,demand:"Press a hostile claimant's cause.",min:2},
    {id:"f_independence",type:"independence",members:independenceMembers,demand:"Accept the faction's independence.",min:2}
  ];
  S.factions=defs.filter(d=>d.members.length>=d.min).map(d=>{
    const army=d.members.reduce((n,v)=>n+vassalPower(v.id),0),str=clamp(army/Math.max(1,playerPower())*100,5,100);
    const old=S.factions.find(f=>f.id===d.id);
    return {id:d.id,type:d.type,members:d.members.map(v=>v.id),leader:d.members.sort((a,b)=>vassalPower(b.id)-vassalPower(a.id))[0].id,demand:d.demand,strength:str,ultimatum:old?.ultimatum||0};
  });
  S.factions.forEach(f=>{if(f.strength>=80&&f.ultimatum<=0)f.ultimatum=3});
}
function vassalPower(id){return WORLD.counties.filter(c=>c.holder===id).reduce((n,c)=>n+c.levy+c.garrison,0)}
function handleFaction(fid,choice){
  const f=S.factions.find(x=>x.id===fid);if(!f)return;
  if(choice==="concede"){S.crownAuthority=f.type==="liberty"?"low":S.crownAuthority;f.members.forEach(id=>S.relations[id]=clamp(opinion(id)+25,-100,100));S.legitimacy=clamp(S.legitimacy-2,0,100);log(char(f.leader).name+" accepted a royal concession.","court");toast("Faction appeased")}
  else{createRevolt(f);toast("The faction has risen in revolt")}
  S.factions=S.factions.filter(x=>x.id!==fid);render();saveSilent();
}
function createRevolt(f){
  const provinces=f.members.flatMap(id=>WORLD.counties.filter(c=>c.holder===id).map(c=>c.id));
  const army=f.members.reduce((n,id)=>n+vassalPower(id),0);
  S.wars.push({id:"w_revolt_"+Date.now().toString(36),kind:"revolt",name:f.type==="independence"?"Vassal Independence War":f.type==="claimant"?"Claimant Rising":"Liberty Revolt",target:provinces[0]||S.selectedCounty,score:0,months:0,siege:0,enemy:army,rebels:f.members.slice()});
  S.legitimacy=clamp(S.legitimacy-8,0,100);S.stress=clamp(S.stress+10,0,100);log("The "+f.type+" faction has risen in open revolt.","war");
}
function renderArmy(){
  $("armyCard").innerHTML=S.armies.map((a,i)=>{
    const cmd=char(a.commander),loc=county(a.location);
    return "<div class='army-card'><div class='army-row'><div><b>"+esc(a.name)+"</b><span>Commander: "+esc(cmd?.name||"None")+" · "+esc(loc?.name||"Unknown")+"</span></div><strong>"+Math.floor(a.men)+"</strong></div><div class='army-details'><div><span>Levy</span><b>"+Math.floor(a.levy)+"</b></div><div><span>Men-at-Arms</span><b>"+Math.floor(a.menAtArms)+"</b></div><div><span>Morale</span><b>"+Math.round(a.morale)+"%</b></div><div><span>Supply</span><b>"+Math.round(a.supply)+"%</b></div><div><span>Fatigue</span><b>"+Math.round(a.fatigue)+"</b></div><div><span>Terrain</span><b>"+esc(loc?.terrain||"?")+"</b></div></div><div class='army-controls'><button data-army='"+a.id+"' data-army-action='marshal'>Use as Main Army</button><button data-army='"+a.id+"' data-army-action='disband'>Disband</button></div></div>"
  }).join("");
  document.querySelectorAll("[data-army-action]").forEach(b=>b.onclick=()=>armyAction(b.dataset.army,b.dataset.armyAction));
}
function renderArmyOrders(){
  const a=S.armies[0];if(!a){$("armyOrders").innerHTML="<div class='empty'>No army available.</div>";return}
  const targets=(WORLD.adjacency[a.location]||[]).map(id=>county(id)).filter(Boolean);
  $("armyOrders").innerHTML="<div class='order-grid'>"+targets.map(t=>"<button class='order-btn' data-move='"+t.id+"'><b>March to "+esc(t.name)+"</b><span>"+(t.status==="rival"?"Enemy territory":t.status==="neutral"?"Independent":"Friendly")+" · "+esc(t.terrain)+"</span></button>").join("")+"</div>";
  document.querySelectorAll("[data-move]").forEach(b=>b.onclick=()=>{a.location=b.dataset.move;a.fatigue+=4;log(a.name+" marched to "+county(a.location).name,"war");toast("Army moved");render();saveSilent()});
}
function renderWar(){
  const wars=S.wars;
  if(!wars.length){$("warCard").innerHTML="<div class='empty'>No active war.</div>";return}
  $("warCard").innerHTML=wars.map(w=>{
    const t=county(w.target),bar=clamp(w.score,-100,100),army=S.armies.find(a=>a.raised)||S.armies[0];
    return "<div class='war-card'><div class='war-title'><div><span class='eyebrow'>"+esc(w.kind==="revolt"?"INTERNAL WAR":"ACTIVE WAR")+"</span><h3>"+esc(w.name)+"</h3><span class='muted'>"+esc(t?.name||"Unknown target")+"</span></div><b>"+Math.round(bar)+"%</b></div><div class='bar'><i style='width:"+((bar+100)/2)+"%'></i></div><div class='war-grid'><div><span>Your army</span><b>"+Math.floor(army?.men||0)+"</b></div><div><span>Enemy</span><b>"+Math.floor(w.kind==="revolt"?w.enemy:enemyPower(t))+"</b></div><div><span>Duration</span><b>"+w.months+" mo</b></div><div><span>Siege</span><b>"+Math.round(w.siege)+"%</b></div><div><span>Target fort</span><b>"+(t?.fort||0)+"</b></div><div><span>Claim</span><b>"+(w.kind==="revolt"?"—":(S.claimCounty===w.target?"Valid":"Needed"))+"</b></div></div><div class='action-grid'><button class='action-btn' data-war='"+w.id+"' data-war-action='battle'><b>Force Battle</b><span>Fight using the main army</span></button><button class='action-btn' data-war='"+w.id+"' data-war-action='peace'><b>"+(w.kind==="revolt"?"Offer Terms":"Peace / Surrender")+"</b><span>Resolve the war</span></button></div></div>";
  }).join("");
  document.querySelectorAll("[data-war-action]").forEach(b=>b.onclick=()=>warAction(b.dataset.war,b.dataset.warAction));
}
function renderEvents(){$("events").innerHTML=S.events.map(e=>"<div class='event'><i class='event-dot "+esc(e.kind)+"'></i><div><p>"+esc(e.text)+"</p><time>"+esc(e.when)+"</time></div></div>").join("")}
function render(){renderTop();renderMap();renderTitles();renderSelected();renderRuler();renderRealm();renderCourt();renderDynasty();renderFactions();renderWar();renderArmy();renderArmyOrders();renderEvents()}

function recruitTroops(amount,charge=true){
  if(charge&&S.gold<12)return false;if(charge)S.gold-=12;
  S.levies=Math.min(S.troopCap,S.levies+amount);
  const a=S.armies[0]||null;if(a){a.men=Math.min(S.troopCap,a.men+amount);a.levy+=amount}
  return true
}
function recruitMAA(){
  if(S.gold<35)return toast("Need 35 gold");S.gold-=35;S.troopCap+=100;const a=S.armies[0];a.men+=100;a.menAtArms+=100;log("The crown recruited 100 men-at-arms.","war");toast("Men-at-Arms recruited")
}
function armyAction(id,act){
  const a=S.armies.find(x=>x.id===id);if(!a)return;
  if(act==="marshal"){S.armies.forEach(x=>x.raised=false);a.raised=true;log(a.name+" is now the primary host.","war");toast("Main army selected")}
  else if(act==="disband"){if(S.armies.length===1)return toast("Keep one army");S.levies=Math.min(S.troopCap,S.levies+a.levy);S.armies=S.armies.filter(x=>x.id!==id);toast("Army disbanded")}
  render();saveSilent();
}
function splitArmy(){
  const a=S.armies[0];if(!a||a.men<400)return toast("Need at least 400 troops to split");
  const moved=Math.floor(a.men/2),lev=Math.floor(a.levy/2),maa=Math.max(0,moved-lev);
  a.men-=moved;a.levy-=lev;a.menAtArms-=maa;
  S.armies.push({id:"a_"+Date.now().toString(36),name:"Field Host "+(S.armies.length+1),men:moved,levy:lev,menAtArms:maa,morale:a.morale,supply:a.supply,fatigue:a.fatigue,commander:S.council.marshal,location:a.location,raised:true});
  log("The Northern Host was split into two field armies.","war");toast("Army split");render();saveSilent();
}
function battleWar(w){
  const a=S.armies.find(x=>x.raised)||S.armies[0];if(!a)return;
  const t=county(w.target);let def=w.kind==="revolt"?w.enemy:enemyPower(t);const cmd=char(a.commander),skill=cmd?.martial||5,terrain=terrainMod(t?.terrain);
  const attack=Math.max(1,a.men)*(1+skill*.025)*(a.morale/100)*(a.supply/100)*terrain;
  const defense=Math.max(1,def)*(w.kind==="revolt"?1.05:1+((t?.fort||1)*.02));
  const ratio=attack/defense,loss=Math.max(18,Math.floor(def*(ratio>.95?.08:.14)));
  a.men=Math.max(0,a.men-loss);a.levy=Math.max(0,a.levy-Math.min(a.levy,Math.floor(loss*.75)));a.morale=clamp(a.morale-(ratio>.95?4:13),0,100);a.fatigue+=ratio>.95?6:11;
  if(w.kind!=="revolt"&&t) t.garrison=Math.max(0,t.garrison-Math.floor(loss*.35));
  if(w.kind==="revolt")w.enemy=Math.max(0,w.enemy-loss);
  if(ratio>.95){w.score+=18+Math.floor(Math.random()*12);w.siege=clamp((w.siege||0)+(w.kind==="revolt"?10:14),0,100);log("Victory in battle near "+(t?.name||"the rebel heartland")+".","war");toast("Victory")}
  else{w.score-=12;log("The army was repulsed at "+(t?.name||"the target")+".","war");toast("Defeat")}
}
function warAction(id,act){
  const w=activeWar(id);if(!w)return;if(act==="battle")battleWar(w);
  else if(act==="peace"){
    if(w.kind==="revolt"&&w.score>=30){endWar(w,"concession");toast("Rebels accepted terms")}
    else if(w.kind!=="revolt"&&w.score>=60){endWar(w,"victory");toast("War won")}
    else if(w.score>=0){toast("Terms rejected")}
    else{endWar(w,"white_peace");toast("White peace")}
  }
  render();saveSilent();
}
function endWar(w,result){
  const t=county(w.target);
  if(w.kind==="revolt"){
    if(result==="concession"){w.rebels.forEach(id=>S.relations[id]=clamp(opinion(id)+30,-100,100));}
    else if(result==="defeat"){w.rebels.forEach(id=>{S.relations[id]=Math.max(-100,opinion(id)-25);const c=WORLD.counties.find(x=>x.holder===id);if(c)c.control=55})}
  }else if(t&&result==="victory"){
    t.status="yours";setTitleHolder(t.id,S.rulerId);S.prestige+=50;S.legitimacy=clamp(S.legitimacy+5,0,100);S.claimCounty=null;
  }
  S.wars=S.wars.filter(x=>x.id!==w.id);log(w.name+" has ended: "+result.replace("_"," ") ,"war");
}
function monthlyWar(w){
  const a=S.armies.find(x=>x.raised)||S.armies[0],t=county(w.target);w.months++;
  if(!a)return;
  const atTarget=a.location===w.target;
  const commander=char(a.commander),siegeSkill=(commander?.martial||5)*.35+(a.menAtArms>0?1.5:0);
  if(atTarget)w.siege=clamp((w.siege||0)+Math.max(2,(a.men/Math.max(1,(t?.fort||1)*220))*3+siegeSkill),0,100);
  if(atTarget&&w.siege>=100)w.score+=7;
  else if(atTarget)w.score+=a.men/(Math.max(1,(w.kind==="revolt"?w.enemy:enemyPower(t))))>.9?3:0;
  else w.score-=1;
  if(w.kind==="revolt"){w.enemy=Math.max(0,w.enemy-(atTarget?18:0));}
  if(w.score>=100||(w.kind==="revolt"&&w.enemy<=0))endWar(w,"victory");
  else if(w.months>24&&w.score<0)endWar(w,"white_peace");
}
function familyTick(){
  const r=ruler(),sp=char(r.spouse);
  if(sp&&r.age>=16&&sp.age>=16&&r.age<55&&sp.age<50){
    const chance=.018*(r.fertility||.7)*(sp.fertility||.7);
    if(Math.random()<chance)newChild(r.id,sp.id);
  }
  Object.values(WORLD.characters).forEach(c=>{
    if(!c.alive||c.id===r.id)return;
    const ageFactor=Math.max(0,c.age-50)*.018,stress=(c.stress||0)*.003;
    c.health=clamp((c.health??100)-ageFactor-stress,0,100);
    if(c.age>=70&&Math.random()<.025)characterDeath(c,"old age");
    else if(c.health<30&&Math.random()<.018)characterDeath(c,"illness");
  });
  if(r.age>=62&&Math.random()<.018)death("old age");
  if(S.stress>=92&&Math.random()<.012)death("stress");
}
function newChild(fatherId,motherId){
  const f=char(fatherId),m=char(motherId);if(!f||!m)return null;
  const id="c_child_"+Date.now().toString(36)+Math.floor(Math.random()*99);
  const avg=k=>Math.max(2,Math.round(((f[k]||3)+(m[k]||3))/2+(Math.random()*3-1.5)));
  WORLD.characters[id]={id,name:pick(["Edric","Alaric","Alden","Rowan","Elira","Alina","Mara","Sera"])+" of "+f.dynasty.replace("House ",""),age:0,sex:Math.random()<.5?"m":"f",dynasty:f.dynasty,title:"Infant",martial:avg("martial"),diplomacy:avg("diplomacy"),stewardship:avg("stewardship"),intrigue:avg("intrigue"),learning:avg("learning"),traits:[pick(["Brave","Calm","Curious","Temperate","Ambitious"])],opinion:55,alive:true,spouse:null,father:fatherId,mother:motherId,children:[],health:100,fertility:.65+Math.random()*.2,culture:f.culture,faith:f.faith};
  f.children=f.children||[];m.children=m.children||[];f.children.push(id);m.children.push(id);S.customCharacters[id]=WORLD.characters[id];S.children.push(id);rebuildHeir();log(char(id).name+" was born into "+f.dynasty+".","dynasty");toast("A child was born!");return id;
}
function characterDeath(c,cause){
  c.alive=false;c.health=0;
  if(c.spouse&&char(c.spouse))char(c.spouse).spouse=null;
  Object.values(WORLD.characters).forEach(x=>{if(x.children)x.children=x.children.filter(id=>id!==c.id)});
  if(S.council[Object.keys(S.council).find(k=>S.council[k]===c.id)]){const role=Object.keys(S.council).find(k=>S.council[k]===c.id);S.council[role]=null;log(c.name+" died; the "+role+" office is vacant.","dynasty")}
  log(c.name+" died of "+cause+".","dynasty");
}
function death(cause){
  const old=ruler();rebuildHeir();const next=heir();if(!next){S.paused=true;log(old.name+" died without an eligible heir.","dynasty");toast("Succession crisis");return}
  old.alive=false;S.rulerId=next.id;next.title=old.title;S.gold=Math.max(0,S.gold*.8);S.prestige=Math.max(0,S.prestige-25);S.legitimacy=Math.max(15,S.legitimacy-20);S.stress=10;rebuildHeir();
  Object.values(S.titleHolders).forEach((h,id)=>{if(h===old.id)setTitleHolder(id,next.id)});
  WORLD.counties.forEach(c=>{if(c.holder===old.id){c.holder=next.id;c.status="yours"}});
  log(old.name+" died of "+cause+". "+next.name+" inherited the realm.","dynasty");toast("New ruler: "+next.name);
}
function validMarriage(a,b){
  if(!a||!b||a.id===b.id||!a.alive||!b.alive||a.age<16||b.age<16)return false;
  if(a.spouse||b.spouse)return false;
  if(a.father===b.id||a.mother===b.id||b.father===a.id||b.mother===a.id)return false;
  return true;
}
function arrangeMarriage(targetId){
  const target=char(targetId);const bridegroom=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===ruler().dynasty&&c.id!==ruler().id&&c.age>=16&&!c.spouse).sort((a,b)=>a.age-b.age)[0];
  if(!validMarriage(bridegroom,target))return toast("No valid adult dynastic match");
  bridegroom.spouse=target.id;target.spouse=bridegroom.id;S.marriages.push({a:bridegroom.id,b:target.id,year:S.year});S.prestige+=10;S.legitimacy=clamp(S.legitimacy+2,0,100);log("A dynastic marriage joined "+bridegroom.name+" and "+target.name+".","dynasty");toast("Marriage arranged");
}
function showGrantModal(){
  const target=county(S.selectedCounty),candidates=directVassalCharacters().filter(v=>v.id!==target.holder);
  if(!candidates.length)return toast("No eligible direct vassal to receive the county");
  $("modal").classList.add("open");$("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>GRANT TITLE</span><h2>Choose a recipient</h2></div><button id='closeModal'>×</button></div><p class='muted'>Grant "+esc(target.name)+" to one of your direct vassals. This creates a real liege relationship under the county's duchy.</p>"+candidates.map(v=>"<button class='list-row' data-grant='"+v.id+"'><span>"+esc(v.name)+"</span><b>"+opinion(v.id)+"</b><small>"+esc(v.title)+" · "+vassalPower(v.id)+" troops</small></button>").join("");
  $("closeModal").onclick=()=>$("modal").classList.remove("open");document.querySelectorAll("[data-grant]").forEach(b=>b.onclick=()=>grantTo(b.dataset.grant));
}
function grantTo(id){
  const c=county(S.selectedCounty),v=char(id);if(!c||!v)return;
  setTitleHolder(c.id,v.id);c.status="yours";S.legitimacy=clamp(S.legitimacy-1,0,100);S.relations[v.id]=clamp(opinion(v.id)+10,-100,100);log(v.name+" received the county of "+c.name+".","court");$("modal").classList.remove("open");toast("Title granted");render();saveSilent();
}
function revokeTitle(){
  const c=county(S.selectedCounty),v=char(c.holder);if(!v||v.id===S.rulerId)return toast("No vassal holds this title");
  const chance=clamp(.38-opinion(v.id)/240+(S.crownAuthority==="low"?.12:0),.12,.75);
  setTitleHolder(c.id,S.rulerId);c.status="yours";S.relations[v.id]=Math.max(-100,opinion(v.id)-35);S.prestige+=5;
  if(Math.random()<chance){createSingleVassalRevolt(v.id,c.id);log(v.name+" rebelled after the revocation of "+c.name+".","war");toast("Vassal revolt")}
  else{log("You revoked "+c.name+" from "+v.name+".","court");toast("Title revoked")}
}
function createSingleVassalRevolt(id,target){
  S.wars.push({id:"w_revoke_"+Date.now().toString(36),kind:"revolt",name:"Rebellion of "+char(id).name,target,score:-10,months:0,siege:0,enemy:vassalPower(id),rebels:[id]});
}
function recruitAction(){recruitMAA();render();saveSilent()}
function action(a){
  const c=county(S.selectedCounty),h=char(c.holder);
  if(a==="develop"){if(S.gold<25)return toast("Not enough gold");S.gold-=25;c.dev++;c.tax+=.35;c.control=clamp(c.control+2,0,100);log(c.name+" developed to level "+c.dev)}
  else if(a==="levy"){if(recruitTroops(Math.max(100,Math.min(170,Math.floor(totalLevySource()*.11))),true))log("The marshal raised additional levies from "+c.name,"war")}
  else if(a==="recruit"){recruitAction();return}
  else if(a==="extax"){S.gold+=12;S.stress=clamp(S.stress+5,0,100);log("Extraordinary tax was imposed in "+c.name,"court")}
  else if(a==="grant"){showGrantModal();return}
  else if(a==="revoke"){revokeTitle()}
  else if(a==="claim"){if(S.prestige<35)return toast("Need 35 prestige");S.prestige-=35;S.claimCounty=c.id;log("A fabricated claim on "+c.name+" is now recognized.","court")}
  else if(a==="sway"){if(!h)return;S.relations[h.id]=clamp(opinion(h.id)+20,-100,100);S.prestige=Math.max(0,S.prestige-10);log("Your diplomat began swaying "+h.name)}
  else if(a==="gift"){if(S.gold<15)return toast("Not enough gold");S.gold-=15;S.relations[h.id]=clamp(opinion(h.id)+25,-100,100);log("A costly gift improved relations with "+h.name)}
  else if(a==="marry"){arrangeMarriage(h.id);return}
  else if(a==="invite"){if(!h)return;S.relations[h.id]=clamp(opinion(h.id)+10,-100,100);log(h.name+" was invited to court")}
  else if(a==="inspect"){toast((h?.name||"The holder")+" fields roughly "+(c.levy+c.garrison)+" defenders in "+c.name);return}
  else if(a==="war"){
    if(S.wars.some(w=>w.kind!=="revolt"))return toast("Already at external war");
    if(c.status!=="rival")return toast("That county is not hostile");
    if(!S.claimCounty||S.claimCounty!==c.id)return toast("Need a valid claim");
    const adjacent=ownedCounties().some(pc=>(WORLD.adjacency[pc.id]||[]).includes(c.id));
    if(!adjacent)return toast("Target is not adjacent to your domain");
    if(playerPower()<700)return toast("Need 700 troops in the field");
    S.wars.push({id:"w_"+Date.now().toString(36),kind:"external",name:"Conquest of "+c.name,target:c.id,score:0,months:0,siege:0,enemy:enemyPower(c),rebels:[]});log("War declared for "+c.name+".","war")
  }else if(a==="law_succession_equal"){
    if(S.succession==="equal")return toast("Already using equal inheritance");if(S.prestige<150)return toast("Need 150 prestige");
    S.prestige-=150;S.succession="equal";S.legitimacy=clamp(S.legitimacy-2,0,100);rebuildHeir();log("The crown adopted equal inheritance.","dynasty");toast("Succession law changed")
  }else if(a==="law_authority_medium"){
    if(S.crownAuthority==="medium")return toast("Already at Medium Authority");if(S.prestige<180)return toast("Need 180 prestige");
    S.prestige-=180;S.crownAuthority="medium";S.legitimacy=clamp(S.legitimacy-4,0,100);log("The crown raised authority to Medium.","court");toast("Authority raised")
  }
  render();saveSilent();
}
function monthlyArmyTick(){
  S.armies.forEach(a=>{
    if(!a.raised)return;
    const c=county(a.location),friendly=c&&(c.status==="yours");
    const demand=Math.max(25,a.men/(Math.max(1,(c?.supply||70))));
    if(friendly)a.supply=clamp(a.supply+8,0,100);
    else a.supply=clamp(a.supply-demand*.6,0,100);
    a.fatigue=clamp(a.fatigue+(friendly?-2:.8),0,100);
    a.morale=clamp(a.morale+(a.supply>50?-1.5:-3.5)+(a.fatigue>50?-2:0),0,100);
  });
}
function aiTick(){
  WORLD.characters && Object.values(WORLD.characters).filter(v=>v.alive&&v.id!==S.rulerId).forEach(v=>{
    if(v.age>=65&&Math.random()<.012)characterDeath(v,"old age");
    if(v.spouse&&v.id<v.spouse&&v.age<50&&char(v.spouse)?.age<50&&Math.random()<.008)newChild(v.id,v.spouse);
  });
  WORLD.counties.filter(c=>c.status==="rival").forEach(c=>{const v=char(c.holder);if(v&&Math.random()<.12){c.levy+=18;c.garrison+=6;c.control=clamp(c.control+1,0,100)}});
  directVassalCharacters().forEach(v=>{if(opinion(v.id)<0&&Math.random()<.08)log(v.name+" is gathering supporters for a faction.","court")});
}
function monthlyTick(){
  if(S.paused)return;
  S.day+=5;if(S.day>30){S.day=5;S.month++;if(S.month>12){S.month=1;S.year++;Object.values(WORLD.characters).forEach(c=>{if(c.alive)c.age+=1});yearTick()}}
  S.gold+=Math.max(0,realmTax()*.10);S.levies=Math.min(S.troopCap,S.levies+Math.floor(totalLevySource()*.018));
  monthlyArmyTick();processCouncilTasks();familyTick();aiTick();
  S.wars.slice().forEach(w=>monthlyWar(w));
  updateFactions();S.factions.forEach(f=>{if(f.ultimatum>0&&f.strength>=80){f.ultimatum--;if(f.ultimatum===0){createRevolt(f);S.factions=S.factions.filter(x=>x.id!==f.id);log("The faction ultimatum expired. War has begun.","war")}}});
  rebuildHeir();saveSilent();render();
}
function yearTick(){
  S.gold+=Math.max(0,realmTax());S.prestige+=2;S.piety+=1;S.legitimacy=clamp(S.legitimacy+1,0,100);
  if(Math.random()<.16){const r=Math.floor(Math.random()*7);
    if(r===0){S.gold+=25;log("A merchant guild financed a royal charter. +25 gold.")}
    else if(r===1){S.stress=clamp(S.stress-18,0,100);log("A lavish feast eased tensions at court. -18 stress.","court")}
    else if(r===2){S.piety+=16;log("Pilgrims praised the crown's protection of sacred roads.","dynasty")}
    else if(r===3){S.levies=Math.max(0,S.levies-140);S.armies[0].men=Math.max(0,S.armies[0].men-140);log("A brutal winter reduced the available army.","war")}
    else if(r===4){S.legitimacy=clamp(S.legitimacy-5,0,100);log("A dispute over inheritance weakened royal legitimacy.","dynasty")}
    else if(r===5){S.gold=Math.max(0,S.gold-18);S.stress=clamp(S.stress+8,0,100);log("A court scandal cost the crown money and composure.","court")}
    else{S.prestige+=10;log("A tournament brought fame to House "+ruler().dynasty+".","dynasty")}}
}
function showCharacter(id){
  const c=char(id);if(!c)return;$("modal").classList.add("open");
  const mother=char(c.mother),father=char(c.father),sp=char(c.spouse),kids=(c.children||[]).map(char).filter(Boolean);
  $("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>CHARACTER</span><h2>"+esc(c.name)+"</h2></div><button id='closeModal'>×</button></div><p class='muted'>"+esc(c.title)+" · "+esc(c.dynasty)+" · age "+c.age.toFixed(1)+" · health "+Math.round(c.health||0)+"</p><div class='char-grid'>"+[["Martial",c.martial],["Diplomacy",c.diplomacy],["Stewardship",c.stewardship],["Intrigue",c.intrigue],["Learning",c.learning],["Opinion",opinion(id)]].map(x=>"<div><span>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("")+"</div><div class='traits'>"+(c.traits||[]).map(t=>"<span class='trait'>"+esc(t)+"</span>").join("")+"</div><div class='lineage'><span>Father</span><b>"+esc(father?.name||"Unknown")+"</b><span>Mother</span><b>"+esc(mother?.name||"Unknown")+"</b><span>Spouse</span><b>"+esc(sp?.name||"None")+"</b><span>Children</span><b>"+(kids.map(k=>esc(k.name)).join(", ")||"None")+"</b><span>Status</span><b>"+(c.alive?"Living":"Dead")+"</b></div>";
  $("closeModal").onclick=()=>$("modal").classList.remove("open");
}
$("pauseBtn").onclick=()=>{S.paused=!S.paused;$("pauseBtn").textContent=S.paused?"▶":"Ⅱ"};
$("saveBtn").onclick=save;$("newGameBtn").onclick=reset;
document.querySelectorAll(".speed button").forEach(b=>b.onclick=()=>{S.speed=+b.dataset.speed;S.paused=S.speed===0;document.querySelectorAll(".speed button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("pauseBtn").textContent=S.paused?"▶":"Ⅱ"});
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".tab-page").forEach(x=>x.classList.remove("show"));$("tab-"+b.dataset.tab).classList.add("show")});
$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.remove("open")};
rebuildHeir();render();setInterval(()=>{const n=[0,0,1,2][S.speed];for(let i=0;i<n;i++)monthlyTick()},2500);