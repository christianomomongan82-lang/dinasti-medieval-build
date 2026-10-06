// Dynasty Realms v0.35 - Warfare & Logistics Overhaul
const SAVE35="dynasty_realms_save_v35";
const baseMonthlyTick35=monthlyTick,baseRenderWar35=renderWar,baseRenderRealm35=renderRealm,baseRenderSelected35=renderSelected,baseSync35=syncWorldState,baseReset35=reset,baseMonthlyArmy35=monthlyArmyTick,baseBattle35=battleWar,baseMonthlyWar35=monthlyWar,basePlayerPower35=playerPower;
const DOCTRINE35={
 levy:{name:"Levies First",power:.96,upkeep:.78,morale:1,attr:.92,desc:"Cheap mass armies, weaker elite punch."},
 balanced:{name:"Balanced Host",power:1,upkeep:1,morale:1,attr:1,desc:"Reliable all-round field doctrine."},
 combined:{name:"Combined Arms",power:1.1,upkeep:1.16,morale:1.04,attr:1.02,desc:"Expensive but strong with trained regiments."},
 defensive:{name:"Defensive Host",power:.98,upkeep:.9,morale:1.12,attr:.76,desc:"Best for defending forts and mountain borders."},
 cavalry:{name:"Cavalry Focus",power:1.14,upkeep:1.22,morale:1.03,attr:1.05,desc:"High shock power with heavy upkeep."}
};
function ensure35(){S.version=35;S.militaryDoctrine35=S.militaryDoctrine35||"balanced";S.logistics35=S.logistics35||{};S.armyHistory35=Array.isArray(S.armyHistory35)?S.armyHistory35:[];S.supplyDepots35=S.supplyDepots35||{};WORLD.counties.forEach(c=>{c.supplyHub=Number(c.supplyHub)||0;c.frontierRisk=Number(c.frontierRisk)||0})}
function doctrine35(){return DOCTRINE35[S.militaryDoctrine35]||DOCTRINE35.balanced}
function setDoctrine35(k){if(!DOCTRINE35[k])return;if(S.wars.some(w=>warHasPlayer(w)))return toast("Change doctrine after the war");S.militaryDoctrine35=k;S.prestige=Math.max(0,S.prestige-12);log("The army adopted the "+DOCTRINE35[k].name+" doctrine.","war");toast("Military doctrine changed");render();saveSilent()}
function countyLogistics35(c){
 let hub=1;
 if((c.infrastructure||0)>0)hub+=c.infrastructure*.08;
 if((c.buildings?.walls||0)>=2)hub+=.08;
 if(c.buildings?.market)hub+=c.buildings.market*.03;
 if(c.terrain==="coast")hub+=.12;
 return hub;
}
function depot35(id){
 const c=county(id);if(!c||!isPlayerVassal(c.holder))return toast("Outside your realm");if(S.supplyDepots35[id])return toast("Supply depot already built");if(S.gold<45)return toast("Need 45 gold");S.gold-=45;S.supplyDepots35[id]=1;c.supplyHub=2;c.control=clamp(c.control+4,0,100);c.prosperity=clamp(realmProsperity(c)+5,0,100);S.prestige+=5;chronicle30("A military supply depot was established at "+c.name+".","war");toast("Supply depot established");render();saveSilent()}
function armySupplyFactor35(a){
 const c=county(a.location),base=c?countyLogistics35(c):.75,depot=c&&S.supplyDepots35[c.id]?1.25:1,season=S.season25==="Winter"?.82:S.season25==="Summer"?1.05:1;
 return clamp(base*depot*season-(a.fatigue||0)*.003,0.35,1.5)
}
function armyMaintenance35(){
 const d=doctrine35();let due=0;
 S.armies.forEach(a=>{if(!a.raised)return;due+=Math.max(.15,a.men*.00055*d.upkeep)});
 if(due>0){
   if(S.gold>=due)S.gold-=due;
   else{const deficit=due-Math.max(0,S.gold);S.gold=0;S.armies.forEach(a=>{if(a.raised){a.morale=clamp(a.morale-deficit*3,0,100);a.fatigue=clamp(a.fatigue+deficit*2,0,100);a.supply=clamp(a.supply-deficit*5,0,100)}});S.warExhaustion20[S.rulerId]=clamp((S.warExhaustion20[S.rulerId]||0)+deficit*.8,0,100)}
 }
}
function monthlyArmyTick(){
 const d=doctrine35();baseMonthlyArmy35();S.armies.forEach(a=>{if(!a.raised)return;const f=armySupplyFactor35(a);a.supply=clamp(a.supply+(f>.9?2.2:-2.8),0,100);a.fatigue=clamp(a.fatigue+(f<.7?2.6:.2),0,100);a.morale=clamp(a.morale+(f>.95?1.1:0)+(d.morale-1)*3-(a.fatigue>60?1.8:0),0,100);a.logistics=f;});armyMaintenance35()}
