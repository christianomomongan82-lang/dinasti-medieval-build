// Dynasty Realms v0.50 - Grand Diplomacy, Trade & Strategic Blocs
const baseMonthlyTick50=monthlyTick,baseRenderDiplomacy50=renderDiplomacy,baseRenderWar50=renderWar,baseAction50=action,baseSaveSilent50=saveSilent,baseReset50=reset,baseDiplomacyScore50=diplomacyScore,baseRealmTax50=realmTax,baseEndWar50=endWar,baseHasNAP50=typeof hasNAP15==="function"?hasNAP15:null;
const D50_TYPES={alliance:"Alliance",trade:"Trade Charter",nap:"Non-Aggression Pact",defensive:"Defensive Pact",guarantee:"Guarantee",tributary:"Tributary"};
function ensure50(){
 S.diplomacy50=S.diplomacy50&&typeof S.diplomacy50==="object"?S.diplomacy50:{};
 S.diplomacy50.treaties=Array.isArray(S.diplomacy50.treaties)?S.diplomacy50.treaties:[];S.diplomacy50.embargoes=S.diplomacy50.embargoes&&typeof S.diplomacy50.embargoes==="object"?S.diplomacy50.embargoes:{};
 S.diplomacy50.reputation=Number.isFinite(S.diplomacy50.reputation)?S.diplomacy50.reputation:50;
}
function kingdom50ForCounty(id){const c=county(id);if(!c)return null;return WORLD.duchies.find(d=>d.id===c.duchy)?.parent||null}
function kingdom50Ruler(kid){return (WORLD.kingdoms||[]).find(k=>k.id===kid)?.holder||null}
function kingdom50Stats(kid){const h=kingdom50Ruler(kid),cs=WORLD.counties.filter(c=>kingdom50ForCounty(c.id)===kid);return{kid,holder:h,counties:cs,power:Math.max(1,cs.reduce((n,c)=>n+c.levy+c.garrison,0))}}
function getTreaty50(a,b,type){ensure50();return S.diplomacy50.treaties.find(t=>t.type===type&&((t.a===a&&t.b===b)||(t.a===b&&t.b===a)))}
function hasTreaty50(a,b,type){return!!getTreaty50(a,b,type)}
function relation50(id){if(id===S.rulerId)return 100;return clamp((baseDiplomacyScore50(id)||0)+(S.diplomacy50.reputation-50)*.18,-100,100)}
function offerTreaty50(id,type){
 ensure50();const target=char(id),r=ruler();if(!target||target.id===r.id||!target.alive)return toast("Invalid diplomatic target");if(target.age<16)return toast("Their ruler is too young");if(getTreaty50(r.id,id,type))return toast(D50_TYPES[type]+" already exists");
 const cfg={trade:{cost:12,min:5,months:72,text:"A long-term commercial charter"},nap:{cost:8,min:-5,months:72,text:"A formal promise not to attack"},defensive:{cost:15,min:12,months:96,text:"A mutual defensive pact"},guarantee:{cost:16,min:18,months:60,text:"A guarantee of protection"},tributary:{cost:25,min:-2,months:48,text:"A coercive tribute arrangement"}}[type];if(!cfg)return;
 if(relation50(id)<cfg.min)return toast("They are not receptive enough");if(S.prestige<cfg.cost)return toast("Need "+cfg.cost+" prestige");
 const myKing=(WORLD.kingdoms||[]).find(k=>k.holder===r.id)?.id,myP=myKing?kingdom50Stats(myKing).power:Math.max(300,playerPower()*1.2),theirKing=(WORLD.kingdoms||[]).find(k=>k.holder===id)?.id,theirP=theirKing?kingdom50Stats(theirKing).power:Math.max(300,target.martial*50+target.diplomacy*40);
 if(type==="tributary"&&myP<theirP*1.18)return toast("They are too powerful to accept tribute");
 S.prestige-=cfg.cost;const now=S.year*12+S.month;S.diplomacy50.treaties.push({a:r.id,b:id,type,started:now,expires:now+cfg.months});
 S.relations[id]=clamp(opinion(id)+(type==="tributary"?-8:7),-100,100);log(cfg.text+" was signed with "+target.name+".","court");toast(D50_TYPES[type]+" signed");render();saveSilent();
}
function cancelTreaty50(id,type){S.diplomacy50.treaties=S.diplomacy50.treaties.filter(t=>!(t.type===type&&((t.a===S.rulerId&&t.b===id)||(t.a===id&&t.b===S.rulerId))));if(char(id))log(D50_TYPES[type]+" with "+char(id).name+" was dissolved.","court");render();saveSilent()}
function embargo50(id){const key=[S.rulerId,id].sort().join("|");if(S.diplomacy50.embargoes[key]){delete S.diplomacy50.embargoes[key];log("The embargo on "+char(id)?.name+" was lifted.","court")}else{S.diplomacy50.embargoes[key]={started:S.year*12+S.month};S.relations[id]=clamp(opinion(id)-18,-100,100);log("The crown embargoed trade with "+char(id)?.name+".","court")}render();saveSilent()}
function tradeMonthly50(){
 ensure50();let n=0,ports=ownedCounties().filter(c=>c.terrain==="coast").length;
 S.diplomacy50.treaties.forEach(t=>{if(t.type!=="trade")return;const id=t.a===S.rulerId?t.b:t.b===S.rulerId?t.a:null;if(!id)return;const key=[S.rulerId,id].sort().join("|");if(S.diplomacy50.embargoes[key]||!char(id)?.alive)return;n+=.8+Math.min(1.2,ports*.12)});
 return n;
}
function realmTradePower50(){return ownedCounties().reduce((n,c)=>n+(c.terrain==="coast"?2.5:1)+(c.resourceValue||0)*4,0)}
function processTribute50(){S.diplomacy50.treaties.forEach(t=>{if(t.type!=="tributary")return;if(t.a===S.rulerId)S.gold+=1.2;else if(t.b===S.rulerId)S.gold=Math.max(0,S.gold-1.2)})}
function expireTreaties50(){const now=S.year*12+S.month;S.diplomacy50.treaties=S.diplomacy50.treaties.filter(t=>t.expires==null||t.expires>now)}
function defensiveSupport50(defenderId){const ids=[];S.diplomacy50.treaties.forEach(t=>{if(t.type!=="defensive"&&t.type!=="guarantee")return;const p=t.a===defenderId?t.b:t.b===defenderId?t.a:null;if(p&&char(p)?.alive&&p!==S.rulerId)ids.push(p)});S.alliances.forEach(a=>{if(a.a===defenderId&&char(a.b)?.alive&&a.b!==S.rulerId)ids.push(a.b);if(a.b===defenderId&&char(a.a)?.alive&&a.a!==S.rulerId)ids.push(a.a)});return[...new Set(ids)]}
function callAllies50(w){
 if(!w||w.kind==="revolt")return;const ids=[];S.alliances.forEach(a=>{if(a.a===S.rulerId)ids.push(a.b);if(a.b===S.rulerId)ids.push(a.a)});S.diplomacy50.treaties.forEach(t=>{if(t.type==="defensive"||t.type==="guarantee"){if(t.a===S.rulerId)ids.push(t.b);if(t.b===S.rulerId)ids.push(t.a)}});
 const unique=[...new Set(ids)].filter(id=>char(id)?.alive&&id!==w.defender&&id!==w.attacker);let power=0;unique.forEach(id=>{const kid=(WORLD.kingdoms||[]).find(k=>k.holder===id)?.id;power+=Math.floor((kid?kingdom50Stats(kid).power:Math.max(250,(char(id)?.martial||6)*50))*.23)});
 if(unique.length){S.alliedForces25=S.alliedForces25||{};S.alliedForces25[w.id]={power,side:S.rulerId,allies:unique};log(unique.map(id=>char(id)?.name).filter(Boolean).join(", ")+" answered the call to arms.","war")}
}
function addDefenderSupport50(w){if(!w||w.defender===S.rulerId)return;const ids=defensiveSupport50(w.defender);if(!ids.length)return;const support=ids.reduce((n,id)=>{const kid=(WORLD.kingdoms||[]).find(k=>k.holder===id)?.id;return n+Math.floor((kid?kingdom50Stats(kid).power:300)*.18)},0);w.enemy=Math.floor((w.enemy||0)+support);w.defensiveBloc50=ids}
function aiDiplomacy50(){
 const kings=(WORLD.kingdoms||[]).map(k=>char(k.holder)).filter(v=>v?.alive);
 kings.forEach(a=>{if(a.id===S.rulerId)return;const others=kings.filter(b=>b.id!==a.id);if(!others.length)return;const target=others.sort((x,y)=>{const kx=(WORLD.kingdoms||[]).find(k=>k.holder===x.id)?.id,ky=(WORLD.kingdoms||[]).find(k=>k.holder===y.id)?.id;return (kingdom50Stats(ky).power||1)-(kingdom50Stats(kx).power||1)})[0];if(!target||S.month%3!==0||Math.random()>0.09)return;const affinity=(a.culture===target.culture?12:0)+(a.faith===target.faith?10:0)+(a.diplomacy||0)*.7;if(!hasTreaty50(a.id,target.id,"trade")&&affinity>8)S.diplomacy50.treaties.push({a:a.id,b:target.id,type:"trade",started:S.year*12+S.month,expires:S.year*12+S.month+72});else if(!hasTreaty50(a.id,target.id,"nap"))S.diplomacy50.treaties.push({a:a.id,b:target.id,type:"nap",started:S.year*12+S.month,expires:S.year*12+S.month+72})});
 const pk=(WORLD.kingdoms||[]).find(k=>k.holder===S.rulerId);if(pk){const pp=kingdom50Stats(pk.id).power;kings.filter(v=>v.id!==S.rulerId).forEach(v=>{const k=(WORLD.kingdoms||[]).find(x=>x.holder===v.id)?.id,kp=k?kingdom50Stats(k).power:0;if(kp&&kp<pp*.68&&Math.random()<.018){const o=kings.find(x=>x.id!==S.rulerId&&x.id!==v.id);if(o&&!hasTreaty50(v.id,o.id,"defensive"))S.diplomacy50.treaties.push({a:v.id,b:o.id,type:"defensive",started:S.year*12+S.month,expires:S.year*12+S.month+96})}})}}
