const KEY="dynasty_realms_save_v02";
const baseState=()=>({
  version:2,year:1066,month:9,day:3,paused:false,speed:1,selectedCounty:"c_northwatch",
  gold:72,prestige:85,piety:40,legitimacy:78,stress:18,levies:1280,troopCap:1800,
  succession:"male_preference",crownAuthority:"low",culture:"Arvendic",faith:"Old Church",
  rulerId:"c_edric",heirId:"c_alina",war:null,claimCounty:null,
  council:{chancellor:"c_mara",marshal:"c_bren",steward:"c_elira",spymaster:"c_merek",chaplain:"c_sera"},
  relations:{c_bren:61,c_elira:74,c_roderic:-24,c_merek:-10,c_sera:18,c_alden:25,c_hadrik:42},
  factions:[],events:[
    {text:"Border scouts report increased levies in Sunmere.",when:"3 days ago",kind:"war"},
    {text:"A travelling jurist offers to settle an inheritance dispute.",when:"5 days ago",kind:"court"},
    {text:"Lady Alina has begun her studies in rhetoric.",when:"8 days ago",kind:"dynasty"}
  ]
});
let S=load()||baseState();
let $=x=>document.getElementById(x);
const char=id=>WORLD.characters[id];
const county=id=>WORLD.counties.find(x=>x.id===id);
const ruler=()=>char(S.rulerId);
function esc(x){return String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function save(){localStorage.setItem(KEY,JSON.stringify(S));toast("Game saved")}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(_){return null}}
function reset(){localStorage.removeItem(KEY);S=baseState();render();toast("New campaign started")}
function toast(x){const t=$("toast");t.textContent=x;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1700)}
function log(text,kind="court"){S.events.unshift({text,when:"Now",kind});S.events=S.events.slice(0,12)}

function ownedCounties(){return WORLD.counties.filter(c=>c.status==="yours")}
function ownedDuchies(){let ids=new Set(ownedCounties().map(c=>c.duchy));return WORLD.duchies.filter(d=>ids.has(d.id))}
function realmTax(){return ownedCounties().reduce((n,c)=>n+c.tax*(c.dev/7),0)}
function totalVassalLevies(){return ownedCounties().reduce((n,c)=>n+c.levy,0)}
function opinion(id){return S.relations[id]??char(id)?.opinion??0}
function playerPower(){return S.levies+ownedCounties().reduce((n,c)=>n+c.garrison,0)}

function renderTop(){
  $("year").textContent=S.year;
  $("gold").textContent=Math.floor(S.gold);
  $("prestige").textContent=Math.floor(S.prestige);
  $("piety").textContent=Math.floor(S.piety);
  $("levies").textContent=Math.floor(S.levies);
  $("age").textContent=ruler().age.toFixed(1)+" years";
  $("stress").textContent=S.stress;
  $("legitimacy").textContent=S.legitimacy;
}

function renderMap(){
  $("mapRegions").innerHTML=WORLD.counties.map(c=>
    '<polygon class="region '+c.status+(c.id===S.selectedCounty?" selected":"")+'" data-id="'+c.id+'" points="'+c.points+'"></polygon>'
  ).join("");
  $("mapLabels").innerHTML=WORLD.counties.map(c=>
    '<text class="map-label" x="'+c.x+'" y="'+c.y+'">'+esc(c.name)+'</text>'
  ).join("");
  document.querySelectorAll(".region").forEach(e=>e.onclick=()=>{S.selectedCounty=e.dataset.id;render()});
}

