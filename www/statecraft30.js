// Dynasty Realms v0.30 - Statecraft, Claims, Regency & Chronicle
const SAVE30="dynasty_realms_save_v30";
const baseMonthlyTick30=monthlyTick,baseRenderDynasty30=renderDynasty,baseRenderCourt30=renderCourt,baseRenderDiplomacy30=renderDiplomacy,baseRenderRealm30=renderRealm,baseRenderWar30=renderWar,baseSync30=syncWorldState,baseReset30=reset,baseDeath30=death,baseEndWar30=endWar,baseArrangeMarriage30=arrangeMarriage,baseMakeAIMarriage30=makeAIMarriage25,baseWarObjectives30=warObjectives,baseRealmTax30=realmTax,basePlayerPower30=playerPower;
function ensure30(){
 S.version=30;S.regency30=S.regency30&&typeof S.regency30==="object"?S.regency30:null;S.titleClaims30=S.titleClaims30&&typeof S.titleClaims30==="object"?S.titleClaims30:{};S.houseFavors30=S.houseFavors30&&typeof S.houseFavors30==="object"?S.houseFavors30:{};S.chronicle30=Array.isArray(S.chronicle30)?S.chronicle30:[];S.claimantWars30=Array.isArray(S.claimantWars30)?S.claimantWars30:[];S.regencyDecisions30=S.regencyDecisions30||0}
