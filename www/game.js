const KEY="dynasty_realms_save_v03";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const char=id=>WORLD.characters[id];
const county=id=>WORLD.counties.find(c=>c.id===id);
const duchy=id=>WORLD.duchies.find(d=>d.id===id);

function freshState(){
  return {version:3,year:1066,month:9,day:3,paused:false,speed:1,selectedCounty:"c_northwatch",
    gold:72,prestige:85,piety:40,legitimacy:78,stress:18,levies:1280,troopCap:1900,
    succession:"male_preference",crownAuthority:"low",culture:"Arvendic",faith:"Old Church",
    rulerId:"c_edric",heirId:"c_rowan",claimCounty:null,
    council:{chancellor:"c_mara",marshal:"c_bren",steward:"c_elira",spymaster:"c_merek",chaplain:"c_sera"},
    relations:{c_bren:61,c_elira:74,c_roderic:-24,c_merek:-10,c_sera:18,c_alden:25,c_hadrik:42},
    marriages:[],children:["c_alina","c_rowan"],customCharacters:{},titles:{ownedDuchies:["d_north"],kingdom:"k_arvend"},
    factions:{liberty:[],demands:[],accepted:false},councilTasks:{chancellor:{task:"idle",progress:0},marshal:{task:"idle",progress:0},steward:{task:"idle",progress:0},spymaster:{task:"idle",progress:0},chaplain:{task:"idle",progress:0}},war:null,
    armies:[{id:"a_main",name:"Northern Host",men:1000,levy:850,menAtArms:150,morale:100,commander:"c_edric",location:"c_northwatch",raised:true}],
    events:[
      {text:"Border scouts report increased levies in Sunmere.",when:"3 days ago",kind:"war"},
      {text:"A travelling jurist offers to settle an inheritance dispute.",when:"5 days ago",kind:"court"},
      {text:"Lady Alina has begun her studies in rhetoric.",when:"8 days ago",kind:"dynasty"}]};
}
function load(){
  try{
    const raw=localStorage.getItem(KEY)||localStorage.getItem("dynasty_realms_save_v02");
    if(!raw)return null;
    const x=JSON.parse(raw),n=freshState();
    Object.assign(n,x,{version:3});
    n.events=Array.isArray(n.events)?n.events:baseState().events;
    n.marriages=Array.isArray(n.marriages)?n.marriages:[];n.children=Array.isArray(n.children)?n.children:["c_alina","c_rowan"];
    n.factions=n.factions&&typeof n.factions==="object"?n.factions:{liberty:[],demands:[],accepted:false};n.factions.liberty=n.factions.liberty||[];n.councilTasks=n.councilTasks||freshState().councilTasks;
    n.armies=Array.isArray(n.armies)&&n.armies.length?n.armies:n.armies;
    n.armies=n.armies||freshState().armies;
    n.council=n.council||freshState().council;n.relations=n.relations||{};
    return n;
  }catch(e){return null}
}
let S=load()||freshState();

function saveSilent(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function save(){saveSilent();toast("Game saved")}
function reset(){localStorage.removeItem(KEY);localStorage.removeItem("dynasty_realms_save_v02");S=freshState();render();toast("New campaign started")}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1700)}
function log(text,kind="court"){S.events.unshift({text,when:"Now",kind});S.events=S.events.slice(0,14)}
function ruler(){return char(S.rulerId)}
function heir(){return char(S.heirId)}
function ownedCounties(){return WORLD.counties.filter(c=>c.status==="yours")}
function ownedDuchies(){const ids=new Set(ownedCounties().map(c=>c.duchy));return WORLD.duchies.filter(d=>ids.has(d.id))}
function realmTax(){const st=char(S.council.steward),eff=1+Math.max(-.25,((st?.stewardship||5)-8)*.025);return ownedCounties().reduce((n,c)=>n+c.tax*(c.dev/7)*eff,0)}
function opinion(id){return S.relations[id]??char(id)?.opinion??0}
function directVassals(){return ownedCounties().filter(c=>c.holder!==S.rulerId)}
function totalLevySource(){return ownedCounties().reduce((n,c)=>n+c.levy,0)}
function playerPower(){return S.armies.filter(a=>a.raised).reduce((n,a)=>n+a.men,0)+ownedCounties().reduce((n,c)=>n+c.garrison,0)}

