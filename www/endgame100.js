// Dynasty Realms v1.00 - Full Grand Strategy Systems
// v0.60 Government & Internal Politics
// v0.70 War Engine 2.0
// v0.80 Economy & Trade
// v0.90 Character AI
// v1.00 Campaign, History, Difficulty & Polish
const SAVE100="dynasty_realms_save_v100";
const baseAction100=action;
const baseMonthly100=monthlyTick;
const baseRenderRealm100=renderRealm;
const baseRenderCourt100=renderCourt;
const baseRenderDynasty100=renderDynasty;
const baseRenderDiplomacy100=renderDiplomacy;
const baseRenderWar100=renderWar;
const baseRenderSelected100=renderSelected;
const baseSave100=saveSilent;
const baseReset100=reset;
const baseBeginStart100=typeof beginStart45==="function"?beginStart45:null;

const GOV100={
 feudal:{name:"Feudal Monarchy",tax:1,levy:1,order:1,desc:"Nobles exchange land for military and fiscal obligations."},
 elective:{name:"Elective Crown",tax:.94,levy:.98,order:1.06,desc:"Great vassals choose among recognized candidates."},
 bureaucratic:{name:"Royal Bureaucracy",tax:1.16,levy:.9,order:1.14,desc:"Officials replace much of the old feudal bargaining."},
 merchant:{name:"Merchant Principality",tax:1.22,levy:.72,order:1.05,desc:"Trade wealth outweighs traditional levies."}
};
const LAW100={
 crown:["low","medium","high","absolute"],
 taxation:["customary","heavy","extraordinary"],
 succession:["male_preference","equal","male_only","elective"],
 inheritance:["single_heir","partition","high_partition"],
 military:["levy_host","balanced_host","professional_host"]
};
const UNIT100={
 levies:{name:"Levies",atk:1,def:1,screen:.2,price:0},
 spearmen:{name:"Spearmen",atk:1.05,def:1.25,screen:.35,price:28},
 archers:{name:"Archers",atk:1.22,def:.9,screen:.15,price:30},
 cavalry:{name:"Heavy Cavalry",atk:1.55,def:1.2,screen:.08,price:52},
 siege:{name:"Siege Train",atk:.35,def:.5,screen:0,price:70}
};
const RES100={
 Grain:{base:1,food:1.7},Timber:{base:1.15,food:.2},Stone:{base:1.25,food:0},Iron:{base:1.5,food:0},Horses:{base:2.15,food:.1},Salt:{base:1.8,food:.1},Silk:{base:3.5,food:.05},Port:{base:2.1,food:.2},Herbs:{base:2,food:.1}
};

function ensure100(){
 S.version=100;
 S.government100=S.government100||{type:"feudal",crown:"low",taxation:"customary",succession:S.succession||"male_preference",inheritance:"partition",military:"balanced_host",parliament:0,tyranny:0,authority:0};
 const g=S.government100;
 g.type=GOV100[g.type]?g.type:"feudal";g.crown=LAW100.crown.includes(g.crown)?g.crown:(S.crownAuthority||"low");
 g.taxation=LAW100.taxation.includes(g.taxation)?g.taxation:"customary";g.succession=LAW100.succession.includes(g.succession)?g.succession:(S.succession||"male_preference");
 g.inheritance=LAW100.inheritance.includes(g.inheritance)?g.inheritance:"partition";g.military=LAW100.military.includes(g.military)?g.military:"balanced_host";
 S.parliament100=S.parliament100||{sessions:0,reforms:0,standing:20,demands:[]};
 S.factionPower100=S.factionPower100||0;
 S.treasury100=S.treasury100||{debt:0,interest:0,inflation:0,credit:100};
 S.economy100=S.economy100||{prices:{},routes:[],markets:{},tradeHub:{},infrastructure:{},resourceStock:{}};
 S.army100=S.army100||{standing:{spearmen:0,archers:0,cavalry:0,siege:0},professionalism:0,militaryScore:0};
 S.wars100=S.wars100||{history:[],demands:{},negotiations:{}};
 S.characterAI100=S.characterAI100||{memory:{},agendas:{},grudges:{},ambitions:{},lastActions:{}};
 S.chronicle100=Array.isArray(S.chronicle100)?S.chronicle100:[];
 S.achievements100=S.achievements100||{};
 S.difficulty100=S.difficulty100||"normal";
 S.ironman100=!!S.ironman100;
 S.campaignStats100=S.campaignStats100||{months:0,battles:0,warsWon:0,warsLost:0,countiesWon:0,countiesLost:0,charactersDied:0,royalDeaths:0,bankruptcies:0,reforms:0};
 S.mapMode100=S.mapMode100||"political";
 S.autosave100=true;
 WORLD.counties.forEach(c=>{
   c.resource=c.resource||(["plains","forest","hills","mountains","coast"].includes(c.terrain)?({plains:"Grain",forest:"Timber",hills:"Stone",mountains:"Iron",coast:"Port"}[c.terrain]):"Grain");
   c.marketLevel=c.marketLevel||0;c.infrastructure=c.infrastructure||0;c.localPrice=Number.isFinite(c.localPrice)?c.localPrice:1;
   c.population=Number.isFinite(c.population)?c.population:Math.max(80,c.dev*12);c.food=Number.isFinite(c.food)?c.food:80;c.control=Number.isFinite(c.control)?c.control:70;
 });
 Object.values(WORLD.characters||{}).forEach(c=>{
   if(!S.characterAI100.memory[c.id])S.characterAI100.memory[c.id]=[];
   if(!S.characterAI100.grudges[c.id])S.characterAI100.grudges[c.id]=0;
   if(!S.characterAI100.ambitions[c.id])S.characterAI100.ambitions[c.id]=((c.traits||[]).includes("Ambitious")?70:35);
 });
}