function renderSelected(){
  const c=county(S.selectedCounty),h=char(c.holder);
  $("countyName").textContent=c.name;
  $("countyHolder").textContent=h?h.name:"Unknown";
  $("countyDev").textContent=c.dev;
  $("countyTax").textContent=c.tax.toFixed(1)+"/mo";
  $("countyGarrison").textContent=c.garrison;
  $("countyLevy").textContent=c.levy;
  $("countyDuchy").textContent=WORLD.duchies.find(d=>d.id===c.duchy).name.replace("Duchy of ","");
  $("countyStatus").textContent=c.status==="yours"?"YOUR COUNTY":c.status==="rival"?"RIVAL":"INDEPENDENT";
  const actions=c.status==="yours"?[
    ["Develop Holding","-25 gold · +1 dev","develop"],
    ["Raise Levies","+150 troops · -12 gold","levy"],
    ["Collect Extraordinary Tax","+12 gold · +5 stress","extax"],
    ["Sway Vassal","+18 opinion · -10 prestige","sway"]
  ]:c.status==="rival"?[
    ["Fabricate Claim","-35 prestige","claim"],
    ["Declare War","Start conquest war","war"],
    ["Sway Rival","+20 opinion","sway"],
    ["Inspect Garrison","Reveal military strength","inspect"]
  ]:[
    ["Fabricate Claim","-35 prestige","claim"],
    ["Send Gift","-15 gold · +25 opinion","gift"],
    ["Arrange Marriage","+10 prestige","marry"],
    ["Invite to Court","+10 opinion","invite"]
  ];
  $("countyActions").innerHTML=actions.map(a=>'<button class="action-btn" data-action="'+a[2]+'"><b>'+esc(a[0])+'</b><span>'+esc(a[1])+'</span></button>').join("");
  document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>action(b.dataset.action));
}

function renderRuler(){
  const r=ruler();
  $("rulerName").textContent=r.name;
  $("rulerTitle").textContent=r.title;
  $("rulerDynasty").textContent=r.dynasty;
  $("rulerStats").innerHTML=[["MART","martial"],["DIP","diplomacy"],["STEW","stewardship"],["INTR","intrigue"],["LEARN","learning"]].map(x=>'<div><span>'+x[0]+'</span><b>'+r[x[1]]+"</b></div>").join("");
  $("traits").innerHTML=r.traits.map(t=>'<span class="trait">'+esc(t)+"</span>").join("");
  const heir=char(S.heirId);
  $("heir").textContent=heir?heir.name+" · age "+heir.age:"No heir";
  $("spouse").textContent= r.spouse?char(r.spouse)?.name:"None";
  $("dynasty").textContent=r.dynasty;
}

function renderRealm(){
  $("realmTier").textContent=ownedCounties().length>=6?"KINGDOM":ownedCounties().length>=3?"DUCHY":"COUNTY";
  $("domainCount").textContent=ownedCounties().length;
  $("duchyCount").textContent=ownedDuchies().length;
  $("realmTax").textContent=realmTax().toFixed(1);
  $("armyPower").textContent=Math.floor(playerPower());
  $("law").textContent=S.succession.replace("_"," ");
  $("authority").textContent=S.crownAuthority;
}

