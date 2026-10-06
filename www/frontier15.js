// Dynasty Realms v0.15 - Age of Kingdoms
// Large campaign milestone: expanded map, true feudal hierarchy, treaties,
// kingdom claims, regional economy, royal projects and grand AI politics.

const SAVE15="dynasty_realms_save_v15";
const baseMonthlyTick15=monthlyTick;
const baseRenderRealm15=renderRealm;
const baseRenderSelected15=renderSelected;
const baseRenderDiplomacy15=renderDiplomacy;
const baseRenderMap15=renderMap;
const baseSync15=syncWorldState;
const baseEndWar15=endWar;
const baseDeclareWar15=declareWar;
const baseSetTitleHolder15=setTitleHolder;
const baseWarObjectives15=warObjectives;

function addFrontierWorld15(){
  if(!WORLD.kingdoms)WORLD.kingdoms=[];
  if(WORLD.kingdoms.some(k=>k.id==="k_ferrowen"))return;
  WORLD.kingdoms.push({id:"k_ferrowen",name:"Kingdom of Ferrowen",holder:"c_harland",capital:"c_greyfen",tier:"kingdom"});
  WORLD.duchies.push(
    {id:"d_heart",name:"Duchy of the Heartlands",deJure:"Heartlands",capital:"c_greyfen",tier:"duchy"},
    {id:"d_ashen",name:"Duchy of the Ashen Vale",deJure:"Ashen Vale",capital:"c_ashgate",tier:"duchy"},
    {id:"d_isles",name:"Duchy of the Mist Isles",deJure:"Mist Isles",capital:"c_seagard",tier:"duchy"}
  );
  WORLD.counties.push(
    {id:"c_greyfen",name:"Greyfen",duchy:"d_heart",status:"neutral",dev:9,tax:3.0,garrison:190,levy:260,x:760,y:80,points:"700,25 805,18 845,72 815,135 705,120",barony:"Greyfen Hall",fort:2,terrain:"forest"},
    {id:"c_briarhall",name:"Briarhall",duchy:"d_heart",status:"neutral",dev:11,tax:4.1,garrison:250,levy:360,x:850,y:95,points:"805,18 900,12 900,120 815,135 845,72",barony:"Briarhall Castle",fort:3,terrain:"hills"},
    {id:"c_amberfield",name:"Amberfield",duchy:"d_heart",status:"neutral",dev:12,tax:4.6,garrison:280,levy:390,x:790,y:185,points:"705,120 815,135 900,120 890,240 805,255 690,205",barony:"Amberfield Palace",fort:3,terrain:"plains"},
    {id:"c_ashgate",name:"Ashgate",duchy:"d_ashen",status:"neutral",dev:6,tax:1.5,garrison:135,levy:190,x:670,y:485,points:"620,435 720,430 765,485 725,535 640,530",barony:"Ashgate Fort",fort:2,terrain:"mountains"},
    {id:"c_emberfall",name:"Emberfall",duchy:"d_ashen",status:"neutral",dev:8,tax:2.3,garrison:175,levy:235,x:775,y:475,points:"720,430 850,435 845,510 765,535 765,485",barony:"Emberfall Keep",fort:2,terrain:"hills"},
    {id:"c_grimpeak",name:"Grimpeak",duchy:"d_ashen",status:"neutral",dev:7,tax:1.7,garrison:220,levy:250,x:860,y:500,points:"850,435 900,420 900,560 845,510",barony:"Grimpeak Hold",fort:4,terrain:"mountains"},
    {id:"c_seagard",name:"Seagard",duchy:"d_isles",status:"neutral",dev:10,tax:4.0,garrison:220,levy:300,x:755,y:300,points:"690,255 805,255 845,315 795,365 700,340",barony:"Seagard Castle",fort:3,terrain:"coast"},
    {id:"c_mistmoor",name:"Mistmoor",duchy:"d_isles",status:"neutral",dev:8,tax:3.2,garrison:180,levy:240,x:865,y:295,points:"805,255 900,240 900,345 845,315 795,365",barony:"Mistmoor Manor",fort:2,terrain:"coast"}
  );
  const chars={
    c_harland:{id:"c_harland",name:"King Harland",age:47,sex:"m",dynasty:"House Ferren",title:"King of Ferrowen",martial:9,diplomacy:9,stewardship:11,intrigue:7,learning:5,traits:["Ambitious","Diligent"],opinion:6,alive:true,spouse:null,father:null,mother:null,children:[],health:90,fertility:.6,culture:"ferrowic",faith:"old_church"},
    c_elinor:{id:"c_elinor",name:"Duchess Elinor",age:35,sex:"f",dynasty:"House Ferren",title:"Duchess of the Heartlands",martial:6,diplomacy:12,stewardship:10,intrigue:8,learning:8,traits:["Diplomat"],opinion:14,alive:true,spouse:null,father:null,mother:null,children:[],health:96,fertility:.72,culture:"ferrowic",faith:"old_church"},
    c_beric:{id:"c_beric",name:"Duke Beric",age:41,sex:"m",dynasty:"House Draven",title:"Duke of the Ashen Vale",martial:11,diplomacy:6,stewardship:7,intrigue:9,learning:4,traits:["Wrathful","Ambitious"],opinion:-8,alive:true,spouse:null,father:null,mother:null,children:[],health:92,fertility:.61,culture:"ashenfolk",faith:"black_flame"},
    c_nerys:{id:"c_nerys",name:"Duchess Nerys",age:32,sex:"f",dynasty:"House Merrow",title:"Duchess of the Mist Isles",martial:7,diplomacy:10,stewardship:9,intrigue:10,learning:7,traits:["Calm"],opinion:18,alive:true,spouse:null,father:null,mother:null,children:[],health:97,fertility:.76,culture:"islander",faith:"sea_oath"},
    c_fenwick:{id:"c_fenwick",name:"Count Fenwick",age:38,sex:"m",dynasty:"House Fenwick",title:"Count of Briarhall",martial:8,diplomacy:7,stewardship:9,intrigue:6,learning:5,traits:["Content"],opinion:11,alive:true,spouse:null,father:null,mother:null,children:[],health:94,fertility:.66,culture:"ferrowic",faith:"old_church"},
    c_marella:{id:"c_marella",name:"Countess Marella",age:29,sex:"f",dynasty:"House Marell",title:"Countess of Amberfield",martial:5,diplomacy:11,stewardship:12,intrigue:7,learning:8,traits:["Frugal"],opinion:15,alive:true,spouse:null,father:null,mother:null,children:[],health:98,fertility:.79,culture:"ferrowic",faith:"old_church"},
    c_dagan:{id:"c_dagan",name:"Count Dagan",age:44,sex:"m",dynasty:"House Dagan",title:"Count of Emberfall",martial:10,diplomacy:5,stewardship:6,intrigue:8,learning:3,traits:["Craven"],opinion:-4,alive:true,spouse:null,father:null,mother:null,children:[],health:88,fertility:.57,culture:"ashenfolk",faith:"black_flame"},
    c_mera:{id:"c_mera",name:"Countess Mera",age:36,sex:"f",dynasty:"House Mera",title:"Countess of Seagard",martial:6,diplomacy:9,stewardship:10,intrigue:8,learning:9,traits:["Kind"],opinion:20,alive:true,spouse:null,father:null,mother:null,children:[],health:96,fertility:.71,culture:"islander",faith:"sea_oath"},
    c_osric:{id:"c_osric",name:"Count Osric",age:40,sex:"m",dynasty:"House Osric",title:"Count of Mistmoor",martial:7,diplomacy:8,stewardship:8,intrigue:10,learning:5,traits:["Deceitful"],opinion:2,alive:true,spouse:null,father:null,mother:null,children:[],health:93,fertility:.64,culture:"islander",faith:"sea_oath"},
    c_kiera:{id:"c_kiera",name:"Countess Kiera",age:33,sex:"f",dynasty:"House Kiera",title:"Countess of Ashgate",martial:5,diplomacy:10,stewardship:9,intrigue:9,learning:6,traits:["Zealous"],opinion:4,alive:true,spouse:null,father:null,mother:null,children:[],health:95,fertility:.72,culture:"ashenfolk",faith:"black_flame"},
    c_ronan:{id:"c_ronan",name:"Count Ronan",age:45,sex:"m",dynasty:"House Ronan",title:"Count of Grimpeak",martial:12,diplomacy:5,stewardship:6,intrigue:5,learning:3,traits:["Brave"],opinion:-2,alive:true,spouse:null,father:null,mother:null,children:[],health:87,fertility:.52,culture:"ashenfolk",faith:"black_flame"}
  };
  Object.assign(WORLD.characters,chars);
  WORLD.cultures.ferrowic={name:"Ferrowic",group:"Western",heritage:"Valic",description:"A wealthy inland culture centered on guilds, roads and royal bureaucracy."};
  WORLD.cultures.ashenfolk={name:"Ashenfolk",group:"Highland",heritage:"Dornic",description:"A hard frontier culture shaped by mountain clans and fortress towns."};
  WORLD.cultures.islander={name:"Mist Islanders",group:"Maritime",heritage:"Lothic",description:"Seafaring communities built around ports, tolls and merchant houses."};
  WORLD.faiths.black_flame={name:"Black Flame",group:"Reformist",piety:"Zealous",description:"A strict faith that regards conquest and purification as sacred duties."};
  WORLD.faiths.sea_oath={name:"Sea Oath",group:"Maritime",piety:"Balanced",description:"A coastal faith venerating the sea, contracts and ancestral voyages."};
  WORLD.adjacency.c_blackharbor.push("c_greyfen","c_amberfield","c_seagard");
  WORLD.adjacency.c_eastmere.push("c_greyfen","c_seagard");
  WORLD.adjacency.c_greyfen=["c_blackharbor","c_eastmere","c_briarhall","c_amberfield","c_seagard"];
  WORLD.adjacency.c_briarhall=["c_greyfen","c_amberfield"];
  WORLD.adjacency.c_amberfield=["c_greyfen","c_briarhall","c_blackharbor","c_seagard","c_emberfall"];
  WORLD.adjacency.c_seagard=["c_blackharbor","c_eastmere","c_greyfen","c_amberfield","c_mistmoor","c_emberfall"];
  WORLD.adjacency.c_mistmoor=["c_seagard","c_grimpeak"];
  WORLD.adjacency.c_ashgate=["c_emberfall","c_grimpeak"];
  WORLD.adjacency.c_emberfall=["c_ashgate","c_grimpeak","c_seagard","c_amberfield"];
  WORLD.adjacency.c_grimpeak=["c_ashgate","c_emberfall","c_mistmoor"];
  Object.values(chars).forEach(c=>WORLD.characters[c.id]=c);
  const duchyHolders={d_heart:"c_elinor",d_ashen:"c_beric",d_isles:"c_nerys"};
  Object.entries(duchyHolders).forEach(([id,h])=>{const d=duchy(id);if(d)d.holder=h});
  const countyHolders={c_greyfen:"c_harland",c_briarhall:"c_fenwick",c_amberfield:"c_marella",c_ashgate:"c_kiera",c_emberfall:"c_dagan",c_grimpeak:"c_ronan",c_seagard:"c_mera",c_mistmoor:"c_osric"};
  Object.entries(countyHolders).forEach(([id,h])=>{const c=county(id);if(c){c.holder=h;c.control=72;c.siege=0;c.supply=Math.max(60,c.dev*28)}});
  const newTitles=[
    {id:"k_ferrowen",name:"Kingdom of Ferrowen",type:"kingdom",parent:null,holder:"c_harland",deJure:true},
    {id:"d_heart",name:"Duchy of the Heartlands",type:"duchy",parent:"k_ferrowen",holder:"c_elinor",deJure:true},
    {id:"d_ashen",name:"Duchy of the Ashen Vale",type:"duchy",parent:"k_ferrowen",holder:"c_beric",deJure:true},
    {id:"d_isles",name:"Duchy of the Mist Isles",type:"duchy",parent:"k_ferrowen",holder:"c_nerys",deJure:true}
  ];
  newTitles.forEach(t=>{if(!WORLD.titles.some(x=>x.id===t.id))WORLD.titles.push(t)});
  WORLD.counties.filter(c=>c.duchy&&["d_heart","d_ashen","d_isles"].includes(c.duchy)).forEach(c=>{
    if(!WORLD.titles.some(t=>t.id===c.id))WORLD.titles.push({id:c.id,name:"County of "+c.name,type:"county",parent:c.duchy,holder:c.holder,deJure:true});
    if(!WORLD.titles.some(t=>t.id===c.id+"_barony"))WORLD.titles.push({id:c.id+"_barony",name:c.barony,type:"barony",parent:c.id,holder:c.holder,deJure:true});
  });
}