function gov100(){return GOV100[S.government100.type]||GOV100.feudal}
function realmGovPower100(){return gov100().order*(S.government100.crown==="absolute"?1.08:S.government100.crown==="high"?1.04:1)*(1-Math.min(.35,(S.government100.tyranny||0)/200))}
function govAction100(type){
 ensure100();const g=S.government100;
 const costs={bureaucratic:320,merchant:280,elective:220,feudal:0};const cost=costs[type];
 if(!GOV100[type])return;
 if(g.type===type)return toast("Already using "+GOV100[type].name);
 if(S.prestige<cost)return toast("Need "+cost+" prestige");
 if(g.type==="bureaucratic"&&type!=="feudal"&&S.gold<0)return toast("Treasury instability");
 S.prestige-=cost;g.type=type;g.parliament=0;g.tyranny=0;S.legitimacy=clamp(S.legitimacy-3,0,100);S.campaignStats100.reforms++;
 log("The crown adopted "+GOV100[type].name+".","court");toast("Government changed");render();saveSilent();
}
function reformCrown100(level){
 const order=LAW100.crown.indexOf(S.government100.crown),next=LAW100.crown.indexOf(level);
 if(next<0||next!==order+1)return toast("Only the next crown authority can be enacted");
 const cost=[0,180,350,550][next];
 if(S.prestige<cost)return toast("Need "+cost+" prestige");
 const opposition=directVassalCharacters().filter(v=>opinion(v.id)<0).length*7+(S.government100.tyranny||0)*.4;
 S.prestige-=cost;S.government100.crown=level;S.crownAuthority=level==="absolute"?"high":level;S.government100.tyranny=clamp((S.government100.tyranny||0)+opposition*.15,0,100);S.legitimacy=clamp(S.legitimacy-4,0,100);
 if(opposition>28)S.factionPower100+=opposition*.6;
 log("Crown authority was raised to "+level+".","court");toast("Authority reformed");render();saveSilent();
}
function changeLaw100(kind,value){
 ensure100();const g=S.government100;if(!LAW100[kind]?.includes(value))return;
 const old=g[kind],idx=LAW100[kind].indexOf(old),ni=LAW100[kind].indexOf(value),cost=kind==="succession"?Math.max(80,ni*110):Math.max(60,ni*70);
 if(old===value)return toast("Law unchanged");
 if(ni<idx)return toast("The crown cannot easily reverse this law");
 if(S.prestige<cost)return toast("Need "+cost+" prestige");
 const hostile=directVassalCharacters().filter(v=>opinion(v.id)<-10).length;
 S.prestige-=cost;g[kind]=value;if(kind==="succession")S.succession=value;S.government100.tyranny=clamp((S.government100.tyranny||0)+hostile*2,0,100);S.campaignStats100.reforms++;
 rebuildHeir();log("The realm adopted a new "+kind+" law: "+value.replaceAll("_"," ")+".","court");toast("Law changed");render();saveSilent();
}
function parliament100(){
 const g=S.government100,p=S.parliament100;
 p.sessions++;p.standing=clamp(p.standing+(S.legitimacy>70?1:-1),0,100);
 const nobles=directVassalCharacters().map(v=>Math.max(-100,Math.min(100,opinion(v.id)))).reduce((a,b)=>a+b,0);
 const support=clamp(48+nobles/(Math.max(1,directVassalCharacters().length)*2)+p.standing*.25-(g.tyranny||0)*.4,0,100);
 if(support<35){p.demands.push({year:S.year,month:S.month,type:"noble_rights"});p.demands=p.demands.slice(-6);S.factionPower100+=2}
 if(support>72)S.legitimacy=clamp(S.legitimacy+1,0,100);
 return Math.round(support);
}
function vassalLoyalty100(v){
 const base=opinion(v.id),fear=(v.fearOfCrown||0)*.2,tyr=(S.government100.tyranny||0)*.25;
 return clamp(base+fear-tyr+(gov100().order-1)*18,-100,100);
}
function factionUpdate100(){
 const direct=directVassalCharacters(),loyal=direct.reduce((n,v)=>n+(vassalLoyalty100(v)<-15?1:0),0);
 const share=direct.length?loyal/direct.length:0;
 S.factionPower100=clamp(S.factionPower100*.92+share*100*.12,0,120);
 if(S.factionPower100>75&&Math.random()<.04){
   const rebels=direct.filter(v=>vassalLoyalty100(v)<-15).map(v=>v.id).slice(0,5);
   if(rebels.length&&!S.wars.some(w=>w.kind==="civil")){
     const enemy=rebels.reduce((n,id)=>n+(vassalPower(id)||250),0);
     S.wars.push({id:"civil_"+Date.now().toString(36),kind:"civil",name:"Civil War for Noble Liberties",target:S.selectedCounty,score:0,enemy,months:0,siege:0,rebels});
     S.factionPower100*=.45;log("A coalition of dissatisfied vassals rose in civil war.","war");toast("Civil war!");
   }
 }
}
function titleCreation100(kind){
 const cs=ownedCounties(),duchyIds=[...new Set(cs.map(c=>c.duchy))].filter(Boolean);
 if(kind==="duchy"){
   if(duchyIds.length<1)return toast("Need a county to form a duchy");
   const existing=WORLD.duchies.find(d=>titleHolder(d.id)===S.rulerId);
   const base=cs.find(c=>c.duchy===duchyIds[0]);if(!base)return;
   const id="d_created_"+Date.now().toString(36),name="Duchy of "+base.name+" March";
   if(S.gold<160)return toast("Need 160 gold");
   S.gold-=160;WORLD.duchies.push({id,name,deJure:name.replace("Duchy of ",""),capital:base.id,tier:"duchy",holder:S.rulerId,parent:WORLD.kingdoms?.find(k=>k.holder===S.rulerId)?.id||"k_arvend"});WORLD.titles.push({id,name,type:"duchy",parent:WORLD.duchies.at(-1).parent,holder:S.rulerId,deJure:false});S.prestige+=65;log("A new duchy was created: "+name+".","dynasty");
 }else if(kind==="kingdom"){
   if(cs.length<12)return toast("Need 12 counties");
   if(S.gold<420)return toast("Need 420 gold");
   const id="k_created_"+Date.now().toString(36),name="Kingdom of "+ruler().dynasty.replace(/^House /,"");
   S.gold-=420;WORLD.kingdoms=WORLD.kingdoms||[];WORLD.kingdoms.push({id,name,holder:S.rulerId,capital:S.selectedCounty,tier:"kingdom"});WORLD.titles.push({id,name,type:"kingdom",parent:null,holder:S.rulerId,deJure:false});S.prestige+=160;S.legitimacy=clamp(S.legitimacy+6,0,100);log("The crown proclaimed the "+name+".","dynasty");
 }
 render();saveSilent();
}
function vassalGrant100(){
 const candidates=directVassalCharacters();if(!candidates.length)return;
 const t=county(S.selectedCounty);if(!t||t.holder===S.rulerId)return toast("Select a county suitable for granting");
 const v=candidates.sort((a,b)=>vassalLoyalty100(b)-vassalLoyalty100(a))[0];setTitleHolder(t.id,v.id);t.status="yours";S.relations[v.id]=clamp(opinion(v.id)+8,-100,100);log(v.name+" was granted "+t.name+".","court");render();saveSilent();
}

