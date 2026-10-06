// Dynasty Realms v0.12 - save migration and foreign realm presentation

const SAVE12="dynasty_realms_save_v12";
const baseSync12=syncWorldState;
const baseReset12=reset;
const baseRenderDiplomacy12=renderDiplomacy;

function loadLatest12(){
  try{
    const raw=localStorage.getItem(SAVE12)||localStorage.getItem("dynasty_realms_save_v11")||localStorage.getItem("dynasty_realms_save_v10")||localStorage.getItem("dynasty_realms_save_v09")||localStorage.getItem("dynasty_realms_save_v08");
    if(raw){Object.assign(S,JSON.parse(raw),{version:12});applyWorldState();}
  }catch(e){}
  S.version=12;
  if(!S.realm||typeof S.realm!=="object")S.realm={};
  if(!S.realm.prosperity)S.realm.prosperity={};
  WORLD.counties.forEach(c=>{if(S.realm.prosperity[c.id]==null)S.realm.prosperity[c.id]=clamp(c.prosperity??58+c.dev*2,0,100);c.prosperity=S.realm.prosperity[c.id]});
  S.aiPlans=S.aiPlans&&typeof S.aiPlans==="object"?S.aiPlans:{};
  S.aiClaims=S.aiClaims&&typeof S.aiClaims==="object"?S.aiClaims:{};
  S.aiTreasury=S.aiTreasury&&typeof S.aiTreasury==="object"?S.aiTreasury:{};
  S.politicalLog=Array.isArray(S.politicalLog)?S.politicalLog:[];
  S.titleHolders=S.titleHolders&&typeof S.titleHolders==="object"?S.titleHolders:{};
  WORLD.duchies.forEach(d=>{if(!S.titleHolders[d.id])S.titleHolders[d.id]=d.holder});
  WORLD.counties.forEach(c=>{if(!S.titleHolders[c.id])S.titleHolders[c.id]=c.holder});
}
function renderDiplomacy(){
  baseRenderDiplomacy12();
  const old=document.getElementById("foreignRealms");if(old)old.remove();
  const box=document.createElement("div");box.id="foreignRealms";
  const kingdoms=(WORLD.kingdoms||[]).filter(k=>k.id!=="k_arvend");
  box.innerHTML="<div class='section-title'>Foreign realms</div>"+(kingdoms.map(k=>{
    const holder=char(k.holder);
    const ds=WORLD.duchies.filter(d=>(d.id==="d_frost"||d.id==="d_storm")&&k.id==="k_valedorn"||(d.id==="d_south"||d.id==="d_black")&&k.id==="k_southreach");
    const power=ds.reduce((sum,d)=>sum+WORLD.counties.filter(c=>c.duchy===d.id).reduce((n,c)=>n+c.levy+c.garrison,0),0);
    return "<div class='realm-card'><div><b>"+esc(k.name)+"</b><small>"+esc(holder?.name||"Unknown ruler")+" · "+power+" military power</small></div><span>"+ds.length+" duchies</span></div>";
  }).join("")||"<div class='empty'>No foreign kingdoms are known.</div>");
  $("tab-diplomacy").appendChild(box);
}
function syncWorldState(){baseSync12();S.version=12}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE12,JSON.stringify(S))}catch(e){}}
function reset(){
  baseReset12();
  [SAVE12,"dynasty_realms_save_v11","dynasty_realms_save_v10","dynasty_realms_save_v09","dynasty_realms_save_v08","dynasty_realms_save_v07","dynasty_realms_save_v06","dynasty_realms_save_v05","dynasty_realms_save_v03","dynasty_realms_save_v02"].forEach(k=>localStorage.removeItem(k));
  location.reload();
}
loadLatest12();normalizeWarState();render();saveSilent();