function renderCourt(){
  const entries=[
    ["Chancellor",S.council.chancellor,"Diplomacy"],
    ["Marshal",S.council.marshal,"Army"],
    ["Steward",S.council.steward,"Taxes"],
    ["Spymaster",S.council.spymaster,"Intrigue"],
    ["Chaplain",S.council.chaplain,"Faith"]
  ];
  $("council").innerHTML=entries.map(e=>{
    const ch=char(e[1]);return '<div class="court-row"><div><b>'+esc(e[0])+'</b><span>'+esc(e[2])+'</span></div><strong>'+esc(ch?.name||"Vacant")+'</strong><em>'+((ch?.diplomacy||0)+(ch?.stewardship||0)+(ch?.intrigue||0))/3|0+'</em></div>'
  }).join("");
  const vs=WORLD.counties.filter(c=>c.status==="yours"&&c.holder!==S.rulerId).map(c=>{const v=char(c.holder);return '<button class="list-row" data-char="'+c.holder+'"><span>'+esc(v.name)+'</span><b>'+opinion(v.id)+'</b><small>'+esc(c.name)+'</small></button>'}).join("");
  $("vassals").innerHTML=vs||'<div class="empty">No direct vassals.</div>';
  document.querySelectorAll("[data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char));
}

function renderDynasty(){
  const members=Object.values(WORLD.characters).filter(c=>c.dynasty===ruler().dynasty&&c.alive);
  $("dynastySize").textContent=members.length;
  $("succession").textContent=S.succession.replace("_"," ");
  $("successionList").innerHTML=members.sort((a,b)=>a.age-b.age).map(c=>{
    const tag=c.id===S.heirId?"HEIR":c.id===S.rulerId?"RULER":"";
    return '<button class="list-row" data-char="'+c.id+'"><span>'+esc(c.name)+'</span><b>'+esc(tag)+'</b><small>'+c.age.toFixed(0)+" · "+esc(c.title)+"</small></button>"
  }).join("");
  document.querySelectorAll("[data-char]").forEach(b=>b.onclick=()=>showCharacter(b.dataset.char));
}

function renderWar(){
  if(!S.war){$("warCard").innerHTML='<div class="empty">No active war. Select an enemy county and declare war.</div>';return}
  const w=S.war,t=county(w.target),enemy=char(t.holder),bar=Math.max(-100,Math.min(100,w.score));
  $("warCard").innerHTML='<div class="war-title"><div><span class="eyebrow">ACTIVE WAR</span><h3>Conquest of '+esc(t.name)+'</h3></div><b>'+bar+'%</b></div><div class="bar"><i style="width:'+(bar+100)/2+'%"></i></div><div class="war-grid"><div><span>Your army</span><b>'+Math.floor(S.levies)+'</b></div><div><span>Enemy county</span><b>'+t.levy+'</b></div><div><span>War months</span><b>'+w.months+'</b></div></div><div class="action-grid"><button class="action-btn" data-action="battle"><b>Force Battle</b><span>Risk troops for warscore</span></button><button class="action-btn" data-action="negotiate"><b>Negotiate Peace</b><span>End if favorable</span></button></div>';
  document.querySelectorAll("#warCard [data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
}

function renderFactions(){
  const candidates=WORLD.counties.filter(c=>c.status==="yours"&&c.holder!==S.rulerId).map(c=>{const v=char(c.holder);return {id:v.id,name:v.name,op:opinion(v.id)}}).filter(x=>x.op<35);
  $("factions").innerHTML=candidates.length?candidates.map(v=>'<div class="faction"><div><b>'+esc(v.name)+'</b><span>Liberty faction</span></div><strong>'+Math.max(5,Math.floor((100-v.op)*1.2))+'%</strong></div>').join(""):'<div class="empty">No major faction threatens the crown.</div>';
}

function renderEvents(){
  $("events").innerHTML=S.events.map(e=>'<div class="event"><i class="event-dot '+esc(e.kind)+'"></i><div><p>'+esc(e.text)+'</p><time>'+esc(e.when)+'</time></div></div>').join("");
}

function showCharacter(id){
  const c=char(id);if(!c)return;
  $("modal").classList.add("open");
  $("modalBody").innerHTML='<div class="modal-head"><div><span class="eyebrow">CHARACTER</span><h2>'+esc(c.name)+'</h2></div><button id="closeModal">×</button></div><p class="muted">'+esc(c.title)+' · '+esc(c.dynasty)+' · age '+c.age+'</p><div class="char-grid">'+
    [["Martial",c.martial],["Diplomacy",c.diplomacy],["Stewardship",c.stewardship],["Intrigue",c.intrigue],["Learning",c.learning],["Opinion",opinion(id)]].map(x=>'<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("")+
    '</div><div class="traits">'+c.traits.map(t=>'<span class="trait">'+esc(t)+"</span>").join("")+'</div>';
  $("closeModal").onclick=()=>$("modal").classList.remove("open");
}

function action(a){
  const c=county(S.selectedCounty), h=char(c.holder), r=ruler();
  if(a==="develop"){
    if(S.gold<25)return toast("Not enough gold");S.gold-=25;c.dev++;c.tax+=.35;
    log("Builders expanded "+c.name+" to development "+c.dev+".");toast("Holding developed");
  }else if(a==="levy"){
    if(S.gold<12)return toast("Not enough gold");S.gold-=12;S.levies+=150;
    log("The marshal raised 150 levies in "+c.name+".","war");toast("+150 levies");
  }else if(a==="extax"){
    S.gold+=12;S.stress+=5;log("Extraordinary tax was collected from "+c.name+".","court");toast("+12 gold, +5 stress");
  }else if(a==="sway"){
    const id=h.id;S.relations[id]=Math.min(100,opinion(id)+20);S.prestige=Math.max(0,S.prestige-10);
    log("Your chancellor began swaying "+h.name+".");toast("Opinion improved");
  }else if(a==="claim"){
    S.claimCounty=c.id;S.prestige=Math.max(0,S.prestige-35);log("A legal claim was prepared on "+c.name+".","court");toast("Claim prepared");
  }else if(a==="gift"){
    if(S.gold<15)return toast("Not enough gold");S.gold-=15;S.relations[h.id]=Math.min(100,opinion(h.id)+25);log("A gift improved relations with "+h.name+".");toast("Gift delivered");
  }else if(a==="marry"){
    S.prestige+=10;S.legitimacy+=2;log("A marriage proposal was sent to "+h.name+".","dynasty");toast("Proposal sent");
  }else if(a==="invite"){
    S.relations[h.id]=Math.min(100,opinion(h.id)+10);log(h.name+" was invited to court.");toast("Invitation sent");
  }else if(a==="inspect"){toast(h.name+" commands roughly "+c.levy+" levies here")}
  else if(a==="war"){
    if(S.war)return toast("You are already at war");
    if(c.status!=="rival")return toast("That county is not an enemy");
    if(S.levies<700)return toast("Need at least 700 levies");
    S.war={target:c.id,score:0,months:0};log("War declared on "+h.name+" for "+c.name+".","war");toast("War declared");
  }else if(a==="battle"){
    if(!S.war)return;
    const t=county(S.war.target),attack=Math.max(1,S.levies),def=t.levy+t.garrison;
    const ratio=attack/def,loss=Math.max(50,Math.floor(def*(ratio>.95?.12:.2)));
    S.levies=Math.max(0,S.levies-loss);
    if(ratio>.9){S.war.score+=18+Math.floor(Math.random()*15);log("Victory in the field against "+char(t.holder).name+".","war");toast("Battle won")}
    else{S.war.score-=14;log("The army was repulsed near "+t.name+".","war");toast("Battle lost")}
  }else if(a==="negotiate"){
    if(!S.war)return;
    if(S.war.score>=60){const t=county(S.war.target);t.status="yours";S.prestige+=45;S.legitimacy+=6;log("Peace signed. "+t.name+" became part of your realm.","war");S.war=null;toast("War won")}
    else if(S.war.score>=0){log("The enemy refused a weak peace offer.","war");toast("Peace refused")}
    else{S.prestige=Math.max(0,S.prestige-15);S.war=null;log("You accepted a humiliating white peace.","war");toast("White peace")}
  }else if(a==="save"){save();return}
  render();
}

function monthlyTick(){
  if(S.paused)return;
  S.day+=3;
  if(S.day>30){S.day=3;S.month++;if(S.month>12){S.month=1;S.year++;ruler().age+=1;Object.values(WORLD.characters).forEach(c=>{if(c.alive&&c.id!==S.rulerId)c.age+=1});yearTick()}}
  const steward=char(S.council.steward),bonus=((steward?.stewardship||0)-8)*.18;
  S.gold+=Math.max(0,realmTax()*.08*(1+bonus));
  S.levies=Math.min(S.troopCap,S.levies+Math.floor(totalVassalLevies()*.025));
  if(S.stress>0&&Math.random()<.08)S.stress--;
  if(S.war){S.war.months++;const t=county(S.war.target),ratio=S.levies/Math.max(1,t.levy+t.garrison);S.war.score+=ratio>.9?5:ratio<.55?-4:1;if(S.war.score>=100){t.status="yours";S.prestige+=55;S.war=null;log("The enemy surrendered. Victory secured.","war");toast("War won!")}if(S.war&&S.war.months>24&&S.war.score<0){S.war=null;log("The war dragged on until both sides accepted peace.","war")}}
  aiTick();saveSilent();render();
}
function yearTick(){
  S.gold+=Math.max(0,realmTax());
  S.prestige+=2;S.piety+=1;S.legitimacy=Math.min(100,S.legitimacy+1);
  if(Math.random()<.15){
    const r=Math.floor(Math.random()*5);
    if(r===0){S.gold+=20;log("A wealthy merchant sponsored the crown. +20 gold.")}
    else if(r===1){S.stress=Math.max(0,S.stress-15);log("A great feast relieved court tensions. -15 stress.","court")}
    else if(r===2){S.piety+=18;log("Pilgrims praised your protection of the old shrines.","dynasty")}
    else if(r===3){S.levies=Math.max(0,S.levies-120);log("A harsh winter reduced available levies.","war")}
    else{S.legitimacy-=3;log("A succession dispute has damaged royal legitimacy.","dynasty")}
  }
  successionPressure();
}
function aiTick(){
  WORLD.counties.filter(c=>c.status==="yours"&&c.holder!==S.rulerId).forEach(c=>{
    const v=char(c.holder);if(Math.random()<.12)S.relations[v.id]=Math.min(100,opinion(v.id)+1);
    if(opinion(v.id)<-45)log(v.name+" is openly hostile to the crown.","court");
  });
  const weak=ownedCounties().length<5&&Math.random()<.03;
  if(weak){const target=WORLD.counties.find(c=>c.status==="neutral");if(target)log("A neighboring lord has started considering an alliance with "+target.name+".","court")}
}
function successionPressure(){
  const r=ruler();
  if(r.age>=60&&Math.random()<.08)death(false);
  if(S.stress>=90&&Math.random()<.04)death(true);
}
function death(stressDeath){
  const old=ruler(),heir=char(S.heirId);
  if(!heir){log(old.name+" died without a recognized heir. Campaign ended.","dynasty");S.paused=true;return}
  old.alive=false;
  S.rulerId=heir.id;
  S.heirId=chooseHeir();
  S.gold=Math.max(0,S.gold*.8);S.prestige=Math.max(0,S.prestige-20);S.legitimacy=Math.max(20,S.legitimacy-18);S.stress=10;
  log(old.name+" died"+(stressDeath?" after years of severe stress":" of old age")+". "+heir.name+" inherits the realm.","dynasty");
}
function chooseHeir(){
  const m=Object.values(WORLD.characters).filter(c=>c.alive&&c.dynasty===ruler().dynasty&&c.id!==S.rulerId);
  if(!m.length)return null;
  if(S.succession==="male_preference"){const males=m.filter(c=>c.sex==="m").sort((a,b)=>b.martial-a.martial);if(males[0])return males[0].id}
  return m.sort((a,b)=>b.age-a.age)[0].id;
}
function saveSilent(){localStorage.setItem(KEY,JSON.stringify(S))}

function render(){
  renderTop();renderMap();renderSelected();renderRuler();renderRealm();renderCourt();renderDynasty();renderWar();renderFactions();renderEvents();
}
document.querySelectorAll(".speed button").forEach(b=>b.onclick=()=>{S.speed=+b.dataset.speed;S.paused=S.speed===0;document.querySelectorAll(".speed button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("pauseBtn").textContent=S.paused?"▶":"Ⅱ";render()});
$("pauseBtn").onclick=()=>{S.paused=!S.paused;$("pauseBtn").textContent=S.paused?"▶":"Ⅱ"};
$("newGameBtn").onclick=reset;
$("saveBtn").onclick=save;
$("closeModal").onclick=()=>$("modal").classList.remove("open");
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  const tab=b.dataset.tab;document.querySelectorAll(".tab-page").forEach(x=>x.classList.remove("show"));$("tab-"+tab).classList.add("show");
});
render();
setInterval(monthlyTick,1200);
