// Dynasty Realms v0.11 - living political world and AI realm politics

const SAVE11="dynasty_realms_save_v11";
const baseMonthlyTick11=monthlyTick;
const baseRenderDiplomacy11=renderDiplomacy;
const baseSync11=syncWorldState;
const baseReset11=reset;

function initPolitics11(){
  if(!S.aiPlans||typeof S.aiPlans!=="object")S.aiPlans={};
  if(!S.aiClaims||typeof S.aiClaims!=="object")S.aiClaims={};
  if(!S.aiTreasury||typeof S.aiTreasury!=="object")S.aiTreasury={};
  if(!S.politicalLog||!Array.isArray(S.politicalLog))S.politicalLog=[];
  WORLD.characters && Object.values(WORLD.characters).forEach(v=>{
    if(v.alive&&v.id!==S.rulerId){
      S.aiTreasury[v.id]=S.aiTreasury[v.id]??(80+(v.stewardship||5)*8);
      S.aiClaims[v.id]=Array.isArray(S.aiClaims[v.id])?S.aiClaims[v.id]:[];
    }
  });
}
function aiRulers11(){return notableRulers().filter(v=>v.alive&&v.id!==S.rulerId)}
function aiRealmPower11(v){
  const land=WORLD.counties.filter(c=>c.holder===v.id);
  return Math.floor(land.reduce((n,c)=>n+c.levy*prosperityLevyFactor(c)+c.garrison*.65,0)+(v.martial||5)*70);
}
function aiNeighbours11(v){
  const seen=new Set(),out=[];
  WORLD.counties.filter(c=>c.holder===v.id).forEach(c=>(WORLD.adjacency[c.id]||[]).forEach(id=>{
    const x=county(id);if(x&&x.holder!==v.id&&!seen.has(x.id)){seen.add(x.id);out.push(x)}
  }));
  return out;
}
function aiAttitude11(v,target){
  const o=target===S.rulerId?opinion(target):(char(target)?.opinion||0);
  return o<=-40?"Hostile":o<0?"Suspicious":o<40?"Neutral":"Friendly";
}
function aiPlan11(v){
  const p=S.aiPlans[v.id];
  if(p&&p.target&&county(p.target))return p;
  const agenda=aiAgendaFor(v),choices=aiNeighbours11(v).filter(c=>c.holder!==v.id);
  let target=null;
  if(agenda==="consolidate")target=WORLD.counties.filter(c=>c.holder===v.id).sort((a,b)=>b.dev-a.dev)[0];
  else target=choices.sort((a,b)=>(b.dev+b.levy*.01)-(a.dev+a.levy*.01))[0]||null;
  const next={goal:agenda,target:target?.id||null,started:S.year*12+S.month};
  S.aiPlans[v.id]=next;return next;
}
function aiCanDeclare11(v,target){
  if(!target||target.holder===v.id||countyWarBusy(target.id))return false;
  if(S.wars.some(w=>w.kind!=="revolt"&&(w.attacker===v.id||w.defender===v.id)))return false;
  const power=aiRealmPower11(v),def=target.levy+target.garrison*.8+((char(target.holder)?.martial||5)*55);
  return power>Math.max(300,def*1.12);
}
function aiCreateClaim11(v,target){
  if(!target||target.holder===v.id)return false;
  S.aiClaims[v.id]=S.aiClaims[v.id]||[];
  if(S.aiClaims[v.id].includes(target.id))return true;
  S.aiClaims[v.id].push(target.id);
  log(v.name+" secured a claim on "+target.name+".","court");
  return true;
}
function aiDeclareWar11(v,target){
  if(!aiCanDeclare11(v,target))return false;
  const claims=S.aiClaims[v.id]||[];
  const hasClaim=claims.includes(target.id);
  if(!hasClaim&&!((v.traits||[]).includes("Ambitious")&&Math.random()<.35))return false;
  const defender=target.holder;
  const w={id:"w_ai11_"+Date.now().toString(36)+Math.floor(Math.random()*99),kind:"external",attacker:v.id,defender,name:"War for "+target.name,target:target.id,targetDuchy:null,goal:"conquest_county",score:0,months:0,siege:0,enemy:Math.floor(aiRealmPower11(v)*.72),battles:0,fronts:{[target.id]:{siege:0}},aiWar:true};
  S.wars.push(w);S.politicalLog.unshift({year:S.year,month:S.month,text:v.name+" declared war on "+(char(defender)?.name||"the holder")+" for "+target.name});
  S.politicalLog=S.politicalLog.slice(0,20);
  S.aiPlans[v.id]={goal:"war",target:target.id,started:S.year*12+S.month};
  log(v.name+" declared war for "+target.name+".","war");
  return true;
}
function processAIWar11(w){
  if(!w.aiWar||w.kind==="revolt")return false;
  const t=county(w.target);if(!t)return false;
  if(w.attacker===S.rulerId||w.defender===S.rulerId)return false;
  w.months++;
  const attacker=char(w.attacker),attPower=aiRealmPower11(attacker||{}),defPower=(t.levy+t.garrison*.8)+((char(w.defender)?.martial||5)*55);
  const ratio=attPower/Math.max(1,defPower);
  w.score+=clamp((ratio-1)*12,-7,11);
  const gain=clamp(2.5+ratio*2.6,1,11);
  w.fronts[t.id]=w.fronts[t.id]||{siege:0};
  w.fronts[t.id].siege=clamp((w.fronts[t.id].siege||0)+(w.score>0?gain:gain*.55),0,100);
  t.siege=w.fronts[t.id].siege;
  if(w.fronts[t.id].siege>=100){
    setTitleHolder(t.id,w.attacker);t.control=clamp(t.control-12,0,100);t.occupiedBy=null;t.occupationWar=null;
    S.aiClaims[w.attacker]=(S.aiClaims[w.attacker]||[]).filter(id=>id!==t.id);
    log(attacker.name+" conquered "+t.name+".","war");
    S.wars=S.wars.filter(x=>x.id!==w.id);
    return true;
  }
  if(w.months>18&&w.score<-20){
    S.wars=S.wars.filter(x=>x.id!==w.id);log(attacker.name+" abandoned the campaign for "+t.name+".","war");return true;
  }
  return true;
}
function aiPoliticalTick11(){
  const ais=aiRulers11();
  ais.forEach(v=>{
    const treasury=v.id===S.rulerId?S.gold:(S.aiTreasury[v.id]||100);
    S.aiTreasury[v.id]=clamp(treasury+realmTaxAI11(v)*.8,0,5000);
    const plan=aiPlan11(v),agenda=aiAgendaFor(v);
    if(agenda==="diplomacy"&&Math.random()<.08){
      const candidate=ais.find(x=>x.id!==v.id&&!isAllied(v.id,x.id)&&opinionForAI(v.id,x.id)>=10);
      if(candidate)S.alliances.push({a:v.id,b:candidate.id,year:S.year});
    }
    if(agenda!=="consolidate"&&plan?.target){
      const target=county(plan.target);
      if(target&&target.holder!==v.id){
        const claims=S.aiClaims[v.id]||[];
        if(!claims.includes(target.id)&&Math.random()<.22)aiCreateClaim11(v,target);
        if((S.month===3||S.month===9)&&Math.random()<.4)aiDeclareWar11(v,target);
      }
    }
    if(agenda==="consolidate"){
      WORLD.counties.filter(c=>c.holder===v.id).forEach(c=>{
        if(S.aiTreasury[v.id]>45&&Math.random()<.08){S.aiTreasury[v.id]-=25;c.control=clamp(c.control+3,0,100);c.prosperity=clamp(realmProsperity(c)+2,0,100)}
      });
    }
    if(v.age>=55&&Math.random()<.04){
      const heir=(v.children||[]).map(char).filter(x=>x?.alive).sort((a,b)=>a.age-b.age)[0];
      if(heir&&Math.random()<.3)log(v.name+" began preparing "+heir.name+" for succession.","dynasty");
    }
    const unmarried=ais.filter(x=>x.age>=16&&x.age<55&&!x.spouse&&x.id!==v.id&&validMarriage(v,x));
    if(v.age>=16&&v.age<55&&!v.spouse&&unmarried.length&&Math.random()<.025)arrangeAIMarriage11(v,unmarried[0]);
  });
}
function realmTaxAI11(v){
  if(!v)return 0;
  return WORLD.counties.filter(c=>c.holder===v.id).reduce((n,c)=>n+c.tax*(c.dev/7)*(.6+c.control/160)*prosperityTaxFactor(c),0);
}
function arrangeAIMarriage11(a,b){
  if(!validMarriage(a,b))return false;
  a.spouse=b.id;b.spouse=a.id;S.marriages.push({a:a.id,b:b.id,year:S.year});
  S.politicalLog.unshift({year:S.year,month:S.month,text:a.name+" married "+b.name+"."});
  S.politicalLog=S.politicalLog.slice(0,20);
  log(a.name+" entered a dynastic marriage with "+b.name+".","dynasty");
  return true;
}
function renderDiplomacy(){
  baseRenderDiplomacy11();
  const old=document.getElementById("worldPolitics");
  if(old)old.remove();
  const box=document.createElement("div");box.id="worldPolitics";
  const rows=aiRulers11().map(v=>{
    const p=aiPlan11(v),power=aiRealmPower11(v),claims=(S.aiClaims[v.id]||[]).map(county).filter(Boolean);
    const tgt=p?.target?county(p.target):null;
    return "<div class='politics-row'><div><b>"+esc(v.name)+"</b><small>"+esc(v.title)+" · "+esc(aiAttitude11(v,S.rulerId))+" · power "+power+"</small></div><div class='politics-plan'><span>"+esc(p?.goal||"idle")+"</span>"+(tgt?"<small>Target: "+esc(tgt.name)+"</small>":"")+"<small>"+(claims.length?"Claims: "+claims.map(c=>esc(c.name)).join(", "):"No active claims")+"</small></div></div>";
  }).join("");
  const wars=S.wars.filter(w=>w.kind!=="revolt"&&w.attacker!==S.rulerId&&w.defender!==S.rulerId);
  const warRows=wars.map(w=>"<div class='politics-war'><b>"+esc(w.name)+"</b><span>"+esc(char(w.attacker)?.name||"Unknown")+" → "+esc(char(w.defender)?.name||"Unknown")+" · "+w.months+" mo</span></div>").join("");
  box.innerHTML="<div class='section-title'>World politics</div>"+(rows||"<div class='empty'>No major foreign courts are known.</div>")+"<div class='section-title'>Foreign wars</div>"+(warRows||"<div class='empty'>No foreign wars are currently being fought.</div>");
  $("tab-diplomacy").appendChild(box);
}
function syncWorldState(){baseSync11();S.version=11}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE11,JSON.stringify(S))}catch(e){}}
function reset(){baseReset11();localStorage.removeItem(SAVE11);localStorage.removeItem("dynasty_realms_save_v10");location.reload()}
function monthlyTick(){
  const wasPaused=S.paused;
  baseMonthlyTick11();
  if(wasPaused)return;
  aiPoliticalTick11();
  S.wars.slice().forEach(w=>processAIWar11(w));
  render();saveSilent();
}
initPolitics11();render();saveSilent();
