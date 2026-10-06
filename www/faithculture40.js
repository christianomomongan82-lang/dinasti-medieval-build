// Dynasty Realms v0.40 - Faith, Culture, Traditions & Innovations
const SAVE40="dynasty_realms_save_v40";
const baseMonthlyTick40=monthlyTick,baseRenderRealm40=renderRealm,baseRenderDynasty40=renderDynasty,baseRenderDiplomacy40=renderDiplomacy,baseRenderSelected40=renderSelected,baseRenderWar40=renderWar,baseSync40=syncWorldState,baseReset40=reset,baseWarObjectives40=warObjectives,baseEndWar40=endWar,baseMonthlyWar40=monthlyWar,baseOpinion40=opinion,baseDiplomacyScore40=diplomacyScore;
const TRADITIONS40={
 agrarian:["Agrarian Stewardship",140,"food",.12,"Farms and fertile counties produce more food."],
 martial:["Martial Heritage",160,"levy",1.06,"Levies fight more effectively."],
 maritime:["Maritime Traders",160,"trade",1.12,"Ports and coastal trade are more valuable."],
 bureaucratic:["Bureaucratic Court",170,"tax",1.07,"Administrative records improve tax collection."],
 scholarly:["Scholarly Tradition",150,"learning",1.12,"Council learning and prestige improve."],
 frontier:["Frontier Fortitude",150,"fort",1.1,"Border fortifications hold longer."]
};
const INNOVATIONS40=[
["manorial_records","Manorial Records",1075,"tax",1.06,100],
["guild_charters","Guild Charters",1090,"trade",1.1,120],
["crossbow_drill","Crossbow Drill",1100,"levy",1.05,130],
["stone_bastions","Stone Bastions",1110,"fort",1.18,150],
["naval_cartography","Naval Cartography",1120,"trade",1.08,170],
["court_schools","Court Schools",1105,"learning",1.12,140],
["estate_census","Estate Census",1085,"tax",1.05,115],
["heavy_cavalry","Heavy Cavalry",1130,"levy",1.1,190]
];
const HOLYSITES40={
 old_church:["c_northwatch","c_goldcoast","c_greyfen"],
 sun_cult:["c_highmoor","c_silverfen","c_stormwatch"],
 moon_faith:["c_lyrion_gate","c_lyr_court","c_amberrest"],
 iron_oath:["c_varmark_gate","c_ironheart","c_redforge"],
 river_way:["c_serevan_gate","c_riverfall","c_deltaport"],
 black_flame:["c_ashgate","c_emberfall","c_grimpeak"],
 sea_oath:["c_seagard","c_mistmoor","c_azureport"],
 stone_law:["c_dorvan_gate","c_marren","c_redspire"],
 star_path:["c_nareth_gate","c_starseat","c_nightbay"]
};
function ensure40(){
 S.version=40;S.faithFervor40=S.faithFervor40&&typeof S.faithFervor40==="object"?S.faithFervor40:{};S.culturalAcceptance40=S.culturalAcceptance40&&typeof S.culturalAcceptance40==="object"?S.culturalAcceptance40:{};S.traditions40=S.traditions40&&typeof S.traditions40==="object"?S.traditions40:{};S.innovations40=S.innovations40&&typeof S.innovations40==="object"?S.innovations40:{};S.religiousHead40=S.religiousHead40&&typeof S.religiousHead40==="object"?S.religiousHead40:{};S.faithDoctrine40=S.faithDoctrine40||"balanced";S.cultureEra40=S.cultureEra40||1066;S.holyWars40=Array.isArray(S.holyWars40)?S.holyWars40:[];S.religiousHistory40=Array.isArray(S.religiousHistory40)?S.religiousHistory40:[];S.cultureHistory40=Array.isArray(S.cultureHistory40)?S.cultureHistory40:[];
 const faiths=new Set(Object.keys(WORLD.faiths||{}));faiths.forEach(f=>{if(!Number.isFinite(S.faithFervor40[f]))S.faithFervor40[f]=50;if(!S.religiousHead40[f]){const k=(WORLD.kingdoms||[]).find(x=>x.faith===f||char(x.holder)?.faith===f);S.religiousHead40[f]=k?.holder||null}});
 const pc=ruler()?.culture;if(pc&&!S.traditions40[pc])S.traditions40[pc]=[];if(pc&&!S.innovations40[pc])S.innovations40[pc]={};
 WORLD.counties.forEach(c=>{const key=acceptKey40(c.culture,pc);if(!Number.isFinite(S.culturalAcceptance40[key]))S.culturalAcceptance40[key]=c.culture===pc?100:42;if(!c.holySiteFaith){Object.entries(HOLYSITES40).forEach(([f,ids])=>{if(ids.includes(c.id))c.holySiteFaith=f})}});
}
function acceptKey40(a,b){return [a,b].sort().join("|")}
function acceptance40(culture,target=ruler()?.culture){if(!culture||!target||culture===target)return 100;return clamp(S.culturalAcceptance40[acceptKey40(culture,target)]??42,0,100)}
function setAcceptance40(a,b,v){S.culturalAcceptance40[acceptKey40(a,b)]=clamp(Math.round(v),0,100)}
function faithPower40(f){
 const sites=(HOLYSITES40[f]||[]).map(county).filter(Boolean),controlled=sites.filter(c=>c.holder&&isPlayerVassal(c.holder)).length;
 const ferv=Number(S.faithFervor40[f]||50);return controlled*25+ferv*.7+(sites.length*5);
}
function faithDoctrine40(){return {balanced:[1,1,1],tolerant:[.85,.92,1.15],zealous:[1.25,1.08,.72],scholastic:[1.05,1.18,1]}[S.faithDoctrine40]||[1,1,1]}
function setFaithDoctrine40(k){if(!["balanced","tolerant","zealous","scholastic"].includes(k))return;S.faithDoctrine40=k;S.piety=Math.max(0,S.piety-15);S.legitimacy=clamp(S.legitimacy-1,0,100);chronicle30("The court adopted a "+k+" religious doctrine.","faith");toast("Religious doctrine changed");render();saveSilent()}
function faithTick40(){
 Object.keys(S.faithFervor40).forEach(f=>{let n=S.faithFervor40[f];const sites=(HOLYSITES40[f]||[]).map(county).filter(Boolean),held=sites.filter(c=>c&&char(c.holder)?.faith===f).length;n+=held*.06+(sites.some(c=>c?.status==="rival")?.02:0);if(f===ruler()?.faith)n+=((ruler()?.piety||0)>100?.025:0);S.faithFervor40[f]=clamp(n,5,100)});
 const rf=ruler()?.faith;if(rf){S.religiousHead40[rf]=S.religiousHead40[rf]||ruler().id}
}
function missionarySpread40(){
 const rf=ruler()?.faith;if(!rf)return;const d=faithDoctrine40(),neighbors=new Set(ownedCounties().flatMap(c=>(WORLD.adjacency[c.id]||[]).map(county).filter(Boolean)));
 neighbors.forEach(c=>{if(c.status!=="yours"||c.faith===rf)return;const ferv=S.faithFervor40[rf]||50,skill=(char(S.council.chaplain)?.learning||5),chance=.0035*skill*(1+ferv/120)*d[1]*(c.control/100);if(Math.random()<chance){c.faith=rf;c.control=clamp(c.control+3,0,100);S.religiousHistory40.unshift({year:S.year,month:S.month,county:c.id,type:"conversion"});log(c.name+" gradually adopted the court's faith.","faith")}})
}
function culturalAssimilation40(){
 const rc=ruler()?.culture;if(!rc)return;
 WORLD.counties.filter(c=>isPlayerVassal(c.holder)&&c.culture!==rc).forEach(c=>{let a=acceptance40(c.culture,rc);a+=c.control*.025+(realmProsperity(c)-50)*.12-(c.faith!==ruler().faith?2:0);setAcceptance40(c.culture,rc,a);if(a>72&&c.control>70&&Math.random()<.01){c.culture=rc;c.control=clamp(c.control+6,0,100);S.cultureHistory40.unshift({year:S.year,month:S.month,county:c.id,culture:rc});chronicle30(c.name+" completed a long cultural integration into "+rc+".","realm")}})}