function renderTop(){$("year").textContent=S.year+"."+String(S.month).padStart(2,"0");$("gold").textContent=Math.floor(S.gold);$("prestige").textContent=Math.floor(S.prestige);$("piety").textContent=Math.floor(S.piety);$("levies").textContent=Math.floor(S.levies);$("age").textContent=ruler().age.toFixed(1)+" years";$("stress").textContent=Math.round(S.stress);$("legitimacy").textContent=Math.round(S.legitimacy)}
function renderMap(){$("mapRegions").innerHTML=WORLD.counties.map(c=>"<polygon class='region "+c.status+(c.id===S.selectedCounty?" selected":"")+"' data-id='"+c.id+"' points='"+c.points+"'></polygon>").join("");$("mapLabels").innerHTML=WORLD.counties.map(c=>"<text class='map-label' x='"+c.x+"' y='"+c.y+"'>"+esc(c.name)+"</text>").join("");document.querySelectorAll(".region").forEach(e=>e.onclick=()=>{S.selectedCounty=e.dataset.id;render()})}
function renderTitles(){const c=county(S.selectedCounty),d=duchy(c.duchy);$("baronyTitle").textContent=c.barony;$("countyTitle").textContent=c.name;$("duchyTitle").textContent=d.name.replace("Duchy of ","");$("kingdomTitle").textContent=WORLD.kingdom.name;$("realmTier").textContent=ownedCounties().length>=6?"KINGDOM":ownedCounties().length>=3?"DUCHY":"COUNTY"}
function renderSelected(){
  const c=county(S.selectedCounty),h=char(c.holder),d=duchy(c.duchy);
  $("countyName").textContent=c.name;$("countyHolder").textContent=h?.name||"Vacant";$("countyDev").textContent=c.dev;$("countyTax").textContent=c.tax.toFixed(1)+"/mo";$("countyGarrison").textContent=c.garrison;$("countyLevy").textContent=c.levy;$("countyDuchy").textContent=d.name.replace("Duchy of ","");$("countyStatus").textContent=c.status==="yours"?(c.holder===S.rulerId?"DIRECT DOMAIN":"VASSAL DOMAIN"):c.status==="rival"?"RIVAL":"INDEPENDENT";
  let actions;
  if(c.status==="rival")actions=[["Fabricate Claim","-35 prestige","claim"],["Declare War","Start a conquest war","war"],["Sway Ruler","+20 opinion","sway"],["Scout Province","Reveal army strength","inspect"]];
  else if(c.status!=="yours")actions=[["Fabricate Claim","-35 prestige","claim"],["Send Gift","-15 gold · +25 opinion","gift"],["Arrange Marriage","+10 prestige","marry"],["Invite to Court","+10 opinion","invite"]];
  else if(c.holder!==S.rulerId)actions=[["Revoke Title","Risk vassal revolt","revoke"],["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+150 raised · -12 gold","levy"],["Sway Vassal","+20 opinion","sway"]];
  else actions=[["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+150 raised · -12 gold","levy"],["Extraordinary Tax","+12 gold · +5 stress","extax"],["Grant Title","Give county to a vassal","grant"]];
  $("countyActions").innerHTML=actions.map(a=>"<button class='action-btn' data-action='"+a[2]+"'><b>"+esc(a[0])+"</b><span>"+esc(a[1])+"</span></button>").join("");
  document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderRuler(){
  const r=ruler(),h=heir();$("rulerName").textContent=r.name;$("rulerTitle").textContent=r.title;$("rulerDynasty").textContent=r.dynasty;
  $("rulerStats").innerHTML=[["MART",r.martial],["DIP",r.diplomacy],["STEW",r.stewardship],["INTR",r.intrigue],["LEARN",r.learning]].map(x=>"<div><span>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("");
  $("traits").innerHTML=r.traits.map(t=>"<span class='trait'>"+esc(t)+"</span>").join("");$("heir").textContent=h?h.name+" · age "+h.age:"No heir";$("spouse").textContent=r.spouse?char(r.spouse)?.name:"None";$("dynasty").textContent=r.dynasty
}
function renderSociety(){
  const owned=ownedCounties(),cult={},faith={};
  owned.forEach(c=>{cult[c.culture]=(cult[c.culture]||0)+1;faith[c.faith]=(faith[c.faith]||0)+1});
  const topCult=Object.keys(cult).sort((a,b)=>cult[b]-cult[a])[0]||"arvendic",topFaith=Object.keys(faith).sort((a,b)=>faith[b]-faith[a])[0]||"old_church";
  const sc=WORLD.laws.succession.find(x=>x.id===S.succession)||WORLD.laws.succession[0];
  const ca=WORLD.laws.authority.find(x=>x.id===S.crownAuthority)||WORLD.laws.authority[0];
  const control=owned.length?Math.round(owned.reduce((n,c)=>n+c.control,0)/owned.length):0;
  $("society").innerHTML=
    "<div class='society-item'><span class='eyebrow'>CULTURE</span><b>"+esc(WORLD.cultures[topCult].name)+"</b><small>"+esc(WORLD.cultures[topCult].description)+"</small></div>"+
    "<div class='society-item'><span class='eyebrow'>FAITH</span><b>"+esc(WORLD.faiths[topFaith].name)+"</b><small>"+esc(WORLD.faiths[topFaith].description)+"</small></div>"+
    "<div class='society-item'><span class='eyebrow'>SUCCESSION</span><b>"+esc(sc.name)+"</b><small>"+esc(sc.desc)+"</small><button class='order-btn' data-action='law_succession_equal'>Adopt Equal · 150 prestige</button></div>"+
    "<div class='society-item'><span class='eyebrow'>CROWN AUTHORITY</span><b>"+esc(ca.name)+"</b><small>"+esc(ca.desc)+"</small><button class='order-btn' data-action='law_authority_medium'>Raise Authority · 180 prestige</button></div>"+
    "<div class='society-item'><span class='eyebrow'>COUNTY CONTROL</span><b>"+control+"%</b><small>Administration and local compliance across your domain.</small></div>"+
    "<div class='society-item'><span class='eyebrow'>DIVERSITY</span><b>"+Object.keys(cult).length+" cultures · "+Object.keys(faith).length+" faiths</b><small>Different peoples create different political pressures.</small></div>";
  document.querySelectorAll("#tab-realm [data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderRealm(){$("domainCount").textContent=ownedCounties().length;$("duchyCount").textContent=ownedDuchies().length;$("realmTax").textContent=realmTax().toFixed(1);$("armyPower").textContent=Math.floor(playerPower());$("law").textContent=S.succession.replace("_"," ");$("authority").textContent=S.crownAuthority;$("legitimacyDyn").textContent=Math.round(S.legitimacy);renderSociety()}
function renderCouncilTasks(){
  const specs=[
    ["Chancellor","chancellor","Reconcile Vassals","Improve the opinion of your most hostile vassal."],
    ["Marshal","marshal","Organize Levies","Prepare fresh troops for the next campaign."],
    ["Steward","steward","Audit Taxes","Find hidden revenue in the domain."],
    ["Spymaster","spymaster","Find Secrets","Build leverage against an enemy court."],
    ["Chaplain","chaplain","Religious Study","Generate piety and reinforce legitimacy."]
  ];
  $("councilTasks").innerHTML=specs.map(x=>{
    const st=S.councilTasks[x[1]];
    return "<div class='task-row'><div><b>"+x[0]+" · "+x[2]+"</b><span>"+x[3]+"</span></div><button data-task='"+x[1]+"'>"+(st.task==="idle"?"Start":"Active")+" "+Math.round(st.progress)+"%</button></div>";
  }).join("");
  document.querySelectorAll("#councilTasks [data-task]").forEach(b=>b.onclick=()=>startTask(b.dataset.task));
}
function startTask(role){
  const st=S.councilTasks[role];if(!st)return;
  st.task=st.task==="idle"?"active":st.task;toast("Council task active");render();
}
function processCouncilTasks(){
  const map={chancellor:"diplomacy",marshal:"martial",steward:"stewardship",spymaster:"intrigue",chaplain:"learning"};
  Object.keys(S.councilTasks).forEach(role=>{
    const st=S.councilTasks[role];if(st.task==="idle")return;
    const c=char(S.council[role]),skill=c?.[map[role]]||5;st.progress+=Math.max(3,skill*.75);
    if(st.progress<100)return;
    st.progress=0;st.task="idle";
    if(role==="chancellor"){
      const v=directVassals().sort((a,b)=>opinion(char(a.holder).id)-opinion(char(b.holder).id))[0];
      if(v){S.relations[v.holder]=Math.min(100,opinion(v.holder)+20);log("The chancellor completed a reconciliation with "+char(v.holder).name+".","court")}
    }else if(role==="marshal"){
      const n=180;S.levies=Math.min(S.troopCap,S.levies+n);S.armies[0].men=Math.min(S.troopCap,S.armies[0].men+n);S.armies[0].levy+=n;log("The marshal completed levy preparations. +180 troops.","war")
    }else if(role==="steward"){
      S.gold+=25;log("The steward recovered overdue taxes. +25 gold.","court")
    }else if(role==="spymaster"){
      const e=WORLD.counties.filter(c=>c.status==="rival");const t=e[Math.floor(Math.random()*e.length)];
      if(t){S.claimCounty=t.id;log("The spymaster uncovered evidence that strengthens your claim on "+t.name+".","court")}
    }else{
      S.piety+=25;S.legitimacy=Math.min(100,S.legitimacy+2);log("The chaplain completed a religious study. +25 piety.","dynasty")
    }
  });
}
function renderCourt(){
  const rows=[["Chancellor",S.council.chancellor,"Diplomacy"],["Marshal",S.council.marshal,"Army"],["Steward",S.council.steward,"Taxes"],["Spymaster",S.council.spymaster,"Intrigue"],["Chaplain",S.council.chaplain,"Faith"]];
  $("council").innerHTML=rows.map(x=>"<div class='court-row'><div><b>"+esc(x[0])+"</b><span>"+esc(x[2])+"</span></div><strong>"+esc(char(x[1])?.name||"Vacant")+"</strong><em>"+Math.round(((char(x[1])?.diplomacy||0)+(char(x[1])?.stewardship||0)+(char(x[1])?.intrigue||0))/3)+"</em></div>").join("");
  $("vassals").innerHTML=directVassals().map(c=>{const v=char(c.holder);return "<button class='list-row' data-char='"+v.id+"'><span>"+esc(v.name)+"</span><b>"+opinion(v.id)+"</b><small>"+esc(c.name)+" · "+esc(v.title)+"</small></button>"}).join("")||"<div class='empty'>You currently hold all your counties directly.</div>";
  document.querySelectorAll("#tab-court [data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char));
  renderCouncilTasks();
}
function renderDynasty(){
  const r=ruler(),members=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===r.dynasty);$("dynastySize").textContent=members.length;$("successionListLaw").textContent=S.succession.replace("_"," ");$("legitimacyDyn").textContent=Math.round(S.legitimacy);
  $("marriages").innerHTML=(S.marriages||[]).slice(-8).reverse().map(m=>"<div class='marriage-row'><b>"+esc(char(m.a)?.name||"Unknown")+" × "+esc(char(m.b)?.name||"Unknown")+"</b><small>Dynastic tie · "+m.year+"</small></div>").join("")||"<div class='empty'>No recorded dynastic marriages.</div>";
  $("successionList").innerHTML=members.sort((a,b)=>a.age-b.age).map(c=>"<button class='list-row' data-char='"+c.id+"'><span>"+esc(c.name)+"</span><b>"+(c.id===S.rulerId?"RULER":c.id===S.heirId?"HEIR":"FAMILY")+"</b><small>"+c.age.toFixed(0)+" · "+esc(c.title)+"</small></button>").join("");
  document.querySelectorAll("#tab-dynasty [data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char))
}
function renderFactions(){
  const angry=directVassals().map(c=>char(c.holder)).filter(v=>v&&opinion(v.id)<35);
  S.factions.liberty=angry.map(v=>v.id);
  $("factions").innerHTML=angry.length?angry.map(v=>{
    const strength=Math.min(95,Math.max(5,Math.round((100-opinion(v.id))*.95)));
    return "<div class='faction'><div><b>"+esc(v.name)+"</b><span>Liberty faction · wants weaker crown control</span></div><strong>"+strength+"%</strong></div>";
  }).join("")+"<div class='action-grid'><button class='action-btn' data-action='faction_demand'><b>Answer Faction</b><span>Concede or risk a political crisis</span></button></div>":"<div class='empty'>No major faction threatens the crown.</div>";
  document.querySelectorAll("#tab-realm [data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderWar(){
  if(!S.war){$("warCard").innerHTML="<div class='empty'>No active war. Select a rival county and declare war.</div>";return}
  const t=county(S.war.target),bar=Math.max(-100,Math.min(100,S.war.score));
  $("warCard").innerHTML="<div class='war-title'><div><span class='eyebrow'>ACTIVE WAR</span><h3>Conquest of "+esc(t.name)+"</h3></div><b>"+bar+"%</b></div><div class='bar'><i style='width:"+((bar+100)/2)+"%'></i></div><div class='war-grid'><div><span>Army</span><b>"+Math.floor(S.armies[0].men)+"</b></div><div><span>Defender</span><b>"+(t.levy+t.garrison)+"</b></div><div><span>Duration</span><b>"+S.war.months+" mo</b></div><div><span>Siege</span><b>"+Math.round(S.war.siege)+"%</b></div></div><div class='action-grid'><button class='action-btn' data-action='battle'><b>Force Battle</b><span>Use army to gain warscore</span></button><button class='action-btn' data-action='negotiate'><b>Peace / Surrender</b><span>Resolve the war</span></button></div>";
  document.querySelectorAll("#warCard [data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action))
}
function renderArmyOrders(){
  const a=S.armies[0],targets=WORLD.counties.filter(x=>x.id!==a.location).slice(0,6);
  $("armyOrders").innerHTML="<div class='order-grid'>"+targets.map(t=>"<button class='order-btn' data-move='"+t.id+"'><b>March to "+esc(t.name)+"</b><span>"+(t.status==="rival"?"Enemy territory":"Friendly territory")+"</span></button>").join("")+"</div>";
  document.querySelectorAll("[data-move]").forEach(b=>b.onclick=()=>{a.location=b.dataset.move;log(a.name+" began marching toward "+county(a.location).name,"war");toast("Army on the march");render()});
}
function renderArmy(){
  const a=S.armies[0];
  $("armyCard").innerHTML="<div class='army-row'><div><b>"+esc(a.name)+"</b><span>Commander: "+esc(char(a.commander)?.name||"None")+" · "+esc(county(a.location)?.name||"Unknown")+"</span></div><strong>"+Math.floor(a.men)+"</strong></div><div class='army-details'><div><span>Levy</span><b>"+a.levy+"</b></div><div><span>Men-at-Arms</span><b>"+a.menAtArms+"</b></div><div><span>Morale</span><b>"+Math.round(a.morale)+"%</b></div></div><button id='marshalBtn' class='action-btn'><b>Appoint Marshal</b><span>Put the council marshal in command</span></button>";
  $("marshalBtn").onclick=()=>action("marshal");
}
function renderEvents(){$("events").innerHTML=S.events.map(e=>"<div class='event'><i class='event-dot "+esc(e.kind)+"'></i><div><p>"+esc(e.text)+"</p><time>"+esc(e.when)+"</time></div></div>").join("")}
function render(){renderTop();renderMap();renderTitles();renderSelected();renderRuler();renderRealm();renderCourt();renderDynasty();renderFactions();renderWar();renderArmy();renderArmyOrders();renderEvents()}

function chooseHeir(){
  const fam=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===ruler().dynasty&&c.id!==ruler().id);
  const males=fam.filter(c=>c.sex==="m").sort((a,b)=>b.age-a.age),all=fam.sort((a,b)=>b.age-a.age);
  return S.succession==="male_preference"&&males[0]?males[0].id:(all[0]?.id||null)
}
function possibleChildId(){
  const id="c_child_"+Date.now().toString(36),mother=char(ruler().spouse);
  WORLD.characters[id]={id,name:"Child of House "+ruler().dynasty.replace("House ",""),age:0,sex:Math.random()<.5?"m":"f",dynasty:ruler().dynasty,title:"Infant",martial:3,diplomacy:3,stewardship:3,intrigue:3,learning:3,traits:[Math.random()<.5?"Temperate":"Curious"],opinion:60,alive:true,spouse:null,father:S.rulerId,mother:mother?.id||null};
  S.customCharacters[id]=WORLD.characters[id];
  return id
}
function familyTick(){
  const r=ruler();
  if(r.spouse&&r.age<55&&Math.random()<.035){const id=possibleChildId();S.children.push(id);if(!S.heirId)S.heirId=id;log(char(id).name+" was born into "+r.dynasty+".","dynasty");toast("A child was born!")}
  if(r.age>=55&&Math.random()<.04)death("old age");
  if(S.stress>=90&&Math.random()<.025)death("stress");
}
function death(cause){
  const old=ruler(),next=heir();
  if(!next){S.paused=true;log(old.name+" died without an eligible heir. The dynasty has no recognized successor.","dynasty");toast("Succession crisis");return}
  old.alive=false;S.rulerId=next.id;S.heirId=chooseHeir();S.gold=Math.max(0,S.gold*.8);S.prestige=Math.max(0,S.prestige-25);S.legitimacy=Math.max(15,S.legitimacy-20);S.stress=10;next.title=old.title;
  log(old.name+" died of "+cause+". "+next.name+" inherited the realm.","dynasty");toast("New ruler: "+next.name)
}
function raiseLevies(){
  const source=totalLevySource(),amount=Math.max(100,Math.min(150,Math.floor(source*.12)));S.levies=Math.min(S.troopCap,S.levies+amount);S.gold=Math.max(0,S.gold-12);S.armies[0].men=Math.min(S.troopCap,S.armies[0].men+amount);S.armies[0].levy+=amount
}
function grantTitle(){
  const v=directVassals()[0];
  if(!v)return toast("You need a vassal first");
  const oldHolder=v.holder;const target=county(S.selectedCounty);target.holder=oldHolder;target.status="yours";
  log(char(oldHolder).name+" was granted the county of "+target.name+".","court");S.legitimacy=Math.max(0,S.legitimacy-2);toast("Title granted")
}
function revokeTitle(){
  const c=county(S.selectedCounty),v=char(c.holder);if(!v||v.id===S.rulerId)return toast("No vassal holds this title");
  const chance=Math.max(.15,Math.min(.9,.45-opinion(v.id)/200));
  c.holder=S.rulerId;c.status="yours";
  if(Math.random()<chance){S.prestige+=8;S.legitimacy-=4;S.factions.liberty.push(v.id);log(v.name+" rebelled after having "+c.name+" revoked.","war");toast("Vassal revolt risk")}else{S.prestige+=5;log("You revoked "+c.name+" from "+v.name+" without open revolt.","court");toast("Title revoked")}
}
function action(a){
  const c=county(S.selectedCounty),h=char(c.holder);
  if(a==="develop"){if(S.gold<25)return toast("Not enough gold");S.gold-=25;c.dev++;c.tax+=.35;log(c.name+" developed to level "+c.dev)}
  else if(a==="levy"){if(S.gold<12)return toast("Not enough gold");raiseLevies();log("The marshal raised additional levies from "+c.name,"war")}
  else if(a==="marshal"){const id=S.council.marshal;if(!char(id))return toast("No marshal available");S.armies[0].commander=id;log(char(id).name+" is now commanding the Northern Host.","war");toast("Commander appointed")}
  else if(a==="extax"){S.gold+=12;S.stress+=5;log("Extraordinary tax was imposed in "+c.name,"court")}
  else if(a==="grant"){grantTitle()}
  else if(a==="revoke"){revokeTitle()}
  else if(a==="claim"){if(S.prestige<35)return toast("Need 35 prestige");S.prestige-=35;S.claimCounty=c.id;log("A fabricated claim on "+c.name+" is now recognized.","court")}
  else if(a==="sway"){S.relations[h.id]=Math.min(100,opinion(h.id)+20);S.prestige=Math.max(0,S.prestige-10);log("Your diplomat began swaying "+h.name)}
  else if(a==="gift"){if(S.gold<15)return toast("Not enough gold");S.gold-=15;S.relations[h.id]=Math.min(100,opinion(h.id)+25);log("A costly gift improved relations with "+h.name)}
  else if(a==="marry"){S.prestige+=10;S.legitimacy=Math.min(100,S.legitimacy+2);S.marriages.push({a:S.rulerId,b:h.id,year:S.year});log("A dynastic marriage was proposed to "+h.name,"dynasty")}
  else if(a==="invite"){S.relations[h.id]=Math.min(100,opinion(h.id)+10);log(h.name+" was invited to court")}
  else if(a==="inspect"){toast(h.name+" fields roughly "+c.levy+" levies in "+c.name);return}
  else if(a==="war"){if(S.war)return toast("Already at war");if(c.status!=="rival")return toast("That county is not hostile");if(S.levies<700)return toast("Need at least 700 levies");S.war={target:c.id,score:0,months:0,siege:0};log("War declared on "+h.name+" for "+c.name,"war")}
  else if(a==="battle"){
    if(!S.war)return;const t=county(S.war.target),def=t.levy+t.garrison,atk=Math.max(1,S.armies[0].men),ratio=atk/Math.max(1,def),loss=Math.max(45,Math.floor(def*(ratio>.95?.10:.18)));
    S.levies=Math.max(0,S.levies-loss);S.armies[0].men=Math.max(0,S.armies[0].men-loss);S.armies[0].morale=Math.max(0,S.armies[0].morale-(ratio>.9?5:16));
    if(ratio>.9){S.war.score+=18+Math.floor(Math.random()*16);S.war.siege=Math.min(100,S.war.siege+12);log("Battle won near "+t.name+".","war");toast("Victory")}else{S.war.score-=12;log("The army was repulsed at "+t.name+".","war");toast("Defeat")}
  }else if(a==="law_succession_equal"){
  if(S.succession==="equal")return toast("Already using equal inheritance");
  if(S.prestige<150)return toast("Need 150 prestige");
  S.prestige-=150;S.succession="equal";S.legitimacy=Math.max(0,S.legitimacy-2);log("The crown adopted equal inheritance.","dynasty");toast("Succession law changed");
}else if(a==="law_authority_medium"){
  if(S.crownAuthority==="medium")return toast("Already at Medium Authority");
  if(S.prestige<180)return toast("Need 180 prestige");
  S.prestige-=180;S.crownAuthority="medium";S.legitimacy=Math.max(0,S.legitimacy-4);log("The crown raised authority to Medium.","court");toast("Authority raised");
}else if(a==="faction_demand"){
  const angry=directVassals().map(c=>char(c.holder)).filter(v=>v&&opinion(v.id)<35);
  if(!angry.length)return toast("No active faction");
  const v=angry.sort((a,b)=>opinion(a.id)-opinion(b.id))[0],strength=Math.min(95,Math.max(5,Math.round((100-opinion(v.id))*.95)));
  if(strength<55){S.relations[v.id]=Math.min(100,opinion(v.id)+30);S.legitimacy=Math.max(0,S.legitimacy-2);log(v.name+" accepted royal concessions and left the faction.","court");toast("Faction appeased")}
  else{S.legitimacy=Math.max(0,S.legitimacy-10);S.stress+=6;S.levies=Math.max(0,S.levies-150);log(v.name+" refused concessions. The faction crisis drained the realm.","war");toast("Faction crisis")}
}else if(a==="marshal"){
  const id=S.council.marshal;if(!char(id))return toast("No marshal available");
  S.armies[0].commander=id;log(char(id).name+" took command of the Northern Host.","war");toast("Commander appointed");
}else if(a==="negotiate"){
    if(!S.war)return;const t=county(S.war.target);
    if(S.war.score>=60){t.status="yours";t.holder=S.rulerId;S.prestige+=50;S.legitimacy+=5;log("The enemy surrendered "+t.name+".","war");S.war=null;S.claimCounty=null;toast("War won")}
    else if(S.war.score>=0){log("The enemy refused your peace offer.","war");toast("Peace refused")}
    else{S.war=null;S.prestige=Math.max(0,S.prestige-15);log("The war ended in an unfavorable white peace.","war");toast("White peace")}
  }
  render();saveSilent()
}
function aiTick(){
  WORLD.counties.filter(c=>c.status==="rival").forEach(c=>{const v=char(c.holder);if(!v)return;if(Math.random()<.12){c.levy+=20;c.garrison+=8}if(Math.random()<.025&&v.opinion>10)log(v.name+" has opened talks with a neighboring lord.","court")});
  directVassals().forEach(c=>{const v=char(c.holder);if(opinion(v.id)<-35&&Math.random()<.08)log(v.name+" is gathering supporters for a faction.","court")});
}
function monthlyTick(){
  if(S.paused)return;S.day+=5;
  if(S.day>30){S.day=5;S.month++;if(S.month>12){S.month=1;S.year++;Object.values(WORLD.characters).forEach(c=>{if(c.alive)c.age+=1});yearTick()}}
  S.gold+=Math.max(0,realmTax()*.10);S.levies=Math.min(S.troopCap,S.levies+Math.floor(totalLevySource()*.018));S.armies.forEach(a=>{if(a.raised)a.morale=Math.min(100,a.morale+.7)});
  if(S.war){S.war.months++;const t=county(S.war.target),army=S.armies[0],atk=Math.max(1,army.men),def=t.levy+t.garrison,ratio=atk/Math.max(1,def);if(army.location===t.id)S.war.siege=Math.min(100,(S.war.siege||0)+(ratio>.85?8:3));S.war.score+=ratio>.95?5:ratio<.55?-4:1+(S.war.siege>=100?3:0);
    if(S.war.score>=100){t.status="yours";t.holder=S.rulerId;S.prestige+=60;S.war=null;S.claimCounty=null;log("The enemy accepted total surrender. "+t.name+" was annexed.","war");toast("Total victory")}
    else if(S.war&&S.war.months>24&&S.war.score<0){S.war=null;log("War exhaustion forced an unfavorable peace.","war")}}
  processCouncilTasks();familyTick();aiTick();saveSilent();render()
}
function yearTick(){
  S.gold+=Math.max(0,realmTax());S.prestige+=2;S.piety+=1;S.legitimacy=Math.min(100,S.legitimacy+1);
  if(Math.random()<.16){const r=Math.floor(Math.random()*6);
    if(r===0){S.gold+=25;log("A merchant guild financed a royal charter. +25 gold.")}
    else if(r===1){S.stress=Math.max(0,S.stress-18);log("A lavish feast eased tensions at court. -18 stress.","court")}
    else if(r===2){S.piety+=16;log("Pilgrims praised the crown's protection of sacred roads.","dynasty")}
    else if(r===3){S.levies=Math.max(0,S.levies-140);S.armies[0].men=Math.max(0,S.armies[0].men-140);log("A brutal winter reduced the available army.","war")}
    else if(r===4){S.legitimacy=Math.max(0,S.legitimacy-5);log("A dispute over inheritance weakened royal legitimacy.","dynasty")}
    else{S.prestige+=10;log("A tournament brought fame to House "+ruler().dynasty+".","dynasty")}}
}
function showCharacter(id){
  const c=char(id);if(!c)return;$("modal").classList.add("open");
  $("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>CHARACTER</span><h2>"+esc(c.name)+"</h2></div><button id='closeModal'>×</button></div><p class='muted'>"+esc(c.title)+" · "+esc(c.dynasty)+" · age "+c.age+"</p><div class='char-grid'>"+
  [["Martial",c.martial],["Diplomacy",c.diplomacy],["Stewardship",c.stewardship],["Intrigue",c.intrigue],["Learning",c.learning],["Opinion",opinion(id)]].map(x=>"<div><span>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("")+
  "</div><div class='traits'>"+c.traits.map(t=>"<span class='trait'>"+esc(t)+"</span>").join("")+"</div><div class='lineage'><span>Dynasty</span><b>"+esc(c.dynasty)+"</b><span>Father</span><b>"+esc(char(c.father)?.name||"Unknown")+"</b></div>";
  $("closeModal").onclick=()=>$("modal").classList.remove("open")
}
$("pauseBtn").onclick=()=>{S.paused=!S.paused;$("pauseBtn").textContent=S.paused?"▶":"Ⅱ"};
$("saveBtn").onclick=save;$("newGameBtn").onclick=reset;
document.querySelectorAll(".speed button").forEach(b=>b.onclick=()=>{S.speed=+b.dataset.speed;S.paused=S.speed===0;document.querySelectorAll(".speed button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("pauseBtn").textContent=S.paused?"▶":"Ⅱ"});
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".tab-page").forEach(x=>x.classList.remove("show"));$("tab-"+b.dataset.tab).classList.add("show")});
$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.remove("open")};
render();setInterval(()=>{const n=[0,0,1,2][S.speed];for(let i=0;i<n;i++)monthlyTick()},2500);