function kingdomOfDuchy15(did){return title(did)?.parent||null}
function kingdomOfCounty15(cid){const c=county(cid);return c?kingdomOfDuchy15(c.duchy):null}
function primaryCounty15(id){return WORLD.counties.find(c=>c.holder===id)||null}
function holderOf15(titleId){return titleHolder(titleId)}
function liegeOfCounty15(c){
  if(!c)return null;
  const dh=holderOf15(c.duchy);
  if(!dh)return null;
  if(dh!==c.holder)return dh;
  const k=kingdomOfDuchy15(c.duchy);
  return k?holderOf15(k):null;
}
function titleChainForHolder15(id){
  const c=primaryCounty15(id);
  if(c)return {titleId:c.id,tier:"county",liege:liegeOfCounty15(c)};
  const d=WORLD.duchies.find(x=>holderOf15(x.id)===id);
  if(d)return {titleId:d.id,tier:"duchy",liege:holderOf15(d.parent)};
  const k=WORLD.kingdoms?.find(x=>x.holder===id);
  if(k)return {titleId:k.id,tier:"kingdom",liege:null};
  return null;
}
function countyLiege(c){return liegeOfCounty15(c)}
function isPlayerVassal(id){
  if(!id)return false;if(id===S.rulerId)return true;
  let cur=id,guard=0;
  while(cur&&guard++<8){
    const info=titleChainForHolder15(cur);if(!info)return false;
    cur=info.liege;if(cur===S.rulerId)return true;
  }
  return false;
}
function directVassalCharacters(){
  const ids=new Set();
  WORLD.duchies.forEach(d=>{
    const h=holderOf15(d.id);if(h&&h!==S.rulerId&&holderOf15(d.parent)===S.rulerId)ids.add(h);
  });
  WORLD.counties.forEach(c=>{
    const h=c.holder;if(h&&h!==S.rulerId&&liegeOfCounty15(c)===S.rulerId)ids.add(h);
  });
  return [...ids].map(char).filter(v=>v&&v.alive);
}
function ownedCounties(){return WORLD.counties.filter(c=>c.status==="yours"&&isPlayerVassal(c.holder))}
function realmCounties15(holder){return WORLD.counties.filter(c=>c.holder===holder||isDescendantOfHolder15(c.holder,holder))}
function isDescendantOfHolder15(id,root){
  if(!id||id===root)return false;let cur=id,guard=0;
  while(cur&&guard++<8){const info=titleChainForHolder15(cur);if(!info)return false;cur=info.liege;if(cur===root)return true}
  return false;
}
function realmPower15(holder){
  return realmCounties15(holder).reduce((n,c)=>n+c.levy*.75+c.garrison*.55,0)+(char(holder)?.martial||5)*80;
}
function controlledDuchies15(holder){
  return WORLD.duchies.filter(d=>holderOf15(d.id)===holder||WORLD.counties.some(c=>c.duchy===d.id&&isDescendantOfHolder15(c.holder,holder)));
}
function kingdomStats15(kid){
  const kd=title(kid);if(!kd)return null;
  const ds=WORLD.duchies.filter(d=>d.parent===kid);
  const counties=ds.flatMap(d=>WORLD.counties.filter(c=>c.duchy===d.id));
  const holder=holderOf15(kid);
  return {id:kid,name:kd.name,holder,counties,duchies:ds,power:Math.floor(realmPower15(holder)),dev:counties.reduce((n,c)=>n+c.dev,0),prosperity:counties.length?counties.reduce((n,c)=>n+realmProsperity(c),0)/counties.length:0};
}