// WAR 2.0
function armyUnits100(a){return{levies:Math.max(0,a.levy||a.men||0),spearmen:Math.max(0,a.spearmen||0),archers:Math.max(0,a.archers||0),cavalry:Math.max(0,a.cavalry||0),siege:Math.max(0,a.siege||0)}}
function armyCombatPower100(a,terrain){
 const u=armyUnits100(a),season=(S.season25||"Autumn"),weather=season==="Winter"?.93:season==="Summer"?1.03:1;
 const tmod=terrain==="mountains"?.72:terrain==="hills"?.9:terrain==="forest"?.94:terrain==="coast"?.98:1;
 const atk=u.levies*1+u.spearmen*1.1+u.archers*1.18+u.cavalry*1.5+u.siege*.55;
 const def=u.levies*.92+u.spearmen*1.3+u.archers*1.05+u.cavalry*1.28+u.siege*.4;
 const commander=char(a.commander)?.martial||5,prof=1+(S.army100.professionalism||0)/350;
 return{attack:atk*weather*tmod*(1+commander*.025)*prof*armyMoraleFactor100(a),defense:def*weather*(1+commander*.018)*prof*armyMoraleFactor100(a)};
}
function armyMoraleFactor100(a){return clamp((a.morale??100)/100*.92+(a.supply??100)/100*.08-(a.fatigue||0)/300,.35,1.08)}
function upgradeArmy100(kind,men){
 const cost=UNIT100[kind]?.price*men/10;if(!UNIT100[kind]||S.gold<cost)return toast("Need more gold");
 const a=S.armies.find(x=>x.raised)||S.armies[0];if(!a)return;
 const key={spearmen:"spearmen",archers:"archers",cavalry:"cavalry",siege:"siege"}[kind],n=Math.min(men,Math.max(0,Math.floor((a.men||0)*.45)));
 if(!n)return toast("Insufficient field manpower");
 a[key]=(a[key]||0)+n;a.men=(a.men||0)+0;S.gold-=cost;S.army100.professionalism=clamp(S.army100.professionalism+(kind==="siege"?1.5:1),0,100);log("The army trained "+n+" "+UNIT100[kind].name+".","war");render();saveSilent();
}
function battle100(w,a,defPower,terrain){
 const cp=armyCombatPower100(a,terrain),d=Math.max(120,defPower),odds=cp.attack/(d+1),shock=clamp(.78+Math.random()*.42,0.7,1.18);
 const lossA=Math.max(20,Math.floor((a.men||0)*clamp(.06+(d/(cp.attack+1))*.08,0.03,.23)*shock));
 const lossD=Math.max(24,Math.floor(d*clamp(.055+(cp.defense/(d+1))*.04,0.035,.2)*(2-shock)));
 a.men=Math.max(0,(a.men||0)-lossA);a.levy=Math.max(0,(a.levy||0)-Math.floor(lossA*.7));a.morale=clamp((a.morale||100)-(odds<.8?14:odds<1?7:3),0,100);a.fatigue=clamp((a.fatigue||0)+8,0,100);
 w.battles=(w.battles||0)+1;w.score+=clamp((odds-1)*18,-12,18);
 S.campaignStats100.battles++;log("Battle in "+terrain+": your forces lost "+lossA+" while the enemy lost about "+lossD+".","war");
 if(lossA>lossD*1.8)w.score-=7;
}
function siegeProgress100(w,a,c){
 const u=armyUnits100(a),engineers=(u.siege||0)*1.7+(a.menAtArms||0)*.08,fort=(c.fort||1)+((c.buildings?.walls||0)*.45);
 w.siege=clamp((w.siege||0)+Math.max(1.5,((a.men||0)/(fort*210))*2.2+engineers*.06),0,100);
 if(w.siege>=100){w.score+=12;setTitleHolder(c.id,S.rulerId);c.status="yours";c.control=clamp((c.control||50)-12,0,100);c.siege=0;S.campaignStats100.countiesWon++;}
}
function warDemand100(w,type){
 if(!w)return toast("No active war");
 S.wars100.demands[w.id]=S.wars100.demands[w.id]||[];
 const arr=S.wars100.demands[w.id];if(!["white_peace","cede","reparations","release"].includes(type))return;
 if(!arr.includes(type))arr.push(type);
 if(type==="cede"&&!w.target)return toast("No territorial target");
 log("The crown proposed a peace term: "+type.replace("_"," ")+".","war");toast("Peace term proposed");
}
function peaceOffer100(w,accept){
 if(!w)return;
 if(accept){endWar(w,"white_peace");S.wars100.history.push({year:S.year,name:w.name,result:"negotiated peace"});return}
 S.government100.tyranny=clamp(S.government100.tyranny+1,0,100);log("The enemy rejected the peace offer.","war");
}
function warProcess100(){
 S.wars.slice().forEach(w=>{
   if(w.kind==="external"||w.kind==="civil"){
     const a=S.armies.find(x=>x.raised)||S.armies[0],t=county(w.target);
     if(!a||!t)return;
     const here=a.location===t.id;
     if(here){
       if(Math.random()<.38)battle100(w,a,Math.max(150,w.enemy||enemyPower(t)),t.terrain);
       siegeProgress100(w,a,t);
       if(w.score>=100||w.siege>=100)endWar(w,"victory");
       else if(w.score<=-65||a.men<=80)endWar(w,"defeat");
     }else if((WORLD.adjacency[a.location]||[]).includes(t.id)&&Math.random()<.23){a.location=t.id;a.supply=clamp((a.supply||100)-6,0,100);a.fatigue=clamp((a.fatigue||0)+2,0,100)}
     if(w.months>30&&w.score>-20&&Math.random()<.05)peaceOffer100(w,true);
     w.months++;
   }
 });
}