function playerPower(){
 const d=doctrine35(),ex=1-(S.warExhaustion20?.[S.rulerId]||0)*.0025;
 return basePlayerPower35()*d.power*clamp(ex,.72,1)+Object.values(S.alliedForces25||{}).reduce((n,x)=>n+(x?.side===S.rulerId?x.power:0),0);
}
function battleWar(w){
 const a=armySelected();const pre=a?.men||0;const d=doctrine35();const c=a&&county(a.location);if(c&&d===DOCTRINE35.defensive&&w&&w.defender===S.rulerId){w.score+=3}
 baseBattle35(w);
 if(a&&pre>0){const losses=pre-a.men;if(d.attr<1){a.men=Math.min(pre,a.men+Math.floor(losses*(1-d.attr)*.55));a.levy=Math.min(a.men, a.levy+Math.floor(losses*(1-d.attr)*.28))}}
 if(w&&a){a.supply=clamp(a.supply-(d.upkeep*1.2),0,100);S.armyHistory35.unshift({year:S.year,month:S.month,army:a.id,war:w.id,men:a.men,score:w.score});S.armyHistory35=S.armyHistory35.slice(0,25)}
}
function monthlyWar(w){
 const before=w?.score||0;const out=baseMonthlyWar35(w);if(w&&w.kind!=="revolt"){const c=county(w.target),a=armySelected();if(a&&c&&a.location===c.id){const logistics=armySupplyFactor35(a);w.score+=.8*(logistics-.8);if(c.terrain==="mountains"&&doctrine35()===DOCTRINE35.defensive)w.score+=.45}if((S.warExhaustion20?.[S.rulerId]||0)>65&&w.attacker===S.rulerId)w.score-=.65;if(w.score<before-4&&w.attacker===S.rulerId)S.stress=clamp(S.stress+.4,0,100)}return out}
function renderWar(){baseRenderWar35();let old=$("warLogistics35");if(old)old.remove();old=document.createElement("div");old.id="warLogistics35";const a=armySelected(),d=doctrine35();old.innerHTML="<div class='section-title'>Military doctrine</div><div class='identity-detail'><b>"+esc(d.name)+"</b><br>"+esc(d.desc)+"<br><small>Power "+d.power.toFixed(2)+" · upkeep "+d.upkeep.toFixed(2)+" · attrition "+d.attr.toFixed(2)+"</small></div><div class='policy-grid20'>"+Object.keys(DOCTRINE35).map(k=>"<button data-doctrine35='"+k+"'>"+DOCTRINE35[k].name+"</button>").join("")+"</div><div class='section-title'>Logistics</div><div class='renown-row15'><b>"+(a?Math.round(a.supply):0)+"% supply</b><span>"+(a?esc(county(a.location)?.name||"Unknown"):"No army")+" · exhaustion "+Math.round(S.warExhaustion20?.[S.rulerId]||0)+"%</span></div>"+(a&&isPlayerVassal(county(a.location)?.holder)?"<button class='order-btn' data-depot35='"+a.location+"'><b>Build Supply Depot</b><span>-45 gold · strengthens local military logistics</span></button>":"");$("tab-war")?.appendChild(old);old.querySelectorAll("[data-doctrine35]").forEach(b=>b.onclick=()=>setDoctrine35(b.dataset.doctrine35));old.querySelectorAll("[data-depot35]").forEach(b=>b.onclick=()=>depot35(b.dataset.depot35))}
function renderRealm(){baseRenderRealm35();let old=$("logisticsRealm35");if(old)old.remove();old=document.createElement("div");old.id="logisticsRealm35";const hubs=WORLD.counties.filter(c=>isPlayerVassal(c.holder)&&S.supplyDepots35[c.id]).map(c=>c.name).join(", ")||"None";old.innerHTML="<div class='section-title'>Strategic logistics</div><div class='renown-row15'><b>"+hubs+"</b><span>Supply depots protecting the realm</span></div>";$("tab-realm")?.appendChild(old)}
function renderSelected(){baseRenderSelected35()}
function renderDiplomacy(){baseRenderDiplomacy35()}
function syncWorldState(){baseSync35();ensure35();WORLD.counties.forEach(c=>{if(S.countyState[c.id])S.countyState[c.id].supplyHub=c.supplyHub||0});S.version=35}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE35,JSON.stringify(S))}catch(e){}}
function reset(){["dynasty_realms_save_v35","dynasty_realms_save_v30","dynasty_realms_save_v25","dynasty_realms_save_v21","dynasty_realms_save_v20","dynasty_realms_save_v15","dynasty_realms_save_v14"].forEach(k=>localStorage.removeItem(k));location.reload()}
function monthlyTick(){const paused=S.paused;baseMonthlyTick35();if(paused)return;ensure35();render();saveSilent()}
function load35(){try{const raw=localStorage.getItem(SAVE35)||localStorage.getItem("dynasty_realms_save_v30")||localStorage.getItem("dynasty_realms_save_v25")||localStorage.getItem("dynasty_realms_save_v21");if(raw){Object.assign(S,JSON.parse(raw),{version:35});applyWorldState()}}catch(e){}ensure35();render();saveSilent()}
load35();