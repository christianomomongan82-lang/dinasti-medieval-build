// Dynasty Realms v0.25 - Living Dynasties & Global Systems
const SAVE25="dynasty_realms_save_v25";
const baseMonthlyTick25=monthlyTick,baseRenderRealm25=renderRealm,baseRenderDynasty25=renderDynasty,baseRenderDiplomacy25=renderDiplomacy,baseRenderWar25=renderWar,baseRenderSelected25=renderSelected,baseSync25=syncWorldState,baseReset25=reset,baseOpinion25=opinion,baseDiplomacyScore25=diplomacyScore,basePlayerPower25=playerPower,baseRealmTax25=realmTax,baseIdentity25=countyIdentityPressure14,baseMonthlyWar25=monthlyWar,baseBattleWar25=battleWar,baseEndWar25=endWar;
const LEGACY25={martial:["Warrior Heritage",120,"army"],administration:["Royal Administration",120,"tax"],diplomacy:["Diplomatic House",120,"diplo"],scholar:["Learned House",120,"learn"],faith:["Devout House",120,"faith"],intrigue:["Shadow House",120,"intrigue"]};
const RESOURCE25={plains:["Grain",.16,.03],forest:["Timber",.12,.02],hills:["Stone",.13,.025],mountains:["Iron",.24,.035],coast:["Port",.3,.05],marsh:["Herbs",.18,.025]};
function ensure25(){
 S.version=25;S.houseLegacy25=S.houseLegacy25||{};S.alliedForces25=S.alliedForces25||{};S.aiMarriages25=Array.isArray(S.aiMarriages25)?S.aiMarriages25:[];S.aiWars25=S.aiWars25||{};S.season25=S.season25||"Autumn";S.climate25=S.climate25||{};S.royalResources25=S.royalResources25||{};S.populationEvents25=Array.isArray(S.populationEvents25)?S.populationEvents25:[];S.dynasticClaims25=S.dynasticClaims25||{};S.houseMissions25=S.houseMissions25||{};S.globalThreat25=S.globalThreat25||0;
 Object.values(WORLD.characters||{}).forEach(c=>{if(c.alive){c.influence=Number.isFinite(c.influence)?c.influence:Math.max(10,(c.diplomacy||5)*5+(c.stewardship||5)*2);c.ambition=Number.isFinite(c.ambition)?c.ambition:((c.traits||[]).includes("Ambitious")?72:35);c.fearOfCrown=Number.isFinite(c.fearOfCrown)?c.fearOfCrown:0}});
 WORLD.counties.forEach(c=>{if(!c.resource){const d=RESOURCE25[c.terrain]||RESOURCE25.plains;c.resource=d[0];c.resourceValue=d[1];c.resourceTax=d[2]}});
}
function dynastyHasLegacy25(k){return !!S.houseLegacy25[k]}
function buyLegacy25(k){
 const d=LEGACY25[k];if(!d)return;if(dynastyHasLegacy25(k))return toast("Legacy already unlocked");if((S.dynastyRenown||0)<d[1])return toast("Need "+d[1]+" dynasty renown");
 S.dynastyRenown-=d[1];S.houseLegacy25[k]={unlocked:S.year,level:1};log("House "+ruler().dynasty+" unlocked the "+d[0]+".","dynasty");toast("House legacy unlocked");render();saveSilent();
}
function legacyPower25(){return dynastyHasLegacy25("martial")?1.08:1}
function playerPower(){return basePlayerPower25()*legacyPower25()+Object.values(S.alliedForces25||{}).reduce((n,x)=>n+(x?.side===S.rulerId?x.power:0),0)}
function realmResourceIncome25(){
 return ownedCounties().reduce((n,c)=>n+(c.resourceValue||0)*(0.5+realmProsperity(c)/150),0);
}
function realmTax(){return baseRealmTax25()*(dynastyHasLegacy25("administration")?1.08:1)+realmResourceIncome25()}
function diplomacyScore(id){const n=baseDiplomacyScore25(id);return clamp(n+(dynastyHasLegacy25("diplomacy")?12:0),-100,100)}
function countyIdentityPressure14(c){const x=baseIdentity25(c);let n=x;if(dynastyHasLegacy25("faith")&&c.faith===ruler().faith)n-=8;if(dynastyHasLegacy25("diplomacy")&&c.culture===ruler().culture)n-=6;return clamp(n,0,100)}
function season25(){
 if(S.month<=2)return"Winter";if(S.month<=5)return"Spring";if(S.month<=8)return"Summer";if(S.month<=11)return"Autumn";return"Winter";
}
function applySeason25(){
 S.season25=season25();const mod={Winter:-.22,Spring:.18,Summer:.28,Autumn:.05}[S.season25];
 WORLD.counties.forEach(c=>{
   c.food=clamp(c.food+mod*(c.terrain==="plains"?1.35:.75),0,150);
   if(c.occupiedBy)c.food=clamp(c.food-.4,0,150);
 });
 S.climate25[S.season25]=(S.climate25[S.season25]||0)+1;
}
function seasonalArmy25(){
 S.armies.forEach(a=>{if(!a.raised)return;a.fatigue=clamp(a.fatigue+(S.season25==="Winter"?2.2:.3),0,100);a.supply=clamp(a.supply+(S.season25==="Summer"?1:-1.2),0,100)});
}
function populationCrisis25(){
 WORLD.counties.forEach(c=>{
   if(c.status!=="yours")return;
   const density=c.population/Math.max(1,c.dev*15),price=c.localPrice||1;
   if(c.food<20&&Math.random()<.08){c.population=Math.max(20,c.population*.994);c.prosperity=clamp(realmProsperity(c)-1.2,0,100);c.control=clamp(c.control-1,0,100);S.populationEvents25.unshift({year:S.year,month:S.month,county:c.id,type:"famine"});log("Food shortages are driving people away from "+c.name+".","realm")}
   if(density>1.25&&price>1.7&&Math.random()<.035){c.population=Math.max(20,c.population*.998);c.localPrice=clamp(price-.05,.7,3);c.migration=(c.migration||0)+1}
   if(c.food>65&&realmProsperity(c)>70&&Math.random()<.035)c.population=clamp(c.population*1.002,20,10000);
   if(c.population>180&&realmProsperity(c)<30&&Math.random()<.006){c.control=clamp(c.control-2,0,100);log("Overcrowding and poor living conditions destabilized "+c.name+".","realm")}
 });
 S.populationEvents25=S.populationEvents25.slice(0,20);
}
function epidemic25(){
 const dense=WORLD.counties.filter(c=>isPlayerVassal(c.holder)&&c.population>140);
 if(!dense.length||Math.random()>.012)return;
 const c=dense[Math.floor(Math.random()*dense.length)],severity=.02+Math.random()*.025;c.population=Math.max(20,c.population*(1-severity));c.prosperity=clamp(realmProsperity(c)-8,0,100);c.control=clamp(c.control-4,0,100);
 WORLD.characters&&Object.values(WORLD.characters).forEach(v=>{if(v.alive&&v.id!==S.rulerId&&Math.random()<.015)v.health=clamp(v.health-8,0,100)});
 log("A sickness spread through "+c.name+", disrupting trade and population.","realm");S.globalThreat25=clamp(S.globalThreat25+4,0,100);
}
function marriagePool25(){
 const kings=(WORLD.kingdoms||[]).map(k=>char(k.holder)).filter(v=>v?.alive);
 const dukes=WORLD.duchies.map(d=>char(titleHolder(d.id))).filter(v=>v?.alive);
 const counts=WORLD.counties.map(c=>char(c.holder)).filter(v=>v?.alive);
 return [...new Map([...kings,...dukes,...counts].map(v=>[v.id,v])).values()];
}
function marriageScore25(a,b){
 let s=diplomacyScore25(a.id,b.id);
 if(a.culture===b.culture)s+=12;if(a.faith===b.faith)s+=8;
 if((a.traits||[]).includes("Ambitious")&&(b.traits||[]).includes("Ambitious"))s-=15;
 if(a.dynasty===b.dynasty)s-=50;
 if(Math.abs(a.age-b.age)>15)s-=8;
 return s;
}
function diplomacyScore25(a,b){if(!a||!b)return-100;let n=relationship25(a.id,b.id);if(isAllied(a.id,b.id))n+=35;return clamp(n,-100,100)}
function relationship25(a,b){return baseOpinion25(a===S.rulerId?b:b)+relationshipRaw25(a,b)}
function relationshipRaw25(a,b){if(!a||!b||a===b)return 100;const k=[a,b].sort().join("|");const x=S.relationships21?.[k];return Number.isFinite(x)?x:0}
function makeAIMarriage25(a,b){
 if(!validMarriage(a,b)||marriageScore25(a,b)<28)return false;
 a.spouse=b.id;b.spouse=a.id;S.marriages.push({a:a.id,b:b.id,year:S.year,ai:true});S.aiMarriages25.push({a:a.id,b:b.id,year:S.year});
 if(!isAllied(a.id,b.id))S.alliances.push({a:a.id,b:b.id,year:S.year,dynastic:true});
 a.opinion=(a.opinion||0)+4;b.opinion=(b.opinion||0)+4;log(a.name+" married "+b.name+", linking two houses.","dynasty");return true;
}
function createAIChild25(a,b){
 const id="c_dyn_"+Date.now().toString(36)+Math.floor(Math.random()*999);
 const avg=k=>Math.max(2,Math.round(((a[k]||5)+(b[k]||5))/2+(Math.random()*3-1.5)));
 const child={id,name:pick(["Alaric","Edwin","Lyanna","Mira","Owen","Selene","Ronan","Elena"])+" of "+a.dynasty.replace("House ",""),age:0,sex:Math.random()<.5?"m":"f",dynasty:a.dynasty,title:"Child of "+a.name,martial:avg("martial"),diplomacy:avg("diplomacy"),stewardship:avg("stewardship"),intrigue:avg("intrigue"),learning:avg("learning"),traits:[pick(["Calm","Brave","Curious","Diligent","Ambitious"])],opinion:10,alive:true,spouse:null,father:a.id,mother:b.id,children:[],health:100,fertility:.65+Math.random()*.2,culture:a.culture,faith:a.faith};
 WORLD.characters[id]=child;a.children=a.children||[];b.children=b.children||[];a.children.push(id);b.children.push(id);S.customCharacters[id]=child;return child;
}
function aiDynastyTick25(){
 const pool=marriagePool25().filter(v=>v.age>=16&&v.age<60);
 for(let i=0;i<pool.length;i++){const a=pool[i];if(a.spouse)continue;const opts=pool.filter(b=>b.id!==a.id&&!b.spouse&&validMarriage(a,b)).sort((x,y)=>marriageScore25(a,y)-marriageScore25(a,x));if(opts[0]&&Math.random()<.075)makeAIMarriage25(a,opts[0])}
 S.aiMarriages25.slice().forEach(m=>{const a=char(m.a),b=char(m.b);if(a?.alive&&b?.alive&&a.spouse===b.id&&a.age<48&&b.age<48&&Math.random()<.045)createAIChild25(a,b)});
}
function alliedCandidates25(id){
 const ids=new Set();
 (S.alliances||[]).forEach(a=>{if(a.a===id)ids.add(a.b);if(a.b===id)ids.add(a.a)});
 return [...ids].map(char).filter(v=>v?.alive&&v.id!==S.rulerId||v?.id===S.rulerId);
}
function callAllies25(w){
 if(!w||S.alliedForces25[w.id])return;
 const side=w.attacker===S.rulerId?S.rulerId:w.defender===S.rulerId?S.rulerId:null;
 let support=0,allies=[];
 [w.attacker,w.defender].forEach(id=>{
   if(!id)return;
   alliedCandidates25(id).forEach(v=>{
     if(v.id===w.attacker||v.id===w.defender)return;
     const accept=opinionForWar25(v.id,id)>28;
     if(!accept)return;
     const power=Math.floor((typeof realmPower15==="function"?realmPower15(v.id):vassalPower(v.id))*0.22);
     if(power<=0)return;
     if(!allies.some(x=>x.id===v.id)){allies.push({id:v.id,name:v.name,power,side:id});support+=side===id?power:0}
     if(id===w.defender)w.enemy=(w.enemy||0)+power;
   });
 });
 S.alliedForces25[w.id]={support,allies,side, power:support};
}
function opinionForWar25(a,b){const v=char(a);if(!v)return-100;let n=baseOpinion25(a);if(a!==S.rulerId&&b!==S.rulerId)n+=relationshipRaw25(a,b)*.3;if(v.dynasty===char(b)?.dynasty)n+=10;return n}
function battleWar(w){
 callAllies25(w);S.combatSupport25=(S.alliedForces25[w?.id]?.side===S.rulerId)?(S.alliedForces25[w.id].power||0):0;
 const out=baseBattleWar25(w);S.combatSupport25=0;return out;
}
function monthlyWar(w){
 callAllies25(w);const out=baseMonthlyWar25(w);
 if(w&&(w.attacker===S.rulerId||w.defender===S.rulerId)&&S.alliedForces25[w.id]?.power)w.score+=.35;
 return out;
}
function endWar(w,result){
 const out=baseEndWar25(w,result);if(w&&S.alliedForces25[w.id]){const support=S.alliedForces25[w.id].power||0;if(result==="victory")S.dynastyRenown+=Math.floor(support/250);delete S.alliedForces25[w.id]}return out;
}
function claimTitle25(titleId,reason="dynastic"){
 const t=title(titleId);if(!t||t.holder===S.rulerId)return toast("Invalid title");
 S.dynasticClaims25[titleId]={claimant:S.rulerId,reason,year:S.year,strength:dynastyHasLegacy25("diplomacy")?80:60};S.dynastyRenown=Math.max(0,S.dynastyRenown-60);log("House "+ruler().dynasty+" established a dynastic claim on "+t.name+".","dynasty");toast("Dynastic claim created");render();saveSilent()
}
function seasonalLegitimacy25(){if(S.crownAuthority==="high")S.legitimacy=clamp(S.legitimacy-(S.realmPolicy20?.tolerance==="low"?.03:.01),0,100);if(S.season25==="Spring"&&S.legitimacy<90)S.legitimacy=clamp(S.legitimacy+.12,0,100)}
function applyLegacyEffects25(){if(dynastyHasLegacy25("faith"))S.piety+=.3;if(dynastyHasLegacy25("scholar"))S.prestige+=.12;if(dynastyHasLegacy25("intrigue")&&Math.random()<.015){const v=directVassalCharacters().sort((a,b)=>opinion(a.id)-opinion(b.id))[0];if(v)S.favors21[v.id]=clamp((S.favors21[v.id]||0)+1,0,3)}}
function renderLegacy25(){
 let old=$("legacy25");if(old)old.remove();old=document.createElement("div");old.id="legacy25";
 const rows=Object.entries(LEGACY25).map(([k,d])=>"<button class='order-btn' data-legacy25='"+k+"'><b>"+d[0]+"</b><span>"+(dynastyHasLegacy25(k)?"Unlocked":"Unlock · "+d[1]+" renown")+"</span></button>").join("");
 old.innerHTML="<div class='section-title'>House legacy</div>"+rows;$("tab-dynasty")?.appendChild(old);old.querySelectorAll("[data-legacy25]").forEach(b=>b.onclick=()=>buyLegacy25(b.dataset.legacy25));
}
function renderLiving25(){
 let old=$("living25");if(old)old.remove();old=document.createElement("div");old.id="living25";
 const own=ownedCounties(),pop=own.reduce((n,c)=>n+c.population,0),resources=[...new Set(own.map(c=>c.resource).filter(Boolean))].join(", ")||"None";
 const coal=Object.values(S.alliedForces25||{}).reduce((n,w)=>n+(w.power||0),0);
 old.innerHTML="<div class='section-title'>Living world</div><div class='grand-grid20'><div><span>Season</span><b>"+S.season25+"</b></div><div><span>Population</span><b>"+Math.floor(pop)+"k</b></div><div><span>Resources</span><b>"+esc(resources)+"</b></div><div><span>Trade/resource</span><b>"+(realmResourceIncome25()).toFixed(1)+"</b></div><div><span>Allied support</span><b>"+Math.floor(coal)+"</b></div><div><span>Global pressure</span><b>"+Math.round(S.globalThreat25)+"%</b></div></div>";$("tab-realm")?.appendChild(old);
}
function renderDiplomacy(){baseRenderDiplomacy25();let old=$("dynasticDiplomacy25");if(old)old.remove();old=document.createElement("div");old.id="dynasticDiplomacy25";const marriages=S.aiMarriages25.slice(-8).reverse().map(m=>"<div class='treaty-row15'><span><b>"+esc(char(m.a)?.name||"Unknown")+" × "+esc(char(m.b)?.name||"Unknown")+"</b><small>Dynastic pact · "+m.year+"</small></span></div>").join("");old.innerHTML="<div class='section-title'>Recent dynastic alliances</div>"+(marriages||"<div class='empty'>No foreign dynastic marriages.</div>");$("tab-diplomacy")?.appendChild(old)}
function renderWar(){baseRenderWar25();let old=$("coalition25");if(old)old.remove();old=document.createElement("div");old.id="coalition25";const rows=Object.entries(S.alliedForces25||{}).map(([id,w])=>"<div class='treaty-row15'><span><b>"+esc(S.wars.find(x=>x.id===id)?.name||"War")+"</b><small>Allied field support "+Math.floor(w.power||0)+"</small></span></div>").join("");old.innerHTML="<div class='section-title'>War coalitions</div>"+(rows||"<div class='empty'>No allied forces committed.</div>");$("tab-war")?.appendChild(old)}
function renderDynasty(){baseRenderDynasty25();renderLegacy25()}
function renderRealm(){baseRenderRealm25();renderLiving25()}
function renderSelected(){baseRenderSelected25()}
function syncWorldState(){baseSync25();ensure25();WORLD.counties.forEach(c=>{if(S.countyState[c.id])Object.assign(S.countyState[c.id],{resource:c.resource,population:c.population,food:c.food,localPrice:c.localPrice,migration:c.migration||0})});S.version=25}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE25,JSON.stringify(S))}catch(e){}}
function reset(){["dynasty_realms_save_v25","dynasty_realms_save_v21","dynasty_realms_save_v20","dynasty_realms_save_v15","dynasty_realms_save_v14","dynasty_realms_save_v13","dynasty_realms_save_v12","dynasty_realms_save_v11"].forEach(k=>localStorage.removeItem(k));location.reload()}
function monthlyTick(){
 const paused=S.paused;baseMonthlyTick25();if(paused)return;ensure25();applySeason25();seasonalArmy25();populationCrisis25();epidemic25();aiDynastyTick25();applyLegacyEffects25();seasonalLegitimacy25();
 if(S.month===1||S.month===7){WORLD.characters&&Object.values(WORLD.characters).filter(v=>v.alive&&v.age>=50).forEach(v=>v.influence=clamp((v.influence||0)+(v.diplomacy||5)*.2,0,1000))}
 render();saveSilent();
}
function load25(){
 try{const raw=localStorage.getItem(SAVE25)||localStorage.getItem("dynasty_realms_save_v21")||localStorage.getItem("dynasty_realms_save_v20")||localStorage.getItem("dynasty_realms_save_v15")||localStorage.getItem("dynasty_realms_save_v14");if(raw){Object.assign(S,JSON.parse(raw),{version:25});applyWorldState()}}catch(e){}
 ensure25();render();saveSilent()
}
load25();