function renderDiplomacy50(){
 baseRenderDiplomacy50();let box=$("diplomacy50");if(box)box.remove();box=document.createElement("div");box.id="diplomacy50";
 const kingdoms=(WORLD.kingdoms||[]).filter(k=>k.holder!==S.rulerId).map(k=>{const v=char(k.holder),ks=kingdom50Stats(k.id),rel=relation50(k.holder);if(!v)return "";const tags=[];if(isAllied(S.rulerId,v.id))tags.push("Alliance");["trade","nap","defensive","guarantee","tributary"].forEach(t=>{if(hasTreaty50(S.rulerId,v.id,t))tags.push(D50_TYPES[t])});const emb=S.diplomacy50.embargoes[[S.rulerId,v.id].sort().join("|")];if(emb)tags.push("Embargo");const btns=["trade","nap","defensive"].map(t=>hasTreaty50(S.rulerId,v.id,t)?"":"<button data-d50='"+t+"' data-id='"+v.id+"'>"+(t==="nap"?"NAP":t==="defensive"?"Defensive":"Trade")+"</button>").join("")+(!isAllied(S.rulerId,v.id)?"<button data-d50='alliance' data-id='"+v.id+"'>Alliance</button>":"")+"<button data-d50='embargo' data-id='"+v.id+"'>"+(emb?"Lift":"Embargo")+"</button>";return"<div class='d50-row'><div><b>"+esc(k.name)+"</b><small>"+esc(v.name)+" · "+Math.floor(ks.power)+" power · relation "+rel+"</small><span>"+(tags.join(" · ")||"No formal treaty")+"</span></div><div class='d50-actions'>"+btns+"</div></div>"}).join("");
 const active=S.diplomacy50.treaties.filter(t=>t.a===S.rulerId||t.b===S.rulerId).map(t=>{const other=t.a===S.rulerId?t.b:t.a;return"<div class='d50-treaty'><span><b>"+esc(D50_TYPES[t.type])+"</b><small>with "+esc(char(other)?.name||"Unknown")+" · expires "+t.expires+"</small></span><button data-d50-cancel='"+other+"' data-d50-type='"+t.type+"'>End</button></div>"}).join("");
 const war=S.wars.find(w=>w.kind!=="revolt"&&(w.attacker===S.rulerId||w.defender===S.rulerId)),call=war?"<button class='d50-call' data-d50-call='"+war.id+"'>Call allied armies</button>":"";
 box.innerHTML="<div class='section-title'>Grand diplomacy</div><div class='d50-summary'><div><span>Trade income</span><b>"+tradeMonthly50().toFixed(1)+"/mo</b></div><div><span>Trade power</span><b>"+Math.floor(realmTradePower50())+"</b></div><div><span>Reputation</span><b>"+Math.round(S.diplomacy50.reputation)+"</b></div><div><span>Treaties</span><b>"+active.length+"</b></div></div>"+call+"<div class='section-title'>Active diplomatic treaties</div>"+(active||"<div class='empty'>No formal treaties with foreign crowns.</div>")+"<div class='section-title'>Kingdoms of the known world</div>"+(kingdoms||"<div class='empty'>No foreign kingdoms discovered.</div>");
 $("tab-diplomacy")?.appendChild(box);
 box.querySelectorAll("[data-d50]").forEach(b=>b.onclick=()=>{const id=b.dataset.id,t=b.dataset.d50;if(t==="alliance")offerAlliance(id);else if(t==="embargo")embargo50(id);else offerTreaty50(id,t)});
 box.querySelectorAll("[data-d50-cancel]").forEach(b=>b.onclick=()=>cancelTreaty50(b.dataset.d50Cancel,b.dataset.d50Type));box.querySelectorAll("[data-d50-call]").forEach(b=>b.onclick=()=>{const w=S.wars.find(x=>x.id===b.dataset.d50Call);callAllies50(w);render();saveSilent()});
}
function renderWar(){baseRenderWar50();let box=$("diplomacyWar50");if(box)box.remove();box=document.createElement("div");box.id="diplomacyWar50";const w=S.wars.find(x=>x.kind!=="revolt"&&(x.attacker===S.rulerId||x.defender===S.rulerId));box.innerHTML="<div class='section-title'>War diplomacy</div>"+(w?"<div class='d50-warline'><span>Allied support</span><b>"+Math.floor(S.alliedForces25?.[w.id]?.power||0)+"</b></div><div class='d50-warline'><span>Defender bloc</span><b>"+((w.defensiveBloc50||[]).map(id=>esc(char(id)?.name||"Unknown")).join(", ")||"None")+"</b></div>":"<div class='empty'>No external war currently active.</div>");$("tab-war")?.appendChild(box)}
function action(a){const before=S.wars.map(w=>w.id);baseAction50(a);if(a==="war"){const w=S.wars.find(x=>x.kind!=="revolt"&&!before.includes(x.id));if(w){callAllies50(w);addDefenderSupport50(w);render();saveSilent()}}}
function endWar(w,result){baseEndWar50(w,result);if(S.alliedForces25&&w)delete S.alliedForces25[w.id];renderWar()}
function hasNAP15(a,b){return(baseHasNAP50?baseHasNAP50(a,b):false)||hasTreaty50(a,b,"nap")}
function realmTax(){return baseRealmTax50()+tradeMonthly50()}
function saveSilent(){ensure50();S.version=50;baseSaveSilent50()}
function reset(){ensure50();S.diplomacy50={treaties:[],embargoes:{},reputation:50};baseReset50()}
function monthlyTick(){const paused=S.paused;baseMonthlyTick50();if(paused)return;ensure50();expireTreaties50();processTribute50();aiDiplomacy50();S.diplomacy50.reputation=clamp(S.diplomacy50.reputation+(S.legitimacy>75?.04:-.03),0,100);render();saveSilent()}
ensure50();render();saveSilent();