function ensureCampaignState15(){
  S.truces=S.truces&&typeof S.truces==="object"?S.truces:{};
  S.nonAggression=S.nonAggression&&typeof S.nonAggression==="object"?S.nonAggression:{};
  S.kingdomClaims=S.kingdomClaims&&typeof S.kingdomClaims==="object"?S.kingdomClaims:{};
  S.royalProjects=S.royalProjects&&typeof S.royalProjects==="object"?S.royalProjects:{};
  S.dynastyRenown=Number.isFinite(S.dynastyRenown)?S.dynastyRenown:120;
  S.campaignStats=S.campaignStats&&typeof S.campaignStats==="object"?S.campaignStats:{warsWon:0,countiesConquered:0,duchiesConquered:0,yearsRuled:0};
  S.season=S.season||((S.month<=3)?"Winter":(S.month<=6)?"Spring":(S.month<=9)?"Summer":"Autumn");
}
function treatyKey15(a,b){return [a,b].sort().join("|")}
function hasTruce15(a,b){
  const x=S.truces[treatyKey15(a,b)];return x&&x.until>(S.year*12+S.month);
}
function hasNAP15(a,b){
  const x=S.nonAggression[treatyKey15(a,b)];return x&&x.until>(S.year*12+S.month);
}
function diplomacyTarget15(id){return char(id)}
function makeTruce15(a,b,months=24,score=0){
  if(!a||!b||a===b)return;
  S.truces[treatyKey15(a,b)]={a,b,until:S.year*12+S.month+months,score};
}
function offerNAP15(id){
  const v=diplomacyTarget15(id);if(!v||v.id===S.rulerId)return;
  if(hasNAP15(S.rulerId,id))return toast("Non-aggression pact already active");
  if(externalWars().length)return toast("Cannot negotiate during war");
  if(S.prestige<10)return toast("Need 10 prestige");
  if(diplomacyScore(id)<45)return toast("They refuse the pact");
  S.prestige-=10;S.nonAggression[treatyKey15(S.rulerId,id)]={a:S.rulerId,b:id,until:S.year*12+S.month+30};
  S.relations[id]=clamp(opinion(id)+6,-100,100);log("A non-aggression pact was signed with "+v.name+".","court");toast("Pact signed");render();saveSilent();
}
function breakNAP15(id){
  const k=treatyKey15(S.rulerId,id);delete S.nonAggression[k];S.relations[id]=clamp(opinion(id)-12,-100,100);S.stress=clamp(S.stress+3,0,100);log("The crown broke its pact with "+(char(id)?.name||"a foreign ruler")+".","court");render();saveSilent();
}
function setTitleHolder(id,h){
  baseSetTitleHolder15(id,h);
  const c=county(id);
  if(c)c.status=isPlayerVassal(h)?"yours":kingdomOfCounty15(id)?"rival":"neutral";
}
function kingdomObjectives15(kid){
  return WORLD.duchies.filter(d=>d.parent===kid).flatMap(d=>WORLD.counties.filter(c=>c.duchy===d.id));
}
function warObjectives(w){
  if(w?.goal==="claim_kingdom"&&w.targetKingdom)return kingdomObjectives15(w.targetKingdom);
  return baseWarObjectives15(w);
}
function declareKingdomWar15(kid){
  const k=kingdomStats15(kid),holder=k&&k.holder;
  if(!k||!holder||holder===S.rulerId)return toast("Invalid kingdom target");
  if(!S.kingdomClaims?.[kid])return toast("Need a valid kingdom claim");
  if(hasTruce15(S.rulerId,holder)||hasNAP15(S.rulerId,holder))return toast(hasNAP15(S.rulerId,holder)?"The pact blocks this war":"A truce is still active");
  if(externalWars().filter(w=>warHasPlayer(w)).length>=2)return toast("Too many external wars");
  const adjacent=k.counties.some(t=>ownedCounties().some(pc=>(WORLD.adjacency[pc.id]||[]).includes(t.id)));
  if(!adjacent)return toast("Your realm has no border with this kingdom");
  const now=S.year*12+S.month;
  const power=Math.max(300,Math.floor(realmPower15(S.rulerId)*.7));
  const w={id:"w_kingclaim_"+now.toString(36)+Math.floor(Math.random()*99),kind:"external",attacker:S.rulerId,defender:holder,name:"War for "+k.name,target:k.counties[0]?.id||null,targetKingdom:kid,goal:"claim_kingdom",score:0,months:0,siege:0,enemy:Math.floor(realmPower15(holder)*.8),battles:0,fronts:{},claimWar:true};
  k.counties.forEach(c=>w.fronts[c.id]={siege:0});
  S.wars.push(w);S.prestige=Math.max(0,S.prestige-40);log("The crown invoked its claim to "+k.name+".","war");toast("Kingdom claim war declared");render();saveSilent();
}
function kingdomClaim15(kid){
  const k=kingdomStats15(kid);if(!k||k.holder===S.rulerId)return toast("Invalid kingdom target");
  if(S.kingdomClaims[kid])return toast("You already have a kingdom claim");
  if(S.prestige<220)return toast("Need 220 prestige");
  if(ownedCounties().length<8||controlledDuchies15(S.rulerId).length<2)return toast("Need 8 counties and 2 duchies");
  S.prestige-=220;S.kingdomClaims[kid]={year:S.year,claimant:S.rulerId};
  log("The court proclaimed a dynastic claim to "+k.name+".","dynasty");toast("Kingdom claim created");render();saveSilent();
}
function royalProject15(id,type){
  const c=county(id);if(!c||!isPlayerVassal(c.holder))return toast("This county is outside your realm");
  if(S.royalProjects[id])return toast("A project is already underway");
  const costs={road:35,harbor:55,fortress:70},cost=costs[type]||35;
  if(S.gold<cost)return toast("Need "+cost+" gold");
  if(type==="harbor"&&c.terrain!=="coast")return toast("Harbor projects require a coastal county");
  S.gold-=cost;S.royalProjects[id]={type,progress:0,started:S.year*12+S.month};
  log("Royal engineers began a "+type+" project in "+c.name+".","court");toast("Project started");render();saveSilent();
}
function processProjects15(){
  Object.entries(S.royalProjects||{}).forEach(([id,p])=>{
    const c=county(id);if(!c){delete S.royalProjects[id];return}
    const skill=char(S.council.steward)?.stewardship||6;
    p.progress+=Math.max(5,skill*.7+(p.type==="harbor"&&c.terrain==="coast"?2:0));
    if(p.progress<100)return;
    if(p.type==="road"){c.tax+=.45;c.control=clamp(c.control+7,0,100);c.prosperity=clamp(realmProsperity(c)+8,0,100)}
    if(p.type==="harbor"){c.tax+=.8;c.levy+=55;c.prosperity=clamp(realmProsperity(c)+10,0,100)}
    if(p.type==="fortress"){c.garrison+=150;c.fort=Math.min(7,(c.fort||1)+2);c.control=clamp(c.control+10,0,100)}
    delete S.royalProjects[id];S.prestige+=12;S.dynastyRenown+=8;log("The "+p.type+" project in "+c.name+" was completed.","court");toast("Project completed");
  });
}
function regionalEconomy15(){
  WORLD.counties.forEach(c=>{
    if(c.status!=="yours"&&c.status!=="neutral")return;
    const p=realmProsperity(c),coastalBonus=c.terrain==="coast"?1.8:0,market=(c.buildings?.market||0)*.35;
    if(p>78&&Math.random()<.018){c.tax+=.05;c.prosperity=clamp(p+1.5,0,100);log("Trade flourished in "+c.name+".","court")}
    if(p<32&&Math.random()<.022){c.tax=Math.max(.3,c.tax-.06);c.levy=Math.max(50,c.levy-8);c.control=clamp(c.control-1,0,100);log("Bad harvests struck "+c.name+".","court")}
    if(coastalBonus&&market&&Math.random()<.025){S.gold+=Math.round(coastalBonus+market);S.dynastyRenown+=1}
  });
}
function aiKingdomPolitics15(){
  const now=S.year*12+S.month;
  (WORLD.kingdoms||[]).filter(k=>k.holder&&k.holder!==S.rulerId).forEach(k=>{
    const king=char(holderOf15(k.id));if(!king?.alive)return;
    const stats=kingdomStats15(k.id);if(!stats)return;
    S.aiKingdomPlans=S.aiKingdomPlans&&typeof S.aiKingdomPlans==="object"?S.aiKingdomPlans:{};
    const targetable=WORLD.counties.filter(c=>c.holder!==king.id&&
      (WORLD.adjacency[c.id]||[]).some(id=>WORLD.counties.find(x=>x.id===id&&isDescendantOfHolder15(x.holder,king.id))));
    const target=targetable.sort((a,b)=>(b.dev+b.tax*2)-(a.dev+a.tax*2))[0];
    const plan=S.aiKingdomPlans[king.id]||{goal:(king.traits||[]).includes("Ambitious")?"expand":"consolidate",target:null};
    if(target&&plan.goal==="expand"&&Math.random()<.1)plan.target=target.id;
    S.aiKingdomPlans[king.id]=plan;
    if(plan.target&&S.month%4===0&&Math.random()<.2){
      const t=county(plan.target);
      if(t&&t.holder!==king.id&&!hasTruce15(king.id,t.holder)&&!hasNAP15(king.id,t.holder)&&diplomacyScore(t.holder)>=0){
        if(!S.wars.some(w=>w.kind!=="revolt"&&(w.attacker===king.id||w.defender===king.id))&&realmPower15(king.id)>realmPower15(t.holder)*1.12){
          S.wars.push({id:"w_king_"+now.toString(36)+Math.floor(Math.random()*99),kind:"external",attacker:king.id,defender:t.holder,name:"War for "+t.name,target:t.id,targetDuchy:t.duchy,goal:"conquest_county",score:0,months:0,siege:0,enemy:Math.floor(realmPower15(king.id)*.72),battles:0,fronts:{[t.id]:{siege:0}},aiWar:true});
          log(king.name+" launched a royal war for "+t.name+".","war");
        }
      }
    }
  });
}
function processTreaties15(){
  const now=S.year*12+S.month;
  Object.keys(S.truces||{}).forEach(k=>{if(S.truces[k].until<=now)delete S.truces[k]});
  Object.keys(S.nonAggression||{}).forEach(k=>{if(S.nonAggression[k].until<=now)delete S.nonAggression[k]});
}
function tickRenown15(){S.dynastyRenown=clamp(S.dynastyRenown+(S.year>1066&&S.month===1?2:0),0,10000)}
function renderCampaignLedger15(){
  let box=$("campaignLedger15");if(box)box.remove();
  box=document.createElement("div");box.id="campaignLedger15";
  const kingdoms=(WORLD.kingdoms||[]).map(k=>kingdomStats15(k.id)).filter(Boolean).map(k=>"<div class='kingdom-row15'><span><b>"+esc(k.name)+"</b><small>"+esc(char(k.holder)?.name||"Vacant")+" · "+k.duchies.length+" duchies · "+k.counties.length+" counties</small></span><span>"+Math.floor(k.power)+" power</span></div>").join("");
  const p=Object.keys(S.royalProjects||{}).map(id=>{const x=S.royalProjects[id],c=county(id);return c?"<div class='project-row15'><span>"+esc(c.name)+"</span><b>"+esc(x.type)+" · "+Math.round(x.progress)+"%</b></div>":""}).join("");
  const claims=(WORLD.kingdoms||[]).filter(k=>holderOf15(k.id)!==S.rulerId).map(k=>{
    const claimed=!!S.kingdomClaims?.[k.id];
    return claimed?"<button class='order-btn kingdom-claim-btn15' data-kwar15='"+k.id+"'><b>Press claim: "+esc(k.name)+"</b><span>Launch kingdom war · entire de jure realm</span></button>":"<button class='order-btn kingdom-claim-btn15' data-kclaim15='"+k.id+"'><b>Forge claim: "+esc(k.name)+"</b><span>220 prestige · requires 8 counties + 2 duchies</span></button>";
  }).join("");
  box.innerHTML="<div class='section-title'>Kingdom ledger</div>"+(kingdoms||"<div class='empty'>No kingdoms recorded.</div>")+"<div class='section-title'>Royal claims</div>"+(claims||"<div class='empty'>No eligible kingdom claims.</div>")+"<div class='section-title'>Dynasty renown</div><div class='renown-row15'><b>"+Math.floor(S.dynastyRenown)+"</b><span>House prestige · wars won "+(S.campaignStats.warsWon||0)+" · counties gained "+(S.campaignStats.countiesConquered||0)+"</span></div><div class='section-title'>Royal projects</div>"+(p||"<div class='empty'>No projects underway.</div>");
  const realm=$("tab-realm");if(realm)realm.appendChild(box);
  document.querySelectorAll("[data-kclaim15]").forEach(b=>b.onclick=()=>kingdomClaim15(b.dataset.kclaim15));
  document.querySelectorAll("[data-kwar15]").forEach(b=>b.onclick=()=>declareKingdomWar15(b.dataset.kwar15));
}
function renderRealm(){
  baseRenderRealm15();
  renderCampaignLedger15();
}
function renderSelected(){
  baseRenderSelected15();
  const c=county(S.selectedCounty);if(!c||c.status!=="yours")return;
  let box=$("frontierActions15");if(box)box.remove();
  box=document.createElement("div");box.id="frontierActions15";box.className="action-grid";
  const project=S.royalProjects[c.id];
  const buttons=[];
  if(!project)buttons.push("<button class='action-btn' data-project15='road'><b>Build Royal Road</b><span>-35 gold · +trade/control</span></button>");
  if(!project&&c.terrain==="coast")buttons.push("<button class='action-btn' data-project15='harbor'><b>Build Royal Harbor</b><span>-55 gold · +tax/levy</span></button>");
  if(!project)buttons.push("<button class='action-btn' data-project15='fortress'><b>Build Royal Fortress</b><span>-70 gold · +garrison</span></button>");
  if(project)buttons.push("<div class='identity-detail'><b>Royal project:</b> "+esc(project.type)+" · "+Math.round(project.progress)+"%</div>");
  box.innerHTML=buttons.join("");
  const target=$("holdingsSummary");target?.parentElement?.appendChild(box);
  document.querySelectorAll("[data-project15]").forEach(b=>b.onclick=()=>royalProject15(c.id,b.dataset.project15));
}
function renderMap(){
  baseRenderMap15();
  const labels=$("mapLabels");if(labels){
    (WORLD.kingdoms||[]).forEach(k=>{
      const s=kingdomStats15(k.id);if(!s)return;
      const pts=s.counties;const cx=pts.reduce((n,c)=>n+c.x,0)/(pts.length||1),cy=pts.reduce((n,c)=>n+c.y,0)/(pts.length||1);
      const fill=s.holder===S.rulerId?"<text class='kingdom-label15' x='"+cx+"' y='"+(cy-18)+"'>"+esc(k.name.replace("Kingdom of ",""))+"</text>":"";
      labels.innerHTML+=fill;
    });
  }
}
function renderDiplomacy(){
  baseRenderDiplomacy15();
  let box=$("treaties15");if(box)box.remove();
  box=document.createElement("div");box.id="treaties15";
  const allies=(S.alliances||[]).filter(a=>a.a===S.rulerId||a.b===S.rulerId).map(a=>a.a===S.rulerId?a.b:a.a);
  const naps=Object.values(S.nonAggression||{}).filter(x=>x.a===S.rulerId||x.b===S.rulerId).map(x=>x.a===S.rulerId?x.b:x.a);
  const truces=Object.values(S.truces||{}).filter(x=>x.a===S.rulerId||x.b===S.rulerId).map(x=>x.a===S.rulerId?x.b:x.a);
  const targetRows=notableRulers().filter(v=>v.id!==S.rulerId).map(v=>{
    const pact=hasNAP15(S.rulerId,v.id),truce=hasTruce15(S.rulerId,v.id);
    const kingdom=(WORLD.kingdoms||[]).find(k=>holderOf15(k.id)===v.id);
    const claim=kingdom&&(S.kingdomClaims||{})[kingdom.id];
    const btn=!pact&&!truce?"<button class='mini-btn' data-nap15='"+v.id+"'>NAP</button>":pact?"<button class='mini-btn' data-breaknap15='"+v.id+"'>Break</button>":"";
    return "<div class='treaty-row15'><span><b>"+esc(v.name)+"</b><small>"+(kingdom?esc(kingdom.name)+" · ":"")+(pact?"Non-aggression pact · ":"")+(truce?"Truce · ":"")+(claim?"Kingdom claim active":"")+"</small></span><span>"+Math.round(opinion(v.id))+" "+btn+"</span></div>";
  }).join("");
  box.innerHTML="<div class='section-title'>Treaties & claims</div>"+(targetRows||"<div class='empty'>No foreign treaties.</div>")+"<div class='treaty-summary15'>Alliances "+allies.length+" · NAPs "+naps.length+" · Truces "+truces.length+"</div><div class='section-title'>Kingdom claims</div>"+Object.keys(S.kingdomClaims||{}).map(k=>{const t=kingdomStats15(k);return t?"<div class='treaty-row15'><span>"+esc(t.name)+"</span><b>Claim</b></div>":""}).join("");
  $("tab-diplomacy").appendChild(box);
  document.querySelectorAll("[data-nap15]").forEach(b=>b.onclick=()=>offerNAP15(b.dataset.nap15));
  document.querySelectorAll("[data-breaknap15]").forEach(b=>b.onclick=()=>breakNAP15(b.dataset.breaknap15));
}
function declareWar(goal){
  const c=county(S.selectedCounty),targetHolder=c&&c.holder;
  if(targetHolder&&targetHolder!==S.rulerId&&(hasTruce15(S.rulerId,targetHolder)||hasNAP15(S.rulerId,targetHolder)))return toast(hasNAP15(S.rulerId,targetHolder)?"The pact blocks this war":"A truce is still active");
  return baseDeclareWar15(goal);
}
function endWar(w,result){
  const before=S.wars.includes(w);
  const out=baseEndWar15(w,result);
  if(before&&(result==="victory"||result==="defeat"||result==="white_peace")){
    if(w.attacker===S.rulerId||w.defender===S.rulerId){
      const other=w.attacker===S.rulerId?w.defender:w.attacker;
      if(other){makeTruce15(S.rulerId,other,result==="victory"?30:18,result==="victory"?40:-20);}
      if(result==="victory"){
        S.campaignStats.warsWon=(S.campaignStats.warsWon||0)+1;
        const objs=warObjectives(w);S.campaignStats.countiesConquered=(S.campaignStats.countiesConquered||0)+objs.filter(Boolean).length;
        S.dynastyRenown+=w.goal==="claim_duchy"?35:18;
      }
    }
  }
  return out;
}
function monthlyTick(){
  const wasPaused=S.paused;
  baseMonthlyTick15();
  if(wasPaused)return;
  ensureCampaignState15();
  processProjects15();regionalEconomy15();aiKingdomPolitics15();processTreaties15();tickRenown15();
  S.campaignStats.yearsRuled=S.campaignStats.yearsRuled||0;
  if(S.month===1)S.campaignStats.yearsRuled++;
  render();saveSilent();
}
function syncWorldState(){
  baseSync15();S.version=15;
  S.countyState=S.countyState||{};
  WORLD.counties.forEach(c=>{if(S.countyState[c.id]){S.countyState[c.id].kingdom=kingdomOfCounty15(c.id);S.countyState[c.id].prosperity=realmProsperity(c)}});
}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE15,JSON.stringify(S))}catch(e){}}
function reset(){[SAVE15,"dynasty_realms_save_v14","dynasty_realms_save_v13","dynasty_realms_save_v12","dynasty_realms_save_v11","dynasty_realms_save_v10","dynasty_realms_save_v09","dynasty_realms_save_v08"].forEach(k=>localStorage.removeItem(k));location.reload()}
function load15(){
  addFrontierWorld15();
  try{
    const raw=localStorage.getItem(SAVE15)||localStorage.getItem("dynasty_realms_save_v14")||localStorage.getItem("dynasty_realms_save_v13")||localStorage.getItem("dynasty_realms_save_v12");
    if(raw){Object.assign(S,JSON.parse(raw),{version:15});applyWorldState();}
  }catch(e){}
  WORLD.counties.forEach(c=>{
    c.control=c.control??72;c.siege=c.siege??0;c.supply=c.supply??Math.max(60,c.dev*28);c.buildings=c.buildings||{farm:0,market:0,walls:0};
    if(!S.countyState[c.id])S.countyState[c.id]={holder:c.holder,status:c.status,dev:c.dev,tax:c.tax,garrison:c.garrison,levy:c.levy,control:c.control,siege:c.siege,culture:c.culture,faith:c.faith,fort:c.fort,buildings:c.buildings};
  });
  WORLD.counties.forEach(c=>{c.status=isPlayerVassal(c.holder)?"yours":kingdomOfCounty15(c.id)?"rival":"neutral"});
  ensureCampaignState15();S.version=15;saveSilent();render();
}

load15();
