// Dynasty Realms v0.45 - Playable Realms & Campaign Starts
const START45="dynasty_realms_start_v45";
const baseRenderTop45=renderTop,baseRenderMap45=renderMap;
function titleChainForHolder15(id){
 const k=(WORLD.kingdoms||[]).find(x=>x.holder===id);if(k)return{titleId:k.id,tier:"kingdom",liege:null};
 const d=WORLD.duchies.find(x=>titleHolder(x.id)===id);if(d)return{titleId:d.id,tier:"duchy",liege:titleHolder(d.parent)};
 const c=WORLD.counties.find(x=>x.holder===id);if(c){const dh=titleHolder(c.duchy);return{titleId:c.id,tier:"county",liege:dh===id?titleHolder(title(c.duchy)?.parent):dh}}
 return null;
}
function isPlayerVassal(id){
 if(!id)return false;if(id===S.rulerId)return true;
 const root=titleChainForHolder15(S.rulerId),info=titleChainForHolder15(id);if(!root||!info)return false;
 if(root.tier==="kingdom")return info.tier==="county"||info.tier==="duchy" ? info.liege===S.rulerId||isDescendantOf45(id,S.rulerId) : info.liege===S.rulerId;
 if(root.tier==="duchy")return info.tier==="county"&&info.liege===S.rulerId;
 return false;
}
function isDescendantOf45(id,root){
 let cur=id,seen=new Set();while(cur&&!seen.has(cur)){if(cur===root)return true;seen.add(cur);const i=titleChainForHolder15(cur);if(!i)break;cur=i.liege}return false;
}
function countyLiege(c){if(!c)return null;const dh=titleHolder(c.duchy);if(dh!==c.holder)return dh;return titleHolder(title(c.duchy)?.parent)}
function directVassalCharacters(){
 const ids=new Set(),root=S.rulerId;
 WORLD.duchies.forEach(d=>{if(titleHolder(d.parent)===root&&titleHolder(d.id)!==root)ids.add(titleHolder(d.id))});
 WORLD.counties.forEach(c=>{if(c.holder!==root&&countyLiege(c)===root)ids.add(c.holder)});
 return [...ids].map(char).filter(v=>v?.alive);
}
function ownedCounties(){return WORLD.counties.filter(c=>c.holder===S.rulerId||isPlayerVassal(c.holder))}
function playableRulers45(){
 const seen=new Set(),rows=[];
 (WORLD.kingdoms||[]).forEach(k=>{const v=char(k.holder);if(v?.alive&&!seen.has(v.id)){seen.add(v.id);rows.push({v,tier:"Kingdom",title:k.name})}});
 WORLD.duchies.forEach(d=>{const v=char(titleHolder(d.id));if(v?.alive&&!seen.has(v.id)){seen.add(v.id);rows.push({v,tier:"Duchy",title:d.name})}});
 WORLD.counties.forEach(c=>{const v=char(c.holder),isHigh=(WORLD.kingdoms||[]).some(k=>k.holder===v?.id)||WORLD.duchies.some(d=>titleHolder(d.id)===v?.id);if(v?.alive&&!isHigh&&!seen.has(v.id)){seen.add(v.id);rows.push({v,tier:"County",title:c.name})}});
 return rows.sort((a,b)=>({Kingdom:0,Duchy:1,County:2}[a.tier]-({Kingdom:0,Duchy:1,County:2}[b.tier])||a.title.localeCompare(b.title));
}
function showStartMenu45(){
 const rows=playableRulers45().map(x=>"<button class='start-card45' data-start45='"+x.v.id+"'><div><b>"+esc(x.v.name)+"</b><small>"+esc(x.tier)+" · "+esc(x.title)+"</small><span>"+esc(x.v.dynasty)+" · "+esc(x.v.culture||"")+"</span></div><strong>"+(x.v.martial||0)+"/"+(x.v.diplomacy||0)+"/"+(x.v.stewardship||0)+"</strong></button>").join("");
 $("modal").classList.add("open");$("modalBody").innerHTML="<div class='modal-head'><div><span class='eyebrow'>NEW CAMPAIGN</span><h2>Choose your ruler</h2></div><button id='closeStart45'>×</button></div><p class='muted'>Choose any major king, duke or county ruler in the known world. A fresh campaign resets all dynamic state while preserving the world design.</p><div class='start-list45'>"+rows+"</div>";$("closeStart45").onclick=()=>$("modal").classList.remove("open");document.querySelectorAll("[data-start45]").forEach(b=>b.onclick=()=>beginStart45(b.dataset.start45));
}
function beginStart45(id){if(!char(id)?.alive)return;[$"dynasty_realms_save_v45",$"dynasty_realms_save_v40",$"dynasty_realms_save_v35",$"dynasty_realms_save_v30",$"dynasty_realms_save_v25",$"dynasty_realms_save_v21",$"dynasty_realms_save_v20",$"dynasty_realms_save_v15",$"dynasty_realms_save_v14",$"dynasty_realms_save_v13",$"dynasty_realms_save_v12"].forEach(x=>{});["dynasty_realms_save_v45","dynasty_realms_save_v40","dynasty_realms_save_v35","dynasty_realms_save_v30","dynasty_realms_save_v25","dynasty_realms_save_v21","dynasty_realms_save_v20","dynasty_realms_save_v15","dynasty_realms_save_v14","dynasty_realms_save_v13","dynasty_realms_save_v12","dynasty_realms_save_v11","dynasty_realms_save_v10","dynasty_realms_save_v09","dynasty_realms_save_v08","dynasty_realms_save_v07","dynasty_realms_save_v06","dynasty_realms_save_v05","dynasty_realms_save_v03","dynasty_realms_save_v02"].forEach(k=>localStorage.removeItem(k));localStorage.setItem(START45,id);location.reload()}
function setupCampaign45(id){
 const v=char(id);if(!v)return false;
 Object.assign(S,freshState(),{version:45,rulerId:id,heirId:null,selectedCounty:WORLD.counties.find(c=>c.holder===id)?.id||S.selectedCounty});
 S.titleHolders={};WORLD.titles.forEach(t=>S.titleHolders[t.id]=t.holder);
 S.relations={};WORLD.characters&&Object.values(WORLD.characters).filter(c=>c.alive&&c.id!==id).forEach(c=>S.relations[c.id]=c.opinion||0);
 const chain=titleChainForHolder15(id),tier=chain?.tier||"county",mult=tier==="kingdom"?1.8:tier==="duchy"?1.2:1;
 S.gold=Math.round(72*mult);S.prestige=Math.round(85*mult);S.piety=Math.round(40*mult);S.legitimacy=tier==="kingdom"?86:tier==="duchy"?80:74;S.stress=14;S.culture=v.culture||"arvendic";S.faith=v.faith||"old_church";
 S.children=[...(v.children||[])];S.heirId=successionCandidates()[0]?.id||null;S.marriages=v.spouse?[{a:id,b:v.spouse,year:S.year}]:[];S.customCharacters={};
 S.armies=[];S.levies=0;const own=WORLD.counties.filter(c=>c.holder===id||isPlayerVassal(c.holder));const lev=own.reduce((n,c)=>n+c.levy,0);S.levies=Math.floor(lev*.55);S.troopCap=Math.max(500,Math.floor(lev*1.15));S.armies=[{id:"a_main",name:tier+" Field Host",men:Math.max(180,Math.floor(lev*.42)),levy:Math.max(120,Math.floor(lev*.34)),menAtArms:Math.max(40,Math.floor(lev*.08)),morale:100,commander:id,location:S.selectedCounty,supply:100,fatigue:0,raised:true}];
 S.council={chancellor:null,marshal:null,steward:null,spymaster:null,chaplain:null};const pool=Object.values(WORLD.characters).filter(c=>c.alive&&c.id!==id&&isPlayerVassal(c.id)).sort((a,b)=>b.diplomacy-a.diplomacy);["chancellor","marshal","steward","spymaster","chaplain"].forEach(role=>{const stat={chancellor:"diplomacy",marshal:"martial",steward:"stewardship",spymaster:"intrigue",chaplain:"learning"}[role];const used=new Set(Object.values(S.council));const pickv=pool.filter(c=>!used.has(c.id)).sort((a,b)=>(b[stat]||5)-(a[stat]||5))[0];if(pickv)S.council[role]=pickv.id});
 S.factions=[];S.wars=[];S.claims=[];S.alliances=[];S.vassalContracts={};S.aiAgendas={};S.decisions={feast:0,hunt:0,pilgrimage:0,muster:0,arts:0};S.events=[{text:"A new campaign began under "+v.name+".",when:"Now",kind:"dynasty"}];
 ["independenceFactions","conversionProjects","aiPlans","aiClaims","aiTreasury","politicalLog","realm","realmPolicy20","countyEconomy20","tradeRoutes20","warExhaustion20","mercenaries20","regiments20","popularMovements20","greatWorks20","chronicle20","faithFervor20","relationships21","favors21","fear21","councilPerformance21","claimantMovements21","courtGuests21","courtEvent21","characterHistories21","titleClaims30","houseFavors30","chronicle30","claimantWars30","regency30","militaryDoctrine35","logistics35","armyHistory35","supplyDepots35","faithFervor40","culturalAcceptance40","traditions40","innovations40","religiousHead40","holyWars40","religiousHistory40","cultureHistory40","houseLegacy25","alliedForces25"].forEach(k=>delete S[k]);
 localStorage.removeItem(START45);ensure40();ensure35();ensure30();ensure25();S.version=45;rebuildHeir();render();saveSilent();return true;
}
function renderTop(){baseRenderTop45();const v=ruler();if(v)document.title="Dynasty Realms · "+v.name}
function renderMap(){baseRenderMap45()}
function load45(){const start=localStorage.getItem(START45);if(start){setupCampaign45(start);return}try{const raw=localStorage.getItem("dynasty_realms_save_v45")||localStorage.getItem("dynasty_realms_save_v40")||localStorage.getItem("dynasty_realms_save_v35")||localStorage.getItem("dynasty_realms_save_v30");if(raw){Object.assign(S,JSON.parse(raw),{version:45});applyWorldState()}}catch(e){}ensure25();ensure30();ensure35();ensure40();S.version=45;render();saveSilent()}
$("newGameBtn").onclick=showStartMenu45;
load45();