// ECONOMY 3.0
function marketPrice100(c){
 const r=RES100[c.resource]||RES100.Grain,foodPressure=c.resource==="Grain"?1:0;
 const popPressure=Math.max(0,(c.population||100)-180)/500;
 const supply=(c.marketLevel||0)*.07+(c.infrastructure||0)*.03;
 const shortage=(c.food||80)<35?foodPressure*.25:0;
 return clamp(r.base*(c.localPrice||1)*(1+popPressure+shortage-supply),.45,5.5);
}
function tradeRouteValue100(a,b){
 const ca=county(a),cb=county(b);if(!ca||!cb)return 0;
 const dist=Math.abs((ca.x||0)-(cb.x||0))+Math.abs((ca.y||0)-(cb.y||0));
 const port=(ca.terrain==="coast"?1.35:1)*(cb.terrain==="coast"?1.35:1),markets=1+(ca.marketLevel||0)*.12+(cb.marketLevel||0)*.12;
 return Math.max(0,4.5-dist/700)*port*markets;
}
function establishTrade100(id){
 const target=char(id);if(!target)return;
 if(S.gold<40)return toast("Need 40 gold to charter the route");
 if(opinion(id)<5)return toast("They refuse the charter");
 const key=[S.rulerId,id].sort().join("|"),existing=(S.economy100.routes||[]).find(r=>r.key===key);
 if(existing)return toast("Route already exists");
 S.gold-=40;S.economy100.routes.push({key,a:S.rulerId,b:id,started:S.year*12+S.month,level:1});S.prestige+=8;log("Merchants established a trade route with "+target.name+".","court");render();saveSilent();
}
function investCounty100(id,type){
 const c=county(id);if(!c||!isPlayerVassal(c.holder))return;
 const cost=type==="market"?70:type==="road"?55:type==="mine"?80:45;
 if(S.gold<cost)return toast("Need "+cost+" gold");
 S.gold-=cost;
 if(type==="market")c.marketLevel=Math.min(5,(c.marketLevel||0)+1);
 else if(type==="road")c.infrastructure=Math.min(5,(c.infrastructure||0)+1);
 else if(type==="mine"&&["mountains","hills"].includes(c.terrain))c.infrastructure=Math.min(6,(c.infrastructure||0)+1);else if(type==="farm")c.food=(c.food||80)+18;
 c.tax+=type==="market"?.22:.08;c.prosperity=clamp((c.prosperity||60)+4,0,100);log("Investment increased prosperity in "+c.name+".","court");render();saveSilent();
}
function economyTick100(){
 let tariff=0;
 WORLD.counties.forEach(c=>{
   const price=marketPrice100(c);c.localPrice=clamp(price,.45,5.5);
   const terrainFood=c.terrain==="plains"?1.7:c.terrain==="forest"?1.1:c.terrain==="coast"?1.2:c.terrain==="marsh"?1.3:.7;
   c.food=clamp((c.food||80)+terrainFood+(c.infrastructure||0)*.3-(c.population||100)/150,0,160);
   c.population=Math.max(20,(c.population||100)+(c.food>60?Math.max(1,c.population*.002):c.food<30?-Math.max(2,c.population*.006):0));
   if(c.marketLevel)c.tax+=.002*c.marketLevel;
 });
 S.treasury100.inflation=clamp(S.treasury100.inflation+(realmTax()>.15*S.gold?.006:.002)-(S.gold<0?.004:0),0,35);
 const routes=S.economy100.routes||[];
 routes.forEach(r=>{const a=(WORLD.kingdoms||[]).find(k=>k.holder===r.a)?.capital||S.selectedCounty,b=(WORLD.kingdoms||[]).find(k=>k.holder===r.b)?.capital||S.selectedCounty;tariff+=tradeRouteValue100(a,b)*.08*r.level});
 if(tariff>0)S.gold+=tariff;
 const debt=S.treasury100.debt;if(debt>0){S.treasury100.interest=debt*(.006+S.treasury100.inflation/9000);S.gold-=S.treasury100.interest}
 if(S.gold<-80&&!S.treasury100.debt){S.treasury100.debt=160;S.campaignStats100.bankruptcies++;S.legitimacy=clamp(S.legitimacy-12,0,100);log("The crown entered emergency debt after a treasury crisis.","court")}
 if(S.gold>0&&S.treasury100.debt>0&&S.gold>40){const pay=Math.min(S.treasury100.debt*.04,S.gold*.2);S.gold-=pay;S.treasury100.debt=Math.max(0,S.treasury100.debt-pay)}
}
function takeRoyalLoan100(){
 if(S.treasury100.debt>0)return toast("Existing debt already burdens the treasury");
 S.gold+=180;S.treasury100.debt=200;S.treasury100.credit=clamp(S.treasury100.credit-15,0,100);S.legitimacy=clamp(S.legitimacy-2,0,100);log("The crown borrowed against future revenue.","court");toast("Royal loan received");render();saveSilent();
}