function chronicle30(text,kind="court"){S.chronicle30.unshift({year:S.year,month:S.month,text,kind});S.chronicle30=S.chronicle30.slice(0,80)}
function regent30(){
 if(!S.regency30)return null;return char(S.regency30.regent);
}
function selectRegent30(){
 const r=ruler(),cands=[char(S.council.chancellor),char(S.council.steward),...directVassalCharacters()].filter(v=>v&&v.alive&&v.id!==r?.id);
 return cands.sort((a,b)=>(b.diplomacy||5)+(b.stewardship||5)-(a.diplomacy||5)-(a.stewardship||5))[0]||null;
}
function death(cause){
 const old=ruler(),oldAge=old?.age;
 baseDeath30(cause);
 if(!S.rulerId||!char(S.rulerId)?.alive)return;
 const nr=ruler();
 if(nr&&nr.age<16){
   const rg=selectRegent30();
   S.regency30={ruler:nr.id,regent:rg?.id||null,started:S.year*12+S.month,tension:rg&&((rg.traits||[]).includes("Ambitious"))?38:18,stabilized:0};
   S.relations[rg?.id||""]=rg?clamp(opinion(rg.id)+5,-100,100):0;
   chronicle30(nr.name+" inherited the realm as a minor; a regency began.","dynasty");
   log("A regency began for "+nr.name+". The court is watching the regent closely.","dynasty");
 }
 if(old&&nr)chronicle30(old.name+" died at "+oldAge+"; "+nr.name+" inherited the realm.","dynasty");
}
function regencyActive30(){return !!S.regency30&&char(S.regency30.ruler)?.age<16}
function realmTax(){const x=baseRealmTax30();return x*(regencyActive30()?.84:1)}
function playerPower(){return basePlayerPower30()*(regencyActive30()?.9:1)}
function stabilizeRegency30(){
 if(!regencyActive30())return toast("No active regency");
 if(S.prestige<25)return toast("Need 25 prestige");
 S.prestige-=25;S.regency30.tension=clamp(S.regency30.tension-18,0,100);S.regency30.stabilized++;directVassalCharacters().forEach(v=>S.relations[v.id]=clamp(opinion(v.id)+4,-100,100));chronicle30("The regency was stabilized through concessions and court ceremony.","court");toast("Regency stabilized");render();saveSilent()
}
function processRegency30(){
 if(!S.regency30)return;
 const nr=char(S.regency30.ruler);if(!nr||!nr.alive){S.regency30=null;return}
 if(nr.age>=16){chronicle30(nr.name+" came of age and ended the regency.","dynasty");log(nr.name+" is now ruling without a regent.","dynasty");S.regency30=null;return}
 const reg=regent30();
 S.regency30.tension=clamp(S.regency30.tension+(S.legitimacy<50?.45:0.08)+(reg&&((reg.traits||[]).includes("Ambitious"))?.35:0),0,100);
 directVassalCharacters().forEach(v=>{if(v.id!==reg?.id&&S.regency30.tension>45)S.relations[v.id]=clamp(opinion(v.id)-.12,-100,100)});
 if(S.regency30.tension>82&&Math.random()<.012){
  const f=directVassalCharacters().sort((a,b)=>opinion(a.id)-opinion(b.id))[0];if(f){S.factions=S.factions||[];log(f.name+" is positioning against the regency.","court");S.regency30.tension=clamp(S.regency30.tension+4,0,100)}
 }
}
function highestTitleForHolder30(id){
 const k=(WORLD.kingdoms||[]).find(x=>x.holder===id);if(k)return{titleId:k.id,tier:"kingdom"};
 const d=WORLD.duchies.find(x=>titleHolder(x.id)===id);if(d)return{titleId:d.id,tier:"duchy"};
 const c=WORLD.counties.find(x=>x.holder===id);return c?{titleId:c.id,tier:"county"}:null;
}
function addTitleClaim30(titleId,claimant,reason="marriage"){
 const t=title(titleId),c=char(claimant);if(!t||!c||!c.alive)return;
 S.titleClaims30[titleId]=S.titleClaims30[titleId]||[];if(S.titleClaims30[titleId].some(x=>x.claimant===claimant))return;
 S.titleClaims30[titleId].push({claimant,reason,year:S.year,strength:reason==="inheritance"?75:55});chronicle30(c.name+" gained a "+reason+" claim on "+t.name+".","dynasty");
}
function makeAIMarriage25(a,b){
 const ok=baseMakeAIMarriage30(a,b);if(!ok)return ok;
 const ta=titleChainForHolder15(a.id),tb=titleChainForHolder15(b.id);
 if(ta?.titleId&&ta.tier!=="county")addTitleClaim30(ta.titleId,b.id,"marriage");
 if(tb?.titleId&&tb.tier!=="county")addTitleClaim30(tb.titleId,a.id,"marriage");
 return ok;
}
function arrangeMarriage(targetId){
 const before=S.marriages.length;const out=baseArrangeMarriage30(targetId);
 if(S.marriages.length>before){
  const m=S.marriages[S.marriages.length-1],a=char(m.a),b=char(m.b);if(a&&b){const ta=titleChainForHolder15(a.id),tb=titleChainForHolder15(b.id);if(ta?.titleId&&ta.tier!=="county")addTitleClaim30(ta.titleId,b.id,"marriage");if(tb?.titleId&&tb.tier!=="county")addTitleClaim30(tb.titleId,a.id,"marriage");}}
 return out;
}
function titleClaimants30(titleId){return (S.titleClaims30[titleId]||[]).map(x=>({...x,char:char(x.claimant)})).filter(x=>x.char?.alive)}
function claimableForPlayer30(x){return x&&(x.claimant===S.rulerId||x.claimant===ruler()?.spouse||(ruler()?.children||[]).includes(x.claimant))}
function titleWarObjectives30(w){
 if(w?.goal!=="claim_title"||!w.targetTitleId)return null;
 const t=title(w.targetTitleId);if(!t)return [];
 if(t.type==="kingdom")return WORLD.duchies.filter(d=>d.parent===t.id).flatMap(d=>WORLD.counties.filter(c=>c.duchy===d.id));
 if(t.type==="duchy")return WORLD.counties.filter(c=>c.duchy===t.id);
 if(t.type==="county")return county(t.id)?[county(t.id)]:[];
 return [];
}
function warObjectives(w){const c=titleWarObjectives30(w);return c||baseWarObjectives30(w)}
function declareClaimWar30(titleId,claimantId){
 const t=title(titleId),claim=titleClaimants30(titleId).find(x=>x.claimant===claimantId);if(!t||!claim)return toast("No valid claimant");
 if(!claimableForPlayer30(claim))return toast("The claimant is not part of your dynastic cause");
 const defender=titleHolder(t.id);if(!defender||defender===claimantId)return toast("Invalid claimant war");
 if(hasTruce15(S.rulerId,defender)||hasNAP15(S.rulerId,defender))return toast(hasNAP15(S.rulerId,defender)?"The pact blocks this war":"A truce is still active");
 if(regencyActive30())return toast("The regency cannot begin a dynastic war");
 const objs=titleWarObjectives30({goal:"claim_title",targetTitleId:titleId});if(!objs.length)return toast("No de jure land found");
 const adjacent=objs.some(c=>ownedCounties().some(pc=>(WORLD.adjacency[pc.id]||[]).includes(c.id)));if(!adjacent)return toast("Your realm has no border with this title");
 if(externalWars().filter(w=>warHasPlayer(w)).length>=2)return toast("Too many external wars");
 const w={id:"w_claim30_"+Date.now().toString(36),kind:"external",attacker:S.rulerId,defender,name:"Claimant War for "+t.name,target:objs[0].id,targetTitleId,claimant:claimantId,goal:"claim_title",score:0,months:0,siege:0,enemy:Math.floor(Math.max(250,realmPower15(defender)*.72)),battles:0,fronts:{},claimantWar:true};
 objs.forEach(c=>w.fronts[c.id]={siege:0});S.wars.push(w);S.claimantWars30.push(w.id);S.prestige=Math.max(0,S.prestige-30);chronicle30("The crown began a war to press "+char(claimantId).name+"'s claim on "+t.name+".","war");log("A claimant war began for "+t.name+".","war");toast("Claimant war declared");render();saveSilent()
}
function endWar(w,result){
 if(w?.claimantWar&&result==="victory"){
   const claimant=char(w.claimant);
   if(claimant&&claimant.alive){
     warObjectives(w).forEach(c=>{c.occupiedBy=null;c.occupationWar=null;c.siege=0});
     setTitleHolder(w.targetTitleId,claimant.id);
     const kt=(WORLD.kingdoms||[]).find(k=>k.id===w.targetTitleId);if(kt)kt.holder=claimant.id;
     S.wars=S.wars.filter(x=>x.id!==w.id);
     S.prestige+=55;S.legitimacy=clamp(S.legitimacy+4,0,100);
     S.titleClaims30[w.targetTitleId]=(S.titleClaims30[w.targetTitleId]||[]).filter(x=>x.claimant!==w.claimant);
     chronicle30(claimant.name+" successfully won "+title(w.targetTitleId)?.name+" in a claimant war.","war");
     log("The claimant's title was restored without redistributing its de jure counties.","dynasty");
   }
   S.claimantWars30=S.claimantWars30.filter(id=>id!==w.id);return;
 }
 const out=baseEndWar30(w,result);S.claimantWars30=S.claimantWars30.filter(id=>id!==w?.id);return out;
}
function canRoyalAct30(){return !regencyActive30()}
function renderDynasty(){baseRenderDynasty30();let old=$("statecraft30");if(old)old.remove();old=document.createElement("div");old.id="statecraft30";let reg="";if(S.regency30){const r=char(S.regency30.ruler),g=regent30();reg="<div class='identity-detail'><b>Regency:</b> "+esc(r?.name||"Unknown")+" · regent "+esc(g?.name||"Council")+" · tension "+Math.round(S.regency30.tension)+"%"+(r?.age>=16?"<br><button class='mini-btn' data-endreg30='1'>End Regency</button>":"")+"<button class='mini-btn' data-stab30='1'>Stabilize · 25 prestige</button></div>"}const claims=Object.entries(S.titleClaims30||{}).flatMap(([tid,a])=>a.map(x=>claimableForPlayer30(x)?"<button class='order-btn' data-claim30='"+tid+"' data-claimant30='"+x.claimant+"'><b>Press "+esc(char(x.claimant)?.name||"claimant")+"'s claim</b><span>"+esc(title(tid)?.name||tid)+" · strength "+x.strength+"</span></button>":"")).join("");old.innerHTML=reg+"<div class='section-title'>Dynastic claims</div>"+(claims||"<div class='empty'>No active dynastic claims.</div>");$("tab-dynasty")?.appendChild(old);old.querySelectorAll("[data-stab30]").forEach(b=>b.onclick=stabilizeRegency30);old.querySelectorAll("[data-endreg30]").forEach(b=>b.onclick=()=>{if(char(S.rulerId)?.age>=16){S.regency30=null;chronicle30("The regency formally ended.","dynasty");render();saveSilent()}});old.querySelectorAll("[data-claim30]").forEach(b=>b.onclick=()=>declareClaimWar30(b.dataset.claim30,b.dataset.claimant30))}
function renderCourt(){baseRenderCourt30();let old=$("regentCourt30");if(old)old.remove();old=document.createElement("div");old.id="regentCourt30";const reg=regent30();const favors=Object.entries(S.favors21||{}).filter(([id,n])=>n>0&&char(id)?.alive).map(([id,n])=>"<div class='vassal-row'><div><b>"+esc(char(id)?.name||id)+"</b><small>"+n+" favors owed</small></div><button class='mini-btn' data-favor30='"+id+"'>Call in favor</button></div>").join("");old.innerHTML=(S.regency30?"<div class='section-title'>Regency council</div><div class='renown-row15'><b>"+Math.round(S.regency30.tension)+"%</b><span>Regency tension · "+esc(reg?.name||"No regent assigned")+"</span></div>":"")+"<div class='section-title'>Court favors</div>"+(favors||"<div class='empty'>No favors currently owed.</div>");$("tab-court")?.appendChild(old);old.querySelectorAll("[data-favor30]").forEach(b=>b.onclick=()=>{const id=b.dataset.favor30;if((S.favors21[id]||0)>0){S.favors21[id]--;S.relations[id]=clamp(opinion(id)+18,-100,100);chronicle30(char(id).name+" called in a favor at court.","court");toast("Favor called in");render();saveSilent()}})}
function renderDiplomacy(){baseRenderDiplomacy30();let old=$("claimantDiplomacy30");if(old)old.remove();old=document.createElement("div");old.id="claimantDiplomacy30";const rows=Object.entries(S.titleClaims30||{}).flatMap(([tid,arr])=>arr.map(x=>x.char=char(x.claimant)&&claimableForPlayer30(x)?"<div class='treaty-row15'><span><b>"+esc(char(x.claimant)?.name||"Unknown")+"</b><small>Claim on "+esc(title(tid)?.name||tid)+" · "+x.reason+" · "+x.strength+" strength</small></span></div>":"")).join("");old.innerHTML="<div class='section-title'>Dynastic claim network</div>"+(rows||"<div class='empty'>No dynastic claims connected to your house.</div>");$("tab-diplomacy")?.appendChild(old)}
function renderRealm(){baseRenderRealm30()}
function renderWar(){baseRenderWar30();let old=$("claimantWar30");if(old)old.remove();old=document.createElement("div");old.id="claimantWar30";const rows=(S.wars||[]).filter(w=>w.claimantWar).map(w=>"<div class='treaty-row15'><span><b>"+esc(w.name)+"</b><small>Claimant: "+esc(char(w.claimant)?.name||"Unknown")+" · "+w.months+" months</small></span></div>").join("");old.innerHTML="<div class='section-title'>Claimant wars</div>"+(rows||"<div class='empty'>No claimant wars.</div>");$("tab-war")?.appendChild(old)}
function declareWar(goal){
 if(regencyActive30())return toast("A child ruler cannot declare an external war during regency");
 return baseDeclareWar15(goal);
}
function syncWorldState(){baseSync30();ensure30();S.version=30}
function saveSilent(){syncWorldState();try{localStorage.setItem(SAVE30,JSON.stringify(S))}catch(e){}}
function reset(){["dynasty_realms_save_v30","dynasty_realms_save_v25","dynasty_realms_save_v21","dynasty_realms_save_v20","dynasty_realms_save_v15","dynasty_realms_save_v14","dynasty_realms_save_v13","dynasty_realms_save_v12"].forEach(k=>localStorage.removeItem(k));location.reload()}
function monthlyTick(){const paused=S.paused;baseMonthlyTick30();if(paused)return;ensure30();processRegency30();if(S.month===1&&S.regency30)chronicle30("The regency entered another year under close noble scrutiny.","dynasty");render();saveSilent()}
function load30(){try{const raw=localStorage.getItem(SAVE30)||localStorage.getItem("dynasty_realms_save_v25")||localStorage.getItem("dynasty_realms_save_v21")||localStorage.getItem("dynasty_realms_save_v20");if(raw){Object.assign(S,JSON.parse(raw),{version:30});applyWorldState()}}catch(e){}ensure30();render();saveSilent()}
load30();