function culturePressure40(c){
 const rc=ruler()?.culture;if(!c||!rc)return 0;return c.culture===rc?0:clamp(100-acceptance40(c.culture,rc)+(c.control<50?15:0),0,100)
}
function unlockTradition40(k){
 const d=TRADITIONS40[k],pc=ruler()?.culture;if(!d||!pc)return;if((S.traditions40[pc]||[]).includes(k))return toast("Tradition already unlocked");if((S.dynastyRenown||0)<d[1])return toast("Need "+d[1]+" dynasty renown");S.dynastyRenown-=d[1];S.traditions40[pc]=[...(S.traditions40[pc]||[]),k];chronicle30("House "+ruler().dynasty+" embraced "+d[0]+".","dynasty");toast("Cultural tradition unlocked");render();saveSilent()}
function traditionHas40(k){return (S.traditions40[ruler()?.culture]||[]).includes(k)}
function innovationHas40(k){return !!S.innovations40[ruler()?.culture]?.[k]}
function unlockInnovation40(k){
 const d=INNOVATIONS40.find(x=>x[0]===k),pc=ruler()?.culture;if(!d||!pc)return;if(innovationHas40(k))return toast("Innovation already known");if(S.year<d[2])return toast("Era not reached");if((S.dynastyRenown||0)<d[5])return toast("Need "+d[5]+" dynasty renown");S.dynastyRenown-=d[5];S.innovations40[pc]=S.innovations40[pc]||{};S.innovations40[pc][k]={year:S.year};chronicle30("The culture discovered "+d[1]+".","dynasty");toast("Innovation discovered");render();saveSilent()}