// CHARACTER AI 4.0
function remember100(a,b,event,weight=1){
 ensure100();const m=S.characterAI100.memory[a]=S.characterAI100.memory[a]||[];m.push({target:b,event,year:S.year,month:S.month,weight});while(m.length>24)m.shift();
 if(event==="insult"||event==="title_loss")S.characterAI100.grudges[a]=clamp((S.characterAI100.grudges[a]||0)+weight,0,100);
}
function personalityScore100(v){
 const t=v.traits||[];return{ambition:t.includes("Ambitious")?1.35:1,war:t.includes("Brave")||t.includes("Wrathful")?1.3:1,diplomacy:t.includes("Patient")||t.includes("Calm")?1.25:1,greed:t.includes("Diligent")?1.15:1};
}
function aiAgenda100(v){
 ensure100();const old=S.characterAI100.agendas[v.id];if(old)return old;
 const p=personalityScore100(v),g=v.stewardship||5,m=v.martial||5,d=v.diplomacy||5,i=v.intrigue||5;
 let a=p.war*m>.0&&m>=9?"war":i>=9?"scheme":d>=10?"diplomacy":g>=10?"economy":"consolidate";
 S.characterAI100.agendas[v.id]=a;return a;
}
function aiMemoryModifier100(id){
 const arr=S.characterAI100.memory[id]||[];return arr.slice(-10).reduce((n,m)=>n+(m.target===S.rulerId?(m.event==="gift"?2:-m.weight):0),0);
}
function aiCharacterTick100(){
 const actors=Object.values(WORLD.characters||{}).filter(v=>v.alive&&v.id!==S.rulerId);
 actors.forEach(v=>{
   const a=aiAgenda100(v),p=personalityScore100(v),memory=aiMemoryModifier100(v);
   if(v.id===S.council?.chancellor||v.id===S.council?.steward)remember100(v.id,S.rulerId,"office",.1);
   if(opinion(v.id)<-30){remember100(v.id,S.rulerId,"insult",.5);v.fearOfCrown=clamp((v.fearOfCrown||0)+.5,0,100)}
   if(a==="diplomacy"&&Math.random()<.025&&memory>-2)S.relations[v.id]=clamp(opinion(v.id)+2,-100,100);
   if(a==="economy"&&Math.random()<.04){const c=WORLD.counties.find(x=>x.holder===v.id);if(c){c.prosperity=clamp((c.prosperity||60)+1.4,0,100);c.tax+=.03}}
   if(a==="war"&&Math.random()<.03){const c=WORLD.counties.find(x=>x.status==="neutral"&&((WORLD.adjacency[v.id]||[]).includes(x.id)));if(c)remember100(v.id,c.id,"war_target",1)}
   const rel=opinion(v.id),amb=S.characterAI100.ambitions[v.id]||35;
   S.characterAI100.ambitions[v.id]=clamp(amb+(rel>25?.15:-.05)+(p.ambition>1? .25:0),0,100);
 });
}
function dynasticMemory100(){
 const r=ruler();if(!r)return;
 Object.values(WORLD.characters).filter(c=>c.alive).forEach(c=>{
   if(c.spouse===r.id)remember100(r.id,c.id,"marriage",2);
   if(c.id!==r.id&&c.dynasty===r.dynasty&&opinion(c.id)>60)remember100(r.id,c.id,"family",.2);
 });
}
function historicalDeath100(old,next){
 S.campaignStats100.charactersDied++;S.campaignStats100.royalDeaths++;
 S.chronicle100.unshift({year:S.year,month:S.month,type:"succession",text:old.name+" died. "+next.name+" inherited the crown."});S.chronicle100=S.chronicle100.slice(0,60);
}
function endWarHistory100(w,result){
 if(!w)return;
 S.wars100.history.unshift({year:S.year,month:S.month,name:w.name,result,target:w.target,battles:w.battles||0});
 S.wars100.history=S.wars100.history.slice(0,60);
 if(result==="victory")S.campaignStats100.warsWon++;if(result==="defeat")S.campaignStats100.warsLost++;
}

