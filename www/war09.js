
// Dynasty Realms v0.9 - deeper warfare, real occupations, multiple fronts, duchy wars, naval transport, AI objectives

function normalizeWarState(){
  S.version=9;
  S.warClaims=S.warClaims&&typeof S.warClaims==="object"?S.warClaims:{};
  S.selectedArmyId=S.selectedArmyId||S.armies?.[0]?.id||null;
  S.armies=(S.armies||[]).filter(a=>a&&a.men>0);
  if(!S.armies.length)S.armies.push({id:"a_main_"+Date.now().toString(36),name:"Royal Host",men:1,levy:1,menAtArms:0,morale:80,commander:S.rulerId,location:S.selectedCounty,supply:60,fatigue:0,embarked:false,raised:true});
  if(!S.armies.some(a=>a.id===S.selectedArmyId))S.selectedArmyId=S.armies[0].id;
  S.armies.forEach(a=>{a.embarked=!!a.embarked;a.supply=a.supply??100;a.fatigue=a.fatigue??0;a.morale=a.morale??100});
  S.wars=(S.wars||[]).map(w=>{
    if(w.kind==="revolt")return w;
    w.goal=w.goal||"conquest_county";w.targetDuchy=w.targetDuchy||county(w.target)?.duchy||null;w.fronts=w.fronts&&typeof w.fronts==="object"?w.fronts:{};
    w.enemy=w.enemy??enemyPower(county(w.target));w.battles=w.battles||0;
    warObjectives(w).forEach(c=>{if(c&&!w.fronts[c.id])w.fronts[c.id]={siege:0}});
    return w;
  });
}
function duchyCounties(id){return WORLD.counties.filter(c=>c.duchy===id)}
function coastal(id){return county(id)?.terrain==="coast"}
function armySelected(){return S.armies.find(a=>a.id===S.selectedArmyId)||S.armies[0]}
function warPlayerScore(w){return w.attacker===S.rulerId?w.score:-w.score}
function warObjectives(w){
  if(w.kind==="revolt")return county(w.target)?[county(w.target)]:[];
  if(w.goal==="claim_duchy")return duchyCounties(w.targetDuchy);
  return county(w.target)?[county(w.target)]:[];
}
function warHasPlayer(w){return w.attacker===S.rulerId||w.defender===S.rulerId||(!w.attacker&&!w.defender)}
function warOccupier(w){return w.attacker===S.rulerId?S.rulerId:w.attacker}
function warGoalReady(w,occupier=warOccupier(w)){
  const objs=warObjectives(w);return objs.length>0&&objs.every(c=>c.occupiedBy===occupier);
}
function countyWarBusy(id){return S.wars.some(w=>w.kind!=="revolt"&&warObjectives(w).some(c=>c.id===id))}
function syncWorldState(){
  S.countyState={};
  WORLD.counties.forEach(c=>S.countyState[c.id]={holder:c.holder,status:c.status,dev:c.dev,tax:c.tax,garrison:c.garrison,levy:c.levy,control:c.control,culture:c.culture,faith:c.faith,fort:c.fort,buildings:c.buildings||{farm:0,market:0,walls:0},occupiedBy:c.occupiedBy||null,occupationWar:c.occupationWar||null,siege:c.siege||0});
  S.titleHolders={};WORLD.titles.forEach(t=>S.titleHolders[t.id]=t.holder);
  Object.values(WORLD.characters).filter(c=>S.customCharacters&&S.customCharacters[c.id]).forEach(c=>S.customCharacters[c.id]=c);
}
function fabricateDuchyClaim(){
  const c=county(S.selectedCounty),d=c&&duchy(c.duchy),holder=d&&titleHolder(d.id);
  if(!c||!d||holder===S.rulerId)return toast("Invalid duchy target");
  if(S.warClaims[d.id])return toast("You already have a claim on this duchy");
  if(S.prestige<90)return toast("Need 90 prestige");
  S.prestige-=90;S.warClaims[d.id]=S.year;
  log("The court recognized a claim on the "+d.name+".","court");toast("Duchy claim created");render();saveSilent();
}
function declareWar(goal){
  const c=county(S.selectedCounty);if(!c)return;
  const external=S.wars.filter(w=>w.kind!=="revolt"&&warHasPlayer(w));
  if(external.length>=2)return toast("Too many external wars");
  if(c.occupiedBy&&c.occupiedBy!==S.rulerId)return toast("This front is already occupied");
  const d=duchy(c.duchy);
  if(goal==="claim_duchy"){
    if(!d||titleHolder(d.id)===S.rulerId)return toast("You do not need this duchy");
    if(!S.warClaims[d.id])return toast("Need a valid duchy claim");
  }else{
    if(c.status!=="rival")return toast("That county is not hostile");
    if(!S.claims.includes(c.id))return toast("Need a valid county claim");
  }
  const adjacent=ownedCounties().some(pc=>(WORLD.adjacency[pc.id]||[]).includes(c.id));
  const hasNavalPath=coastal(c.id)&&ownedCounties().some(pc=>coastal(pc.id));
  if(!adjacent&&!hasNavalPath)return toast("Target is not reachable from your realm");
  if(playerPower()<700)return toast("Need 700 troops in the field");
  const objectives=goal==="claim_duchy"?duchyCounties(d.id):[c];
  if(objectives.some(x=>countyWarBusy(x.id)))return toast("One of these counties is already a war front");
  const defender=titleHolder(goal==="claim_duchy"?d.id:c.duchy);
  const w={id:"w_"+Date.now().toString(36),kind:"external",attacker:S.rulerId,defender,name:goal==="claim_duchy"?"Claim War for the "+d.name:"Conquest of "+c.name,target:c.id,targetDuchy:goal==="claim_duchy"?d.id:null,goal,score:0,months:0,siege:0,enemy:enemyPower(c)+Math.floor((char(defender)?.martial||5)*35),battles:0,fronts:{}};
  objectives.forEach(x=>w.fronts[x.id]={siege:0});
  S.wars.push(w);log("War declared: "+w.name+".","war");toast(goal==="claim_duchy"?"Duchy war declared":"War declared");render();saveSilent();
}
function siegePowerAt(w,cid){
  return S.armies.filter(a=>a.raised&&a.location===cid&&a.men>0).reduce((sum,a)=>{
    const cmd=char(a.commander),quality=a.menAtArms/Math.max(1,a.men);
    return sum+a.men*(a.supply/100)*Math.max(.25,1-a.fatigue/150)*(1+quality*.45)+(cmd?.martial||5)*12;
  },0);
}
function occupyCounty(w,c,who){
  c.occupiedBy=who;c.occupationWar=w.id;c.control=clamp(c.control-18,0,100);c.siege=100;
  w.fronts[c.id]=w.fronts[c.id]||{};w.fronts[c.id].siege=100;w.fronts[c.id].occupiedBy=who;
  log(c.name+" fell under occupation by "+(char(who)?.name||"an enemy")+".","war");
}
function processPlayerSiege(w,c){
  if(!c||c.occupiedBy===S.rulerId)return;
  const power=siegePowerAt(w,c.id);if(power<=0)return;
  const army=S.armies.filter(a=>a.raised&&a.location===c.id).sort((a,b)=>b.men-a.men)[0],commander=char(army?.commander)||ruler();
  const required=(c.fort||1)*160+Math.max(0,c.garrison*.35);
  const gain=clamp(power/Math.max(160,required)*4+(commander?.martial||5)*.08,0,11);
  w.fronts[c.id]=w.fronts[c.id]||{siege:0};w.fronts[c.id].siege=clamp((w.fronts[c.id].siege||0)+gain,0,100);c.siege=w.fronts[c.id].siege;
  if(w.fronts[c.id].siege>=100)occupyCounty(w,c,S.rulerId);
}
function battleWar(w){
  if(w.kind==="revolt"){
    const a=armySelected();if(!a)return;const t=county(w.target),def=Math.max(1,w.enemy),cmd=char(a.commander),skill=cmd?.martial||5,terrain=terrainMod(t?.terrain);
    const attack=Math.max(1,a.men)*(1+skill*.025)*(a.morale/100)*(a.supply/100)*terrain,defense=Math.max(1,def)*(1.05+((t?.fort||1)*.02)),ratio=attack/defense,loss=Math.max(18,Math.floor(def*(ratio>.95?.08:.14)));
    a.men=Math.max(1,a.men-loss);a.levy=Math.max(0,a.levy-Math.min(a.levy,Math.floor(loss*.75)));a.morale=clamp(a.morale-(ratio>.95?4:13),0,100);a.fatigue=clamp(a.fatigue+(ratio>.95?6:11),0,100);w.enemy=Math.max(0,w.enemy-loss);
    if(ratio>.95){w.score+=18+Math.floor(Math.random()*12);log("Victory in battle near "+(t?.name||"the rebels")+".","war");toast("Victory")}else{w.score-=12;log("The army was repulsed.","war");toast("Defeat")}return;
  }
  const a=armySelected();if(!a)return;const front=warObjectives(w).find(c=>c.id===a.location);
  if(!front)return toast("Move a selected army onto a war front first");
  const t=front,cmd=char(a.commander),terrain=terrainMod(t.terrain);
  const attack=Math.max(1,a.men)*(1+(cmd?.martial||5)*.028)*(a.morale/100)*(a.supply/100)*terrain;
  const localDefense=Math.max(90,t.garrison+t.levy*.45+(t.fort||1)*55),enemyField=Math.max(120,w.enemy||0);
  const defense=w.attacker===S.rulerId?localDefense:enemyField,ratio=attack/Math.max(1,defense);
  const loss=Math.max(12,Math.floor(defense*(ratio>.95?.065:.12)));
  a.men=Math.max(1,a.men-loss);a.levy=Math.max(0,a.levy-Math.min(a.levy,Math.floor(loss*.7)));a.morale=clamp(a.morale-(ratio>.95?5:12),0,100);a.fatigue=clamp(a.fatigue+(ratio>.95?7:12),0,100);
  if(w.attacker===S.rulerId)t.garrison=Math.max(0,t.garrison-Math.floor(loss*.55));else w.enemy=Math.max(0,w.enemy-loss);
  w.battles++;
  if(ratio>.95){w.score+=18+Math.floor(Math.random()*10);if(w.attacker===S.rulerId)processPlayerSiege(w,t);log("Victory at "+t.name+".","war");toast("Battle won")}
  else{w.score-=14;log("Defeat at "+t.name+".","war");toast("Battle lost")}
}
function warAction(id,act){
  const w=activeWar(id);if(!w)return;
  if(act==="battle")battleWar(w);
  else if(act==="peace"){
    const ps=w.kind==="revolt"?w.score:warPlayerScore(w);
    if(w.kind==="revolt"){if(w.score>=30)endWar(w,"victory");else if(w.score<0)endWar(w,"white_peace");else return toast("Rebel terms are not yet favorable")}
    else if(ps>=60&&warGoalReady(w,S.rulerId))endWar(w,"victory");
    else if(ps<=-60&&warGoalReady(w,w.attacker))endWar(w,"defeat");
    else if(ps>=0)return toast("The enemy refuses to concede yet");
    else endWar(w,"white_peace");
  }
  render();saveSilent();
}
function endWar(w,result){
  if(w.kind==="revolt"){
    if(result==="victory")w.rebels?.forEach(id=>S.relations[id]=clamp(opinion(id)+30,-100,100));
    else if(result==="defeat")w.rebels?.forEach(id=>{S.relations[id]=Math.max(-100,opinion(id)-25);const c=WORLD.counties.find(x=>x.holder===id);if(c)c.control=55});
    S.wars=S.wars.filter(x=>x.id!==w.id);log(w.name+" has ended: "+result.replace("_"," "),"war");return;
  }
  if(result==="victory"){
    warObjectives(w).forEach(c=>{if(!c)return;setTitleHolder(c.id,S.rulerId);c.occupiedBy=null;c.occupationWar=null;c.siege=0});
    if(w.goal==="claim_duchy"&&w.targetDuchy){setTitleHolder(w.targetDuchy,S.rulerId);delete S.warClaims[w.targetDuchy]}
    if(w.goal==="conquest_county")S.claims=S.claims.filter(id=>id!==w.target);
    S.prestige+=w.goal==="claim_duchy"?90:50;S.legitimacy=clamp(S.legitimacy+(w.goal==="claim_duchy"?8:5),0,100);
  }else if(result==="defeat"){
    const winner=w.attacker===S.rulerId?w.defender:w.attacker;
    warObjectives(w).forEach(c=>{if(!c)return;if(winner&&winner!==S.rulerId)setTitleHolder(c.id,winner);c.occupiedBy=null;c.occupationWar=null;c.siege=0});
    if(w.goal==="conquest_county")S.claims=S.claims.filter(id=>id!==w.target);
    if(w.goal==="claim_duchy")delete S.warClaims[w.targetDuchy];
    S.prestige=Math.max(0,S.prestige-30);S.legitimacy=clamp(S.legitimacy-5,0,100);
  }else{
    warObjectives(w).forEach(c=>{if(c.occupationWar===w.id){c.occupiedBy=null;c.occupationWar=null;c.siege=0}});
  }
  S.wars=S.wars.filter(x=>x.id!==w.id);log(w.name+" has ended: "+result.replace("_"," "),"war");
}
function monthlyWar(w){
  if(!w||!S.wars.includes(w))return;
  if(w.kind==="revolt"){
    const a=armySelected(),t=county(w.target);w.months++;
    if(a&&t&&a.location===w.target){w.enemy=Math.max(0,w.enemy-18);w.siege=clamp((w.siege||0)+3,0,100);w.score+=w.enemy>0?2:8}
    if(w.score>=100||w.enemy<=0)endWar(w,"victory");else if(w.months>24&&w.score<0)endWar(w,"white_peace");return;
  }
  w.months++;const objs=warObjectives(w);
  if(w.attacker===S.rulerId){
    objs.forEach(c=>processPlayerSiege(w,c));
    if(objs.some(c=>c.occupiedBy===S.rulerId))w.score+=2;
    if(w.enemy>0&&w.months%3===0)w.enemy=Math.max(0,w.enemy-10);
  }else if(w.defender===S.rulerId){
    const t=county(w.target);
    const local=(S.armies||[]).filter(a=>a.raised&&a.location===t?.id).reduce((n,a)=>n+a.men,0);
    const defense=(t?.garrison||0)+(t?.levy||0)*.5+local*.35+(t?.fort||1)*60+playerPower()*.04;
    const assault=Math.max(100,(w.enemy||300)*.12+(char(w.attacker)?.martial||7)*9);
    if(t&&t.occupiedBy!==w.attacker){
      const gain=clamp(assault/Math.max(250,defense)*5,0,9);
      w.fronts[t.id]=w.fronts[t.id]||{siege:0};w.fronts[t.id].siege=clamp((w.fronts[t.id].siege||0)+gain,0,100);t.siege=w.fronts[t.id].siege;
      if(w.fronts[t.id].siege>=100)occupyCounty(w,t,w.attacker);
    }
    if(t?.occupiedBy===w.attacker)w.score-=3;
  }
  if(w.attacker===S.rulerId&&warGoalReady(w,S.rulerId)&&w.score>=100)endWar(w,"victory");
  else if(w.defender===S.rulerId&&warGoalReady(w,w.attacker)&&w.score<=-100)endWar(w,"defeat");
  else if(w.months>30&&Math.abs(w.score)<35)endWar(w,"white_peace");
}
function renderMap(){
  $("mapRegions").innerHTML=WORLD.counties.map(c=>{
    const cls=c.status==="yours"?"yours":c.status==="rival"?"rival":"neutral";
    return "<polygon class='region "+cls+(c.occupiedBy?" occupied":"")+(c.id===S.selectedCounty?" selected":"")+"' data-id='"+c.id+"' points='"+c.points+"'></polygon>";
  }).join("");
  $("mapLabels").innerHTML=WORLD.counties.map(c=>"<text class='map-label' x='"+c.x+"' y='"+c.y+"'>"+esc(c.name)+"</text>").join("");
  document.querySelectorAll(".region").forEach(e=>e.onclick=()=>{S.selectedCounty=e.dataset.id;render()});
}
function renderSelected(){
  const c=county(S.selectedCounty),h=char(c?.holder),d=duchy(c?.duchy);if(!c)return;
  $("countyName").textContent=c.name;$("countyHolder").textContent=h?.name||"Vacant";$("countyDev").textContent=c.dev;$("countyTax").textContent=c.tax.toFixed(1)+"/mo";$("countyGarrison").textContent=c.garrison;$("countyLevy").textContent=c.levy;$("countyDuchy").textContent=d?.name?.replace("Duchy of ","")||"—";
  $("countyStatus").textContent=c.occupiedBy?(c.occupiedBy===S.rulerId?"OCCUPIED BY THE CROWN":"OCCUPIED BY "+(char(c.occupiedBy)?.name||"ENEMY")):c.status==="yours"?(c.holder===S.rulerId?"DIRECT DOMAIN":"VASSAL DOMAIN"):c.status==="rival"?"RIVAL":"INDEPENDENT";
  const hb=c.buildings||{farm:0,market:0,walls:0};const occLine=c.occupiedBy?"<br><b>Occupation:</b> "+esc(c.occupiedBy===S.rulerId?"Your army":char(c.occupiedBy)?.name||"Enemy")+" · "+Math.round(c.siege||0)+"%":"";
  $("holdingsSummary").innerHTML="<b>Holdings:</b> Farms "+hb.farm+"/3 · Markets "+hb.market+"/3 · Fortifications "+hb.walls+"/3"+occLine;
  let actions=[];
  if(c.status==="rival")actions=[["Fabricate Claim","-35 prestige","claim"],["Declare County War","Requires claim + reach","war"],["Fabricate Duchy Claim","-90 prestige","claim_duchy"],["Declare Duchy War","Requires duchy claim","war_duchy"],["Sway Ruler","+20 opinion","sway"]];
  else if(c.status!=="yours")actions=[["Fabricate Claim","-35 prestige","claim"],["Send Gift","-15 gold · +25 opinion","gift"],["Arrange Marriage","Adult dynastic match","marry"],["Offer Alliance","-20 prestige","alliance"]];
  else if(c.holder!==S.rulerId)actions=[["Revoke Title","Risk faction revolt","revoke"],["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+troops · -12 gold","levy"],["Sway Vassal","+20 opinion","sway"]];
  else actions=[["Develop Holding","-25 gold · +1 development","develop"],["Raise Levies","+troops · -12 gold","levy"],["Recruit Men-at-Arms","-35 gold · +100 MAA","recruit"],["Grant Title","Choose a direct vassal","grant"]];
  if(c.status==="yours"&&isPlayerVassal(c.holder))actions.splice(Math.min(2,actions.length),0,["Manage Holdings","Farms · markets · fortifications","holdings"]);
  $("countyActions").innerHTML=actions.map(a=>"<button class='action-btn' data-action='"+a[2]+"'><b>"+esc(a[0])+"</b><span>"+esc(a[1])+"</span></button>").join("");
  document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function renderArmy(){
  $("armyCard").innerHTML=S.armies.map(a=>{
    const cmd=char(a.commander),loc=county(a.location),selected=a.id===S.selectedArmyId;
    return "<div class='army-card "+(selected?"army-selected":"")+"'><div class='army-row'><button class='army-select' data-army='"+a.id+"'><div><b>"+esc(a.name)+"</b><span>Commander: "+esc(cmd?.name||"None")+" · "+esc(loc?.name||"Unknown")+(a.embarked?" · AT SEA":"")+"</span></div><strong>"+Math.floor(a.men)+"</strong></button></div><div class='army-details'><div><span>Levy</span><b>"+Math.floor(a.levy)+"</b></div><div><span>Men-at-Arms</span><b>"+Math.floor(a.menAtArms)+"</b></div><div><span>Morale</span><b>"+Math.round(a.morale)+"%</b></div><div><span>Supply</span><b>"+Math.round(a.supply)+"%</b></div><div><span>Fatigue</span><b>"+Math.round(a.fatigue)+"</b></div><div><span>Terrain</span><b>"+esc(loc?.terrain||"?")+"</b></div></div><div class='army-controls'><button data-army='"+a.id+"' data-army-action='select'>Select Army</button><button data-army='"+a.id+"' data-army-action='marshal'>Make Primary</button><button data-army='"+a.id+"' data-army-action='disband'>Disband</button></div></div>"
  }).join("");
  document.querySelectorAll("[data-army-action]").forEach(b=>b.onclick=()=>armyAction(b.dataset.army,b.dataset.armyAction));
  document.querySelectorAll(".army-select").forEach(b=>b.onclick=()=>{S.selectedArmyId=b.dataset.army;render();saveSilent()});
}
function renderArmyOrders(){
  const a=armySelected();if(!a){$("armyOrders").innerHTML="<div class='empty'>No army available.</div>";return}
  const loc=county(a.location);if(!loc){$("armyOrders").innerHTML="<div class='empty'>Army position unknown.</div>";return}
  let buttons=(WORLD.adjacency[a.location]||[]).map(id=>county(id)).filter(Boolean).map(t=>"<button class='order-btn' data-move='"+t.id+"'><b>March to "+esc(t.name)+"</b><span>"+(t.occupiedBy?"Occupied front":t.status==="rival"?"Enemy territory":t.status==="neutral"?"Independent":"Friendly")+" · "+esc(t.terrain)+"</span></button>");
  if(coastal(a.location)&&(loc.status==="yours"||loc.occupiedBy===S.rulerId)){
    const coastTargets=WORLD.counties.filter(t=>t.id!==a.location&&coastal(t.id));
    if(!a.embarked)buttons.push("<button class='order-btn naval' data-naval='embark'><b>Embark Fleet</b><span>-8 gold · Coastal transport</span></button>");
    else coastTargets.forEach(t=>buttons.push("<button class='order-btn naval' data-sail='"+t.id+"'><b>Sail to "+esc(t.name)+"</b><span>Naval transfer · -10 gold</span></button>"));
  }
  if(a.embarked)buttons.push("<button class='order-btn' data-naval='disembark'><b>Disembark</b><span>Return to land operations</span></button>");
  $("armyOrders").innerHTML="<div class='order-grid'>"+(buttons.join("")||"<div class='empty'>No reachable orders.</div>")+"</div>";
  document.querySelectorAll("[data-move]").forEach(b=>b.onclick=()=>{const target=county(b.dataset.move);a.location=target.id;a.embarked=false;a.fatigue=clamp(a.fatigue+4,0,100);log(a.name+" marched to "+target.name,"war");toast("Army moved");render();saveSilent()});
  document.querySelectorAll("[data-naval]").forEach(b=>b.onclick=()=>{
    const act=b.dataset.naval;
    if(act==="embark"){if(S.gold<8)return toast("Need 8 gold");S.gold-=8;a.embarked=true;a.fatigue=clamp(a.fatigue+3,0,100);log(a.name+" embarked at "+loc.name+".","war");toast("Army embarked")}
    if(act==="disembark"){a.embarked=false;toast("Army disembarked")}
    render();saveSilent();
  });
  document.querySelectorAll("[data-sail]").forEach(b=>b.onclick=()=>{
    const target=county(b.dataset.sail);if(!a.embarked||!coastal(target.id))return;
    if(S.gold<10)return toast("Need 10 gold");S.gold-=10;a.location=target.id;a.embarked=false;a.fatigue=clamp(a.fatigue+7,0,100);a.supply=clamp(a.supply-10,0,100);log(a.name+" sailed to "+target.name+".","war");toast("Naval landing complete");render();saveSilent();
  });
}
function armyAction(id,act){
  const a=S.armies.find(x=>x.id===id);if(!a)return;
  if(act==="select"){S.selectedArmyId=id;render();saveSilent();return}
  if(act==="marshal"){S.armies.forEach(x=>x.raised=false);a.raised=true;S.selectedArmyId=id;log(a.name+" is now the primary host.","war");toast("Primary army selected")}
  if(act==="disband"){if(S.armies.length===1)return toast("Keep one army");S.levies=Math.min(S.troopCap,S.levies+a.levy);S.armies=S.armies.filter(x=>x.id!==id);if(S.selectedArmyId===id)S.selectedArmyId=S.armies[0]?.id||null;toast("Army disbanded")}
  render();saveSilent();
}
function splitArmy(){
  const a=armySelected();if(!a||a.men<400)return toast("Need at least 400 troops to split");
  const moved=Math.floor(a.men/2),lev=Math.floor(a.levy/2),maa=Math.max(0,moved-lev);
  a.men-=moved;a.levy-=lev;a.menAtArms=Math.max(0,a.menAtArms-maa);
  const n={id:"a_"+Date.now().toString(36),name:"Field Host "+(S.armies.length+1),men:moved,levy:lev,menAtArms:maa,morale:a.morale,supply:a.supply,fatigue:a.fatigue,commander:S.council.marshal,location:a.location,embarked:a.embarked,raised:true};
  S.armies.push(n);S.selectedArmyId=n.id;log(a.name+" was split into two field armies.","war");toast("Army split");render();saveSilent();
}
function action(a){
  const c=county(S.selectedCounty),h=char(c?.holder);
  if(a==="claim_duchy")return fabricateDuchyClaim();
  if(a==="war"||a==="war_county")return declareWar("conquest_county");
  if(a==="war_duchy")return declareWar("claim_duchy");
  if(a==="contract"){showContractModal(h?.id);return}
  if(a==="holdings"){showBuildingsModal(c?.id);return}
  if(a==="decision"){decision(S.pendingDecision);return}
  if(a==="develop"){if(S.gold<25)return toast("Not enough gold");S.gold-=25;c.dev++;c.tax+=.35;c.control=clamp(c.control+2,0,100);log(c.name+" developed to level "+c.dev)}
  else if(a==="levy"){if(recruitTroops(Math.max(100,Math.min(170,Math.floor(totalLevySource()*.11))),true))log("The marshal raised additional levies from "+c.name,"war")}
  else if(a==="recruit"){recruitAction();return}
  else if(a==="extax"){S.gold+=12;S.stress=clamp(S.stress+5,0,100);log("Extraordinary tax was imposed in "+c.name,"court")}
  else if(a==="grant"){showGrantModal();return}
  else if(a==="revoke"){revokeTitle()}
  else if(a==="claim"){if(S.claims.includes(c.id))return toast("You already have a claim");if(S.prestige<35)return toast("Need 35 prestige");S.prestige-=35;S.claims.push(c.id);S.claimCounty=c.id;log("A fabricated claim on "+c.name+" is now recognized.","court")}
  else if(a==="sway"){if(!h)return;S.relations[h.id]=clamp(opinion(h.id)+20,-100,100);S.prestige=Math.max(0,S.prestige-10);log("Your diplomat began swaying "+h.name)}
  else if(a==="gift"){if(S.gold<15)return toast("Not enough gold");S.gold-=15;S.relations[h.id]=clamp(opinion(h.id)+25,-100,100);log("A costly gift improved relations with "+h.name)}
  else if(a==="alliance"){offerAlliance(h?.id);return}
  else if(a==="marry"){arrangeMarriage(h.id);return}
  else if(a==="invite"){if(!h)return;S.relations[h.id]=clamp(opinion(h.id)+10,-100,100);log(h.name+" was invited to court")}
  else if(a==="inspect"){toast((h?.name||"The holder")+" fields roughly "+(c.levy+c.garrison)+" defenders in "+c.name);return}
  else if(a==="law_succession_equal"){
    if(S.succession==="equal")return toast("Already using equal inheritance");if(S.prestige<150)return toast("Need 150 prestige");
    S.prestige-=150;S.succession="equal";S.legitimacy=clamp(S.legitimacy-2,0,100);rebuildHeir();log("The crown adopted equal inheritance.","dynasty");toast("Succession law changed")
  }else if(a==="law_authority_medium"){
    if(S.crownAuthority==="medium")return toast("Already at Medium Authority");if(S.prestige<180)return toast("Need 180 prestige");
    S.prestige-=180;S.crownAuthority="medium";S.legitimacy=clamp(S.legitimacy-4,0,100);log("The crown raised authority to Medium.","court");toast("Authority raised")
  }
  render();saveSilent();
}
function aiWarPower(id){const v=char(id);return v?vassalPower(id)+Math.floor((v.martial||5)*70)+250:300}
function aiTick(){
  WORLD.characters && Object.values(WORLD.characters).filter(v=>v.alive&&v.id!==S.rulerId).forEach(v=>{
    if(v.age>=65&&Math.random()<.012)characterDeath(v,"old age");
    if(v.spouse&&v.id<v.spouse&&v.age<50&&char(v.spouse)?.age<50&&Math.random()<.008)newChild(v.id,v.spouse);
  });
  WORLD.counties.filter(c=>c.status==="rival").forEach(c=>{const v=char(c.holder);if(v&&Math.random()<.12){c.levy+=18;c.garrison+=6;c.control=clamp(c.control+1,0,100)}});
  notableRulers().forEach(v=>{
    const agenda=aiAgendaFor(v);
    if(agenda==="scheme"&&Math.random()<.025)log(v.name+" is working through spies and courtiers.","court");
    if(agenda==="diplomacy"&&Math.random()<.035){
      const candidate=notableRulers().find(x=>x.id!==v.id&&!isAllied(v.id,x.id)&&opinionForAI(v.id,x.id)>=20);
      if(candidate){S.alliances.push({a:v.id,b:candidate.id,year:S.year});log(v.name+" entered a diplomatic pact with "+candidate.name+".","court")}
    }
    const tickKey=S.year*12+S.month;
    if((S.month===1||S.month===7)&&S.aiLastWarTick!==tickKey&&agenda==="expand"&&v.martial>=8){
      S.aiLastWarTick=tickKey;
      const owned=WORLD.counties.filter(c=>c.holder===v.id);
      const target=owned.flatMap(c=>(WORLD.adjacency[c.id]||[]).map(id=>county(id))).find(c=>c&&c.holder===S.rulerId&&!c.occupiedBy&&!countyWarBusy(c.id));
      if(target&&!S.wars.some(w=>w.kind!=="revolt"&&w.defender===S.rulerId)){
        const power=aiWarPower(v.id),def=(target.garrison+target.levy*.6)+playerPower()*.15;
        if(power>def*1.05&&opinionForAI(v.id,S.rulerId)<20&&Math.random()<.45){
          S.wars.push({id:"w_ai_"+Date.now().toString(36),kind:"external",attacker:v.id,defender:S.rulerId,name:"War for "+target.name,target:target.id,targetDuchy:null,goal:"conquest_county",score:0,months:0,siege:0,enemy:power,battles:0,fronts:{[target.id]:{siege:0}}});
          log(v.name+" launched an expansion war for "+target.name+".","war");toast("Foreign war declared");
        }
      }
    }
  });
  directVassalCharacters().forEach(v=>{if(opinion(v.id)<0&&Math.random()<.08)log(v.name+" is gathering supporters for a faction.","court")});
}
function monthlyArmyTick(){
  S.armies.forEach(a=>{
    if(!a.raised)return;const c=county(a.location),friendly=c&&(c.status==="yours"||c.occupiedBy===S.rulerId);
    const demand=Math.max(25,a.men/(Math.max(1,(c?.supply||70))));
    if(friendly)a.supply=clamp(a.supply+8,0,100);else a.supply=clamp(a.supply-demand*.6,0,100);
    a.fatigue=clamp(a.fatigue+(friendly?-2:.8),0,100);
    a.morale=clamp(a.morale+(a.supply>50?-1.5:-3.5)+(a.fatigue>50?-2:0),0,100);
  });
}
function renderWar(){
  if(!S.wars.length){$("warCard").innerHTML="<div class='empty'>No active war.</div>";return}
  $("warCard").innerHTML=S.wars.map(w=>{
    if(w.kind==="revolt")return "<div class='war-card'><div class='war-title'><div><span class='eyebrow'>INTERNAL WAR</span><h3>"+esc(w.name)+"</h3><span class='muted'>"+esc(county(w.target)?.name||"Unknown")+" · revolt</span></div><b>"+Math.round(clamp(w.score,-100,100))+"%</b></div><div class='bar'><i style='width:"+((clamp(w.score,-100,100)+100)/2)+"%'></i></div><div class='war-grid'><div><span>Enemy</span><b>"+Math.floor(w.enemy||0)+"</b></div><div><span>Duration</span><b>"+w.months+" mo</b></div><div><span>Siege</span><b>"+Math.round(w.siege||0)+"%</b></div></div><div class='action-grid'><button class='action-btn' data-war='"+w.id+"' data-war-action='battle'><b>Force Battle</b><span>Use selected army on rebel front</span></button><button class='action-btn' data-war='"+w.id+"' data-war-action='peace'><b>End Revolt</b><span>Offer terms / resolve</span></button></div></div>";
    const side=w.attacker===S.rulerId?"OFFENSIVE":"DEFENSIVE",ps=Math.round(clamp(warPlayerScore(w),-100,100)),obj=warObjectives(w),ready=warGoalReady(w,warOccupier(w));
    const fronts=obj.map(c=>{const p=w.fronts[c.id]?.siege||0;const occupied=c.occupiedBy;return "<div class='war-front'><b>"+esc(c.name)+"</b><span>"+(occupied?(occupied===S.rulerId?"CROWN OCCUPATION":"ENEMY OCCUPATION"):("Siege "+Math.round(p)+"%"))+"</span></div>"}).join("");
    return "<div class='war-card'><div class='war-title'><div><span class='eyebrow'>"+side+" WAR · "+esc(w.goal==="claim_duchy"?"DUCHY CLAIM":"COUNTY CONQUEST")+"</span><h3>"+esc(w.name)+"</h3><span class='muted'>Target: "+esc(w.goal==="claim_duchy"?duchy(w.targetDuchy)?.name||"Duchy":county(w.target)?.name||"County")+"</span></div><b>"+ps+"%</b></div><div class='bar'><i style='width:"+((ps+100)/2)+"%'></i></div><div class='war-grid'><div><span>Your armies</span><b>"+Math.floor(S.armies.reduce((n,a)=>n+a.men,0))+"</b></div><div><span>Enemy field</span><b>"+Math.floor(w.enemy||0)+"</b></div><div><span>Duration</span><b>"+w.months+" mo</b></div><div><span>Battles</span><b>"+(w.battles||0)+"</b></div><div><span>Goal</span><b>"+(ready?"READY":"IN PROGRESS")+"</b></div><div><span>Fronts</span><b>"+obj.length+"</b></div></div><div class='war-fronts'>"+fronts+"</div><div class='action-grid'><button class='action-btn' data-war='"+w.id+"' data-war-action='battle'><b>Force Battle</b><span>Selected army must be on a front</span></button><button class='action-btn' data-war='"+w.id+"' data-war-action='peace'><b>"+(ps>=60&&ready?"Enforce Demands":ps<=-60?"Surrender / End":"Seek Peace")+"</b><span>"+(ready?"War goal can be enforced":"Continue campaigning")+"</span></button></div></div>";
  }).join("");
  document.querySelectorAll("[data-war-action]").forEach(b=>b.onclick=()=>warAction(b.dataset.war,b.dataset.warAction));
}
function render(){
  normalizeWarState();
  renderTop();renderMap();renderTitles();renderSelected();renderRuler();renderRealm();renderCourt();renderDynasty();renderFactions();renderWar();renderArmy();renderArmyOrders();renderDiplomacy();renderDecisions();renderEvents();
}
function monthlyTick(){
  if(S.paused)return;
  S.day+=5;if(S.day>30){S.day=5;S.month++;if(S.month>12){S.month=1;S.year++;Object.values(WORLD.characters).forEach(c=>{if(c.alive)c.age+=1});yearTick()}}
  S.gold+=Math.max(0,realmTax()*.10);S.levies=Math.min(S.troopCap,S.levies+Math.floor(totalLevySource()*.018));normalizeEconomy();
  normalizeWarState();monthlyArmyTick();processCouncilTasks();processEducation();processPlots();familyTick();aiTick();if(!S.eventChain&&Math.random()<.018)triggerCourtEvent();
  S.wars.slice().forEach(w=>monthlyWar(w));
  updateFactions();S.factions.forEach(f=>{if(f.ultimatum>0&&f.strength>=80){f.ultimatum--;if(f.ultimatum===0){createRevolt(f);S.factions=S.factions.filter(x=>x.id!==f.id);log("The faction ultimatum expired. War has begun.","war")}}});
  tickDecisions();rebuildHeir();saveSilent();render();
}
normalizeWarState();render();saveSilent();