function cultureTaxFactor40(){let x=1;if(traditionHas40("bureaucratic"))x*=1.05;if(innovationHas40("manorial_records"))x*=1.04;if(innovationHas40("estate_census"))x*=1.04;return x}
function cultureLevyFactor40(){let x=1;if(traditionHas40("martial"))x*=1.06;if(innovationHas40("crossbow_drill"))x*=1.05;if(innovationHas40("heavy_cavalry"))x*=1.08;return x}
function cultureTradeFactor40(){let x=1;if(traditionHas40("maritime"))x*=1.1;if(innovationHas40("guild_charters"))x*=1.08;if(innovationHas40("naval_cartography"))x*=1.06;return x}
function cultureLearningFactor40(){let x=1;if(traditionHas40("scholarly"))x*=1.1;if(innovationHas40("court_schools"))x*=1.1;return x}
function cultureFortFactor40(){let x=1;if(traditionHas40("frontier"))x*=1.08;if(innovationHas40("stone_bastions"))x*=1.16;return x}
function realmTax(){return baseRealmTax40()*cultureTaxFactor40()}
function playerPower(){return basePlayerPower35()*cultureLevyFactor40()*cultureFortFactor40()}
function diplomacyScore(id){const n=baseDiplomacyScore40(id),v=char(id);if(!v)return n;return clamp(n+(v.faith===ruler()?.faith?5:-4)+(v.culture===ruler()?.culture?6:Math.max(-6,(acceptance40(v.culture,ruler()?.culture)-50)*.06)),-100,100)}
function opinion(id){const v=char(id),n=baseOpinion40(id);if(!v)return n;return clamp(n+(v.faith===ruler()?.faith?2:-3)+(v.culture===ruler()?.culture?2:Math.max(-3,(acceptance40(v.culture,ruler()?.culture)-60)*.04)),-100,100)}
function holyWarObjectives40(w){
 if(w?.goal==="holy_duchy"&&w.targetDuchy)return WORLD.counties.filter(c=>c.duchy===w.targetDuchy);
 return null;
}
function warObjectives(w){return holyWarObjectives40(w)||baseWarObjectives40(w)}
function declareHolyWar40(did){
 const d=duchy(did),holder=d&&titleHolder(d.id),r=ruler();if(!d||!holder||holder===r.id)return toast("Invalid holy war target");
 if(char(holder)?.faith===r.faith)return toast("The target follows your faith");
 if(S.piety<180)return toast("Need 180 piety");
 if(S.wars.some(w=>warHasPlayer(w)))return toast("Too many external wars");
 if((HOLYSITES40[r.faith]||[]).length&&faithPower40(r.faith)<55)return toast("Your faith lacks enough religious authority");
 const objs=WORLD.counties.filter(c=>c.duchy===d.id),adj=objs.some(c=>ownedCounties().some(pc=>(WORLD.adjacency[pc.id]||[]).includes(c.id)));if(!adj)return toast("No bordering province");
 const w={id:"w_holy40_"+Date.now().toString(36),kind:"external",attacker:S.rulerId,defender:holder,name:"Holy War for "+d.name,target:objs[0]?.id,targetDuchy:d.id,goal:"holy_duchy",score:0,months:0,siege:0,enemy:Math.floor(Math.max(250,realmPower15(holder)*.78)),battles:0,fronts:{},holyWar:true};objs.forEach(c=>w.fronts[c.id]={siege:0});S.wars.push(w);S.holyWars40.push(w.id);S.piety-=180;S.stress=clamp(S.stress+5,0,100);chronicle30("The crown proclaimed a holy war for "+d.name+".","war");toast("Holy war declared");render();saveSilent()
}
function endWar(w,result){
 const out=baseEndWar40(w,result);if(w?.holyWar&&result==="victory"){S.piety+=120;S.faithFervor40[ruler().faith]=clamp((S.faithFervor40[ruler().faith]||50)+7,5,100);S.dynastyRenown+=22;chronicle30("Victory in the holy war strengthened the faith of the realm.","faith");S.holyWars40=S.holyWars40.filter(id=>id!==w.id)}return out;
}
function monthlyWar(w){const out=baseMonthlyWar40(w);if(w?.holyWar&&w.score<0&&w.months>10)S.faithFervor40[ruler().faith]=clamp((S.faithFervor40[ruler().faith]||50)-.35,5,100);return out}
function faithCulturePanel40(id,includeTech){
 const old=$(id);if(old)old.remove();const box=document.createElement("div");box.id=id;
 const rf=ruler()?.faith,rc=ruler()?.culture,sites=(HOLYSITES40[rf]||[]).map(x=>county(x)).filter(Boolean),held=sites.filter(c=>isPlayerVassal(c.holder)).length;
 const trads=(S.traditions40[rc]||[]).map(k=>TRADITIONS40[k]?.[0]).join(", ")||"None",innov=Object.keys(S.innovations40[rc]||{}).map(k=>INNOVATIONS40.find(x=>x[0]===k)?.[1]).filter(Boolean).join(", ")||"None";
 const cultRows=Object.keys(TRADITIONS40).map(k=>"<button class='order-btn' data-trad40='"+k+"'><b>"+TRADITIONS40[k][0]+"</b><span>"+(traditionHas40(k)?"Unlocked":TRADITIONS40[k][1]+" renown · "+TRADITIONS40[k][4])+"</span></button>").join("");
 const techRows=includeTech?INNOVATIONS40.map(d=>"<button class='order-btn' data-innov40='"+d[0]+"'><b>"+d[1]+"</b><span>"+(innovationHas40(d[0])?"Known":S.year<d[2]?"Year "+d[2]:d[5]+" renown")+"</span></button>").join(""):"";
 box.innerHTML="<div class='section-title'>Faith</div><div class='grand-grid20'><div><span>Faith</span><b>"+esc(rf||"Unknown")+"</b></div><div><span>Fervor</span><b>"+Math.round(S.faithFervor40[rf]||50)+"%</b></div><div><span>Holy sites</span><b>"+held+"/"+sites.length+"</b></div><div><span>Doctrine</span><b>"+esc(S.faithDoctrine40)+"</b></div></div><div class='policy-grid20'>"+["balanced","tolerant","zealous","scholastic"].map(k=>"<button data-faithdoc40='"+k+"'>"+k+"</button>").join("")+"</div><div class='section-title'>Culture · "+esc(rc||"Unknown")+"</div><div class='renown-row15'><b>"+esc(trads)+"</b><span>Traditions</span></div><div class='renown-row15'><b>"+esc(innov)+"</b><span>Innovations</span></div><div class='section-title'>Traditions</div>"+cultRows+(includeTech?"<div class='section-title'>Innovations</div>"+techRows:"");
 const host=id==="faithCulture40Realm"?$("tab-realm"):$("tab-dynasty");host?.appendChild(box);
 box.querySelectorAll("[data-trad40]").forEach(b=>b.onclick=()=>unlockTradition40(b.dataset.trad40));
 box.querySelectorAll("[data-innov40]").forEach(b=>b.onclick=()=>unlockInnovation40(b.dataset.innov40));
 box.querySelectorAll("[data-faithdoc40]").forEach(b=>b.onclick=()=>setFaithDoctrine40(b.dataset.faithdoc40));
}
function renderRealm(){baseRenderRealm40();faithCulturePanel40("faithCulture40Realm",false)}
function renderDynasty(){baseRenderDynasty40();faithCulturePanel40("faithCulture40Dyn",true)}
function renderDiplomacy(){baseRenderDiplomacy40();let old=$("faithMap40");if(old)old.remove();old=document.createElement("div");old.id="faithMap40";const rows=(WORLD.kingdoms||[]).map(k=>{const v=char(k.holder);return "<div class='treaty-row15'><span><b>"+esc(k.name)+"</b><small>"+esc(v?.faith||"Unknown")+" · fervor "+Math.round(S.faithFervor40[v?.faith]||50)+" · "+esc(v?.culture||"Unknown")+"</small></span><span>"+Math.floor(faithPower40(v?.faith||""))+"</span></div>"}).join("");old.innerHTML="<div class='section-title'>Faith & culture balance</div>"+rows;$("tab-diplomacy")?.appendChild(old)}
function renderSelected(){baseRenderSelected40();const c=county(S.selectedCounty);if(!c||c.status!=="rival")return;let old=$("holyWar40");if(old)old.remove();old=document.createElement("div");old.id="holyWar40";const d=duchy(c.duchy);if(d&&c.faith!==ruler().faith)old.innerHTML="<button class='action-btn' data-holy40='1'><b>Holy War: "+esc(d.name)+"</b><span>180 piety · entire duchy objective</span></button>";$("holdingsSummary")?.parentElement?.appendChild(old);old.querySelectorAll("[data-holy40]").forEach(b=>b.onclick=()=>declareHolyWar40(d.id))}
function renderWar(){baseRenderWar40();let old=$("holyWarPanel40");if(old)old.remove();old=document.createElement("div");old.id="holyWarPanel40";const rows=(S.wars||[]).filter(w=>w.holyWar).map(w=>"<div class='treaty-row15'><span><b>"+esc(w.name)+"</b><small>Holy war · "+w.months+" months · fervor "+Math.round(S.faithFervor40[ruler().faith]||50)+"%</small></span></div>").join("");old.innerHTML="<div class='section-title'>Religious wars</div>"+(rows||"<div class='empty'>No active religious wars.</div>");$("tab-war")?.appendChild(old)}
function syncWorldState(){baseSync40();ensure40();WORLD.counties.forEach(c=>{if(S.countyState[c.id]){S.countyState[c.id].holySiteFaith=c.holySiteFaith||null;S.countyState[c.id].faith=c.faith;c.resource=c.resource||c.terrain}});S.version=40}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE40,JSON.stringify(S))}catch(e){}}
function reset(){["dynasty_realms_save_v40","dynasty_realms_save_v35","dynasty_realms_save_v30","dynasty_realms_save_v25","dynasty_realms_save_v21","dynasty_realms_save_v20","dynasty_realms_save_v15","dynasty_realms_save_v14"].forEach(k=>localStorage.removeItem(k));location.reload()}
function monthlyTick(){const paused=S.paused;baseMonthlyTick40();if(paused)return;ensure40();faithTick40();missionarySpread40();culturalAssimilation40();if(S.month===1){S.cultureEra40=S.year}render();saveSilent()}
function load40(){try{const raw=localStorage.getItem(SAVE40)||localStorage.getItem("dynasty_realms_save_v35")||localStorage.getItem("dynasty_realms_save_v30")||localStorage.getItem("dynasty_realms_save_v25")||localStorage.getItem("dynasty_realms_save_v21");if(raw){Object.assign(S,JSON.parse(raw),{version:40});applyWorldState()}}catch(e){}ensure40();render();saveSilent()}
load40();