// v1.00 CAMPAIGN
function difficultyMult100(){return S.difficulty100==="hard"?1.16:S.difficulty100==="easy"?.86:1}
function setDifficulty100(v){if(!["easy","normal","hard"].includes(v))return;S.difficulty100=v;toast("Difficulty: "+v);render();saveSilent()}
function toggleIronman100(){
 S.ironman100=!S.ironman100;S.autosave100=true;toast(S.ironman100?"Ironman enabled":"Ironman disabled");saveSilent();
}
function chronicle100(text,type="court"){S.chronicle100.unshift({year:S.year,month:S.month,type,text});S.chronicle100=S.chronicle100.slice(0,60)}
function mapMode100(mode){S.mapMode100=mode;render();saveSilent()}
function mapColor100(c){
 if(S.mapMode100==="culture")return c.culture===ruler().culture?"yours":c.culture===WORLD.counties.find(x=>x.holder===ruler().id)?.culture?"rival":"neutral";
 if(S.mapMode100==="faith")return c.faith===ruler().faith?"yours":c.faith===WORLD.counties.find(x=>x.holder===ruler().id)?.faith?"rival":"neutral";
 if(S.mapMode100==="economy")return (c.localPrice||1)>2?"rival":(c.localPrice||1)<.9?"yours":"neutral";
 if(S.mapMode100==="control")return (c.control||0)>80?"yours":(c.control||0)<45?"rival":"neutral";
 return c.holder===S.rulerId||isPlayerVassal(c.holder)?"yours":c.status==="rival"?"rival":"neutral";
}
function checkAchievements100(){
 const cs=ownedCounties(),wars=S.campaignStats100;
 const tests={
  first_crown:cs.length>=1,
  realm_builder:cs.length>=20,
  kingmaker:(WORLD.kingdoms||[]).some(k=>k.holder===S.rulerId),
  conqueror:wars.countiesWon>=20,
  diplomat:(S.diplomacy50?.treaties||[]).filter(t=>t.a===S.rulerId||t.b===S.rulerId).length>=4,
  merchant:(S.economy100.routes||[]).length>=3,
  reformer:S.campaignStats100.reforms>=3,
  survivor:S.campaignStats100.months>=240,
  dynasty:S.campaignStats100.royalDeaths>=3,
  iron_crown:S.ironman100&&S.campaignStats100.months>=240
 };
 Object.entries(tests).forEach(([k,v])=>{if(v&&!S.achievements100[k]){S.achievements100[k]=S.year;S.prestige+=15;log("Achievement unlocked: "+k.replaceAll("_"," ")+".","dynasty")}});
}
function campaignTick100(){
 ensure100();S.campaignStats100.months++;
 const sup=parliament100();
 factionUpdate100();economyTick100();warProcess100();aiCharacterTick100();dynasticMemory100();
 const levyLaw=S.government100.military==="professional_host"?.94:S.government100.military==="levy_host"?1.08:1;
 const inflationPenalty=1-Math.min(.22,S.treasury100.inflation/160);
 if(S.levies>S.troopCap)S.levies=S.troopCap;
 S.troopCap=Math.max(300,Math.floor(S.troopCap*levyLaw*inflationPenalty));
 S.gold-=Math.max(0,(S.army100.professionalism||0)*.012);
 S.government100.authority=clamp(sup*.65+(gov100().order-1)*40,0,100);
 S.government100.tyranny=Math.max(0,(S.government100.tyranny||0)-.15);
 if(S.ironman100&&S.month%1===0){try{localStorage.setItem(SAVE100,JSON.stringify(S))}catch(e){}}
 if(S.month===1){checkAchievements100();chronicle100("A new year began under "+ruler().name+".","year");}
}

