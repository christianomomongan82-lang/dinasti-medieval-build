// Dynasty Realms v0.14 - culture, faith, conversion and unrest

const SAVE14="dynasty_realms_save_v14";
const baseMonthlyTick14=monthlyTick;
const baseRenderSelected14=renderSelected;
const baseSync14=syncWorldState;
const baseReset14=reset;
const baseEndWar14=endWar;
const LEGACY_MONTHLY_WAR14=monthlyWar;

function load14(){
  try{
    const raw=localStorage.getItem(SAVE14)||localStorage.getItem("dynasty_realms_save_v13")||localStorage.getItem("dynasty_realms_save_v12")||localStorage.getItem("dynasty_realms_save_v11")||localStorage.getItem("dynasty_realms_save_v10");
    if(raw){Object.assign(S,JSON.parse(raw),{version:14});applyWorldState();}
  }catch(e){}
  S.version=14;
  S.conversionProjects=S.conversionProjects&&typeof S.conversionProjects==="object"?S.conversionProjects:{};
  S.culturalUnrest=S.culturalUnrest&&typeof S.culturalUnrest==="object"?S.culturalUnrest:{};
}
function countyIdentityPressure14(c){
  if(!c||c.status!=="yours")return 0;
  const r=ruler();if(!r)return 0;
  let p=0;
  if(c.culture!==r.culture)p+=35;
  if(c.faith!==r.faith)p+=35;
  if(c.control<50)p+=(50-c.control)*.55;
  return clamp(p,0,100);
}
function startConversion14(type,id){
  const c=county(id);if(!c||c.status!=="yours")return toast("Only your realm can sponsor conversion");
  if(S.conversionProjects[id])return toast("A conversion project is already active");
  if(type==="faith"&&c.faith===ruler().faith)return toast("The county already follows your faith");
  if(type==="culture"&&c.culture===ruler().culture)return toast("The county already follows your culture");
  const cost=type==="faith"?22:28;
  if(S.gold<cost)return toast("Need "+cost+" gold");
  S.gold-=cost;S.conversionProjects[id]={type,progress:0,started:S.year*12+S.month};
  log((type==="faith"?"The chaplain began converting ":"The chancellor began promoting culture in ")+c.name+".","court");toast("Project started");render();saveSilent();
}
function processConversion14(){
  Object.entries(S.conversionProjects||{}).forEach(([id,p])=>{
    const c=county(id);if(!c||c.status!=="yours"){delete S.conversionProjects[id];return}
    const skill=p.type==="faith"?(char(S.council.chaplain)?.learning||5):(char(S.council.chancellor)?.diplomacy||5);
    p.progress+=Math.max(4,skill*.65);
    if(p.progress<100)return;
    if(p.type==="faith")c.faith=ruler().faith;else c.culture=ruler().culture;
    c.control=clamp(c.control+7,0,100);c.prosperity=clamp(realmProsperity(c)+4,0,100);
    delete S.conversionProjects[id];
    log(c.name+" adopted the court's "+(p.type==="faith"?"faith":"culture")+".","court");toast("Conversion completed");
  });
}
function processIdentityPressure14(){
  WORLD.counties.forEach(c=>{
    const pressure=countyIdentityPressure14(c);
    S.culturalUnrest[c.id]=Math.round(pressure);
    if(c.status==="yours"&&pressure>=50){
      c.control=clamp(c.control-.08,0,100);
      c.prosperity=clamp(realmProsperity(c)-.06,0,100);
      if(pressure>=75&&c.control<42&&Math.random()<.012&&!S.wars.some(w=>w.target===c.id&&w.kind==="revolt")){
        const enemy=Math.max(120,Math.floor(c.levy*.7+c.garrison*.35));
        S.wars.push({id:"w_unrest_"+Date.now().toString(36),kind:"revolt",uprising:true,name:(c.faith!==ruler().faith?"Religious":"Cultural")+" Uprising in "+c.name,target:c.id,score:-15,months:0,siege:0,enemy,rebels:[c.holder]});
        log("Unrest in "+c.name+" erupted into open rebellion.","war");toast("County uprising");
      }
    }
    if(c.status==="yours"&&pressure<25)c.control=clamp(c.control+.08,0,100);
  });
}
function endWar(w,result){
  if(w?.uprising&&result==="victory"){
    const c=county(w.target);
    if(c){c.control=clamp(c.control+12,0,100);c.prosperity=clamp(realmProsperity(c)+6,0,100)}
    delete S.culturalUnrest[w.target];
  }
  return baseEndWar14(w,result);
}
function monthlyWar(w){
  if(w?.uprising)return LEGACY_MONTHLY_WAR14(w);
  return LEGACY_MONTHLY_WAR14(w);
}
function renderSelected(){
  baseRenderSelected14();
  const c=county(S.selectedCounty);if(!c)return;
  const p=Math.round(S.culturalUnrest[c.id]||countyIdentityPressure14(c));
  const project=S.conversionProjects[c.id];
  const box=$("identityDetail")||document.createElement("div");box.id="identityDetail";
  box.innerHTML="<b>Identity:</b> "+esc(c.culture)+" · "+esc(c.faith)+"<br><b>Unrest pressure:</b> "+p+"/100"+(project?"<br><b>Conversion:</b> "+esc(project.type)+" · "+Math.round(project.progress)+"%":"");
  box.className="identity-detail";
  const target=$("holdingsSummary");if(target?.parentElement&&!box.parentElement)target.parentElement.appendChild(box);
  if(c.status==="yours"){
    const old=document.getElementById("identityActions");if(old)old.remove();
    const acts=document.createElement("div");acts.id="identityActions";acts.className="action-grid";
    const buttons=[];
    if(!project&&c.faith!==ruler().faith)buttons.push("<button class='action-btn' data-identity='faith'><b>Convert Faith</b><span>-22 gold · chaplain project</span></button>");
    if(!project&&c.culture!==ruler().culture)buttons.push("<button class='action-btn' data-identity='culture'><b>Promote Culture</b><span>-28 gold · chancellor project</span></button>");
    acts.innerHTML=buttons.join("");target?.parentElement?.appendChild(acts);
    document.querySelectorAll("[data-identity]").forEach(b=>b.onclick=()=>startConversion14(b.dataset.identity,S.selectedCounty));
  }
}
function renderDiplomacy(){
  const fn=typeof baseRenderDiplomacy14==="function"?baseRenderDiplomacy14:baseRenderDiplomacy;
  fn();
  const old=$("cultureFaithWorld14");if(old)old.remove();
  const box=document.createElement("div");box.id="cultureFaithWorld14";
  const rows=notableRulers().map(v=>{
    const counties=WORLD.counties.filter(c=>c.holder===v.id);
    const mismatches=counties.filter(c=>c.culture!==v.culture||c.faith!==v.faith).length;
    return "<div class='identity-row'><span><b>"+esc(v.name)+"</b><small>"+esc(v.culture)+" · "+esc(v.faith)+"</small></span><span>"+mismatches+" divided counties</span></div>";
  }).join("");
  box.innerHTML="<div class='section-title'>Culture & faith map</div>"+(rows||"<div class='empty'>No foreign courts.</div>");
  $("tab-diplomacy").appendChild(box);
}
function syncWorldState(){baseSync14();S.version=14;S.countyState=S.countyState||{};WORLD.counties.forEach(c=>{if(S.countyState[c.id]){S.countyState[c.id].culture=c.culture;S.countyState[c.id].faith=c.faith;S.countyState[c.id].identityPressure=countyIdentityPressure14(c)}})}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE14,JSON.stringify(S))}catch(e){}}
function reset(){[SAVE14,"dynasty_realms_save_v13","dynasty_realms_save_v12","dynasty_realms_save_v11","dynasty_realms_save_v10","dynasty_realms_save_v09","dynasty_realms_save_v08"].forEach(k=>localStorage.removeItem(k));location.reload()}
function monthlyTick(){const wasPaused=S.paused;baseMonthlyTick14();if(wasPaused)return;processConversion14();processIdentityPressure14();render();saveSilent()}
load14();render();saveSilent();