function renderGovernment100(){
 let box=$("government100");if(box)box.remove();box=document.createElement("div");box.id="government100";
 const g=S.government100,loyal=directVassalCharacters().map(v=>vassalLoyalty100(v)),avg=loyal.length?Math.round(loyal.reduce((a,b)=>a+b,0)/loyal.length):100;
 const govBtns=Object.entries(GOV100).map(([k,v])=>"<button data-g100-gov='"+k+"'><b>"+esc(v.name)+"</b><span>"+v.desc+" · "+(k==="feudal"?"free":"cost "+({bureaucratic:320,merchant:280,elective:220}[k]||0)+" prestige")+"</span></button>").join("");
 const lawBtns=["medium","high","absolute"].map(x=>"<button data-g100-crown='"+x+"'>Crown "+x+"</button>").join("");
 box.innerHTML="<div class='section-title'>Statecraft v0.60</div><div class='g100-grid'><div><span>Government</span><b>"+esc(gov().name)+"</b></div><div><span>Crown authority</span><b>"+g.crown+"</b></div><div><span>Vassal loyalty</span><b>"+avg+"</b></div><div><span>Tyranny</span><b>"+Math.round(g.tyranny)+"</b></div><div><span>Parliament</span><b>"+Math.round(g.parliament)+"</b></div><div><span>War policy</span><b>"+g.military.replaceAll("_"," ")+"</b></div></div><div class='g100-buttons'>"+govBtns+"</div><div class='g100-buttons'>"+lawBtns+"</div><div class='g100-small'>"+esc(gov().desc)+"</div>";
 $("tab-realm")?.appendChild(box);
 box.querySelectorAll("[data-g100-gov]").forEach(b=>b.onclick=()=>govAction100(b.dataset.g100Gov));
 box.querySelectorAll("[data-g100-crown]").forEach(b=>b.onclick=()=>reformCrown100(b.dataset.g100Crown));
}
function renderEconomy100(){
 let box=$("economy100");if(box)box.remove();box=document.createElement("div");box.id="economy100";
 const eco=S.economy100, routes=eco.routes||[],c=county(S.selectedCounty);
 box.innerHTML="<div class='section-title'>Economic engine v0.80</div><div class='g100-grid'><div><span>Debt</span><b>"+Math.floor(S.treasury100.debt)+"</b></div><div><span>Interest</span><b>"+S.treasury100.interest.toFixed(1)+"/mo</b></div><div><span>Inflation</span><b>"+S.treasury100.inflation.toFixed(1)+"%</b></div><div><span>Trade routes</span><b>"+routes.filter(r=>r.a===S.rulerId||r.b===S.rulerId).length+"</b></div></div><div class='g100-buttons'><button data-e100='loan'><b>Royal Loan</b><span>+180 gold · creates debt</span></button><button data-e100='market'><b>Build Market</b><span>-70 gold · selected county</span></button><button data-e100='road'><b>Build Royal Road</b><span>-55 gold · infrastructure</span></button><button data-e100='farm'><b>Emergency Granary</b><span>-45 gold · +food</span></button></div><div class='g100-small'>Selected: "+esc(c?.name||"None")+" · "+esc(c?.resource||"Grain")+" · price "+(c?.localPrice||1).toFixed(2)+" · population "+Math.floor(c?.population||0)+"</div>";
 $("tab-realm")?.appendChild(box);box.querySelectorAll("[data-e100]").forEach(b=>b.onclick=()=>{const a=b.dataset.e100;if(a==="loan")takeRoyalLoan100();else investCounty100(S.selectedCounty,a)});
}
function renderArmy100(){
 let box=$("army100");if(box)box.remove();box=document.createElement("div");box.id="army100";const a=S.armies.find(x=>x.raised)||S.armies[0];
 if(!a){box.innerHTML="<div class='section-title'>Warfare v0.70</div><div class='empty'>No field army.</div>";$("tab-war")?.appendChild(box);return}
 box.innerHTML="<div class='section-title'>Warfare v0.70 · Army composition</div><div class='g100-grid'><div><span>Field men</span><b>"+Math.floor(a.men||0)+"</b></div><div><span>Morale</span><b>"+Math.floor(a.morale||0)+"</b></div><div><span>Supply</span><b>"+Math.floor(a.supply||0)+"</b></div><div><span>Fatigue</span><b>"+Math.floor(a.fatigue||0)+"</b></div></div><div class='g100-grid'><div><span>Spearmen</span><b>"+(a.spearmen||0)+"</b></div><div><span>Archers</span><b>"+(a.archers||0)+"</b></div><div><span>Cavalry</span><b>"+(a.cavalry||0)+"</b></div><div><span>Siege</span><b>"+(a.siege||0)+"</b></div></div><div class='g100-buttons'><button data-u100='spearmen'><b>Train Spearmen</b><span>gold · disciplined defense</span></button><button data-u100='archers'><b>Train Archers</b><span>gold · ranged attack</span></button><button data-u100='cavalry'><b>Train Cavalry</b><span>gold · shock attack</span></button><button data-u100='siege'><b>Build Siege Train</b><span>gold · fort reduction</span></button></div>";
 $("tab-war")?.appendChild(box);box.querySelectorAll("[data-u100]").forEach(b=>b.onclick=()=>upgradeArmy100(b.dataset.u100,120));
}
function renderCampaign100(){
 let box=$("campaign100");if(box)box.remove();box=document.createElement("div");box.id="campaign100";
 const s=S.campaignStats100,hist=S.chronicle100.slice(0,8),ach=Object.keys(S.achievements100).length;
 box.innerHTML="<div class='section-title'>Campaign v1.00</div><div class='g100-grid'><div><span>Years played</span><b>"+(s.months/12).toFixed(1)+"</b></div><div><span>Battles</span><b>"+s.battles+"</b></div><div><span>Wars won</span><b>"+s.warsWon+"</b></div><div><span>Achievements</span><b>"+ach+"</b></div></div><div class='g100-buttons'><button data-c100='easy'>Easy</button><button data-c100='normal'>Normal</button><button data-c100='hard'>Hard</button><button data-c100='ironman'>"+(S.ironman100?"Disable":"Enable")+" Ironman</button></div><div class='section-title'>Map mode</div><div class='g100-buttons'>"+["political","culture","faith","economy","control"].map(m=>"<button data-map100='"+m+"'>"+m+"</button>").join("")+"</div><div class='section-title'>Chronicle</div><div class='g100-history'>"+hist.map(h=>"<div><b>"+h.year+"."+String(h.month).padStart(2,"0")+"</b><span>"+esc(h.text)+"</span></div>").join("")+"</div>";
 $("tab-realm")?.appendChild(box);box.querySelectorAll("[data-c100]").forEach(b=>b.onclick=()=>b.dataset.c100==="ironman"?toggleIronman100():setDifficulty100(b.dataset.c100));box.querySelectorAll("[data-map100]").forEach(b=>b.onclick=()=>mapMode100(b.dataset.map100));
}
function renderCourt(){
 baseRenderCourt100();renderGovernment100();renderCampaign100();
}
function renderRealm(){
 baseRenderRealm100();renderGovernment100();renderEconomy100();renderCampaign100();
}
function renderDiplomacy(){
 baseRenderDiplomacy100();
 let box=$("diplomacy100");if(box)box.remove();box=document.createElement("div");box.id="diplomacy100";
 const foreign=(WORLD.kingdoms||[]).filter(k=>k.holder!==S.rulerId).map(k=>{const v=char(k.holder);if(!v)return "";const rel=diplomacyScore(k.holder);const route=(S.economy100.routes||[]).some(r=>r.a===S.rulerId&&r.b===v.id||r.a===v.id&&r.b===S.rulerId);return "<div class='d100-row'><span><b>"+esc(k.name)+"</b><small>"+esc(v.name)+" · relation "+rel+" · "+aiAgenda100(v)+"</small></span><button data-d100-trade='"+v.id+"'>"+(route?"Trade Active":"Charter Trade")+"</button></div>"}).join("");
 box.innerHTML="<div class='section-title'>Character AI · Strategic diplomacy</div>"+(foreign||"<div class='empty'>No foreign crowns.</div>");$("tab-diplomacy")?.appendChild(box);box.querySelectorAll("[data-d100-trade]").forEach(b=>b.onclick=()=>establishTrade100(b.dataset.d100Trade));
}
function renderDynasty(){
 baseRenderDynasty100();
 let box=$("dynasty100");if(box)box.remove();box=document.createElement("div");box.id="dynasty100";
 const ach=Object.keys(S.achievements100||{}).map(k=>"<span>"+esc(k.replaceAll("_"," "))+"</span>").join("");
 box.innerHTML="<div class='section-title'>Dynastic legacy</div><div class='g100-small'>Government and inheritance decisions now leave persistent political memory. Achievements: "+(ach||"none")+"</div>";
 $("tab-dynasty")?.appendChild(box);
}
function renderWar(){
 baseRenderWar100();renderArmy100();
 let box=$("war100");if(box)box.remove();box=document.createElement("div");box.id="war100";
 const w=S.wars.find(x=>x.kind!=="revolt"),dem=w?S.wars100.demands[w.id]||[]:[];
 box.innerHTML="<div class='section-title'>Peace diplomacy</div>"+(w?"<div class='g100-buttons'><button data-peace100='white_peace'>White Peace</button><button data-peace100='cede'>Cede Target</button><button data-peace100='reparations'>Reparations</button><button data-peace100='release'>Release Prisoners</button></div><div class='g100-small'>Proposed terms: "+(dem.join(", ")||"none")+"</div>":"<div class='empty'>No external war.</div>");
 $("tab-war")?.appendChild(box);box.querySelectorAll("[data-peace100]").forEach(b=>b.onclick=()=>warDemand100(w,b.dataset.peace100));
}
function renderSelected(){baseRenderSelected100()}
function action(a){
 ensure100();
 if(a==="gov_bureaucratic")return govAction100("bureaucratic");
 if(a==="gov_merchant")return govAction100("merchant");
 if(a==="gov_elective")return govAction100("elective");
 if(a==="create_duchy")return titleCreation100("duchy");
 if(a==="create_kingdom")return titleCreation100("kingdom");
 if(a==="loan")return takeRoyalLoan100();
 return baseAction100(a);
}
function saveSilent(){
 ensure100();
 try{baseSave100();localStorage.setItem(SAVE100,JSON.stringify(S))}catch(e){}
}
function reset(){
 localStorage.removeItem(SAVE100);baseReset100();
}
function beginStart45(id){
 localStorage.removeItem(SAVE100);
 return baseBeginStart100?baseBeginStart100(id):false;
}
function monthlyTick(){
 const paused=S.paused;baseMonthly100();if(paused)return;
 ensure100();campaignTick100();S.version=100;saveSilent();
}
function titleHolder(id){return S.titleHolders[id]||title(id)?.holder}
function renderMap(){
 const svg=document.querySelector(".map svg");if(!svg)return;
 baseRenderMap50();
 document.querySelectorAll("#mapRegions polygon").forEach(p=>{const c=county(p.dataset.id);if(c){p.setAttribute("class","region50 "+mapColor100(c)+(c.id===S.selectedCounty?" selected":""))}});
}
ensure100();
try{const raw=localStorage.getItem(SAVE100);if(raw){Object.assign(S,JSON.parse(raw),{version:100});applyWorldState()}}catch(e){}
render();saveSilent();
