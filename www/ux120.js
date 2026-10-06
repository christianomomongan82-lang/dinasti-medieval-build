// Dynasty Realms v1.20 - Reforged Mobile UI / World Repair
const baseRender120=render;
const baseRenderTitles120=renderTitles;
const baseRenderTop120=renderTop;
const baseRenderMap120=renderMap;
const baseRenderRealm120=renderRealm;
const baseRenderCourt120=renderCourt;
const baseRenderDynasty120=renderDynasty;
const baseRenderDiplomacy120=renderDiplomacy;
const baseRenderWar120=renderWar;
const baseSave120=saveSilent;
const baseReset120=reset;

S.ui120=S.ui120||{activeTab:"realm"};
S.runtime120=S.runtime120||{repairs:0};

function valid120(id){return !!(id&&WORLD.characters[id]?.alive)}
function repairHolder120(id){
 const t=title(id),d=WORLD.duchies.find(x=>x.id===id),k=(WORLD.kingdoms||[]).find(x=>x.id===id),c=county(id);
 let h=S.titleHolders?.[id];
 if(!valid120(h))h=t?.holder;
 if(!valid120(h))h=d?.holder;
 if(!valid120(h))h=k?.holder;
 if(!valid120(h))h=c?.holder;
 if(!valid120(h)){
   h=Object.values(WORLD.characters||{}).find(v=>v.alive&&(
     v.title===t?.name||v.title===d?.name||v.title===k?.name||v.title===c?.name
   ))?.id;
 }
 return h||null;
}
function repairWorld120(){
 if(S.runtime120.repaired)return;
 S.titleHolders=S.titleHolders||{};
 (WORLD.kingdoms||[]).forEach(k=>{const h=repairHolder120(k.id);if(h){S.titleHolders[k.id]=h;k.holder=h;const t=title(k.id);if(t)t.holder=h}});
 WORLD.duchies.forEach(d=>{const h=repairHolder120(d.id);if(h){S.titleHolders[d.id]=h;d.holder=h;const t=title(d.id);if(t)t.holder=h}});
 WORLD.counties.forEach(c=>{const h=repairHolder120(c.id);if(h){c.holder=h;S.titleHolders[c.id]=h;const t=title(c.id);if(t)t.holder=h;const b=title(c.id+"_barony");if(b)b.holder=h}c.status=c.holder===S.rulerId||((typeof isPlayerVassal==="function")&&isPlayerVassal(c.holder))?"yours":c.status==="rival"?"rival":"neutral"});
 if(S.rulerId==="c_edric"&&WORLD.kingdom)WORLD.kingdom.holder=S.titleHolders.k_arvend||"c_edric";
 S.runtime120.repairs=(S.runtime120.repairs||0)+1;S.runtime120.repaired=true;
 try{baseSave120()}catch(e){}
}
function syncTab120(tab,scroll){
 S.ui120.activeTab=tab;
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 document.querySelectorAll(".tab-page").forEach(p=>p.classList.toggle("show",p.id==="tab-"+tab));
 if(scroll){const p=$("tab-"+tab);if(p)setTimeout(()=>p.scrollIntoView({behavior:"smooth",block:"start"}),30)}
}
document.addEventListener("click",e=>{
 const b=e.target.closest?.(".bottom-nav button[data-tab]");
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 syncTab120(b.dataset.tab,true);
},true);

function focusPlayer50(){
 const cs=ownedCounties();
 if(!cs.length){setView50({x:0,y:0,w:760,h:480});return}
 const minX=Math.min(...cs.map(c=>c.x)),maxX=Math.max(...cs.map(c=>c.x)),minY=Math.min(...cs.map(c=>c.y)),maxY=Math.max(...cs.map(c=>c.y));
 const w=Math.max(520,Math.min(820,maxX-minX+320)),h=Math.max(380,Math.min(560,maxY-minY+260));
 setView50({x:(minX+maxX)/2-w/2,y:(minY+maxY)/2-h/2,w,h});
}
function focusCounty50(id){
 const c=county(id);if(!c)return;
 setView50({x:c.x-280,y:c.y-190,w:560,h:380});
}
function mapJumpId120(k){
 if(!k)return null;
 if(county(k.capital))return k.capital;
 const d=WORLD.duchies.find(x=>x.id===k.capital);if(d&&county(d.capital))return d.capital;
 const d2=WORLD.duchies.find(x=>x.parent===k.id);return d2&&county(d2.capital)?d2.capital:WORLD.counties.find(c=>WORLD.duchies.find(d=>d.id===c.duchy)?.parent===k.id)?.id||null;
}
function atlas120(){
 let x=$("atlas120");if(x)x.remove();
 x=document.createElement("div");x.id="atlas120";x.className="atlas120";
 x.innerHTML="<button data-atlas120='home'>⌂ My Realm</button>"+(WORLD.kingdoms||[]).map(k=>"<button data-atlas120='"+k.id+"'>"+esc(k.name.replace(/^Kingdom of /,""))+"</button>").join("");
 document.querySelector(".map-card")?.appendChild(x);
 x.querySelectorAll("[data-atlas120]").forEach(b=>b.onclick=()=>{
   if(b.dataset.atlas120==="home")focusPlayer50();
   else{const id=mapJumpId120((WORLD.kingdoms||[]).find(k=>k.id===b.dataset.atlas120));if(id){S.selectedCounty=id;focusCounty50(id)}}
   renderMap();
 });
}
function renderMap(){
 baseRenderMap120();
 const svg=document.querySelector(".map svg");if(!svg)return;
 const sea=document.querySelector(".map .sea");if(sea)sea.setAttribute("d","M0 0h1400v1950H0z");
 atlas120();
 if(MAP50?.view)svg.setAttribute("viewBox",[MAP50.view.x,MAP50.view.y,MAP50.view.w,MAP50.view.h].join(" "));
}
function compactTitles120(){
 const box=$("titleHierarchy");if(!box)return;
 const arr=WORLD.duchies.map(d=>{const h=char(titleHolder(d.id));const cs=WORLD.counties.filter(c=>c.duchy===d.id);return{d,h,cs}}).filter(x=>x.h||x.cs.length);
 const first=arr.slice(0,4).map(x=>"<div class='title-branch'><b>"+esc(x.d.name)+"</b><span>Duke: "+esc(x.h?.name||"Vacant")+"</span><small>"+x.cs.map(c=>esc(c.name)+" — "+esc(char(c.holder)?.name||"Vacant")).join(" · ")+"</small></div>").join("");
 const more=arr.length>4?"<details><summary>View all "+arr.length+" duchies</summary>"+arr.slice(4).map(x=>"<div class='title-branch'><b>"+esc(x.d.name)+"</b><span>Duke: "+esc(x.h?.name||"Vacant")+"</span><small>"+x.cs.map(c=>esc(c.name)+" — "+esc(char(c.holder)?.name||"Vacant")).join(" · ")+"</small></div>").join("")+"</details>":"";
 box.innerHTML=first+more;
 const rb=$("titleHierarchyRealm");if(rb)rb.innerHTML=box.innerHTML;
}
function command120(){
 let x=$("command120");if(x)x.remove();
 x=document.createElement("section");x.id="command120";x.className="command120 panel";
 const own=ownedCounties(),pop=Math.floor(own.reduce((n,c)=>n+(c.population||0),0)),food=own.length?Math.round(own.reduce((n,c)=>n+(c.food||0),0)/own.length):0;
 const wars=(S.wars||[]).filter(w=>w.kind!=="revolt"&&(w.attacker===S.rulerId||w.defender===S.rulerId));
 const vs=(typeof directVassalCharacters==="function"?directVassalCharacters():[]).sort((a,b)=>vassalLoyalty100(a)-vassalLoyalty100(b)).slice(0,3);
 x.innerHTML="<div class='section-title'>COMMAND CENTER</div><div class='cmd120grid'>"+[["Counties",own.length],["Population",pop],["Avg food",food],["Gold",Math.floor(S.gold||0)],["Wars",wars.length],["Legitimacy",Math.floor(S.legitimacy||0)]].map(a=>"<div><span>"+a[0]+"</span><b>"+a[1]+"</b></div>").join("")+"</div><div class='cmd120actions'><button data-cmd120='save'>Quick Save</button><button data-cmd120='settings'>Settings</button><button data-cmd120='guide'>How to Play</button><button data-cmd120='focus'>Focus Map</button></div><div class='section-title'>Immediate situation</div><div class='situation120'>"+(wars.length?wars.map(w=>"<div><b>"+esc(w.name)+"</b><span>Score "+Math.round(w.score||0)+" · "+(w.months||0)+" months</span></div>").join(""):"<div><b>No external war</b><span>Your realm is currently at peace.</span></div>")+vs.map(v=>"<div><b>"+esc(v.name)+"</b><span>Vassal loyalty "+Math.round(vassalLoyalty100(v))+"</span></div>").join("")+"</div>";
 $("tab-realm")?.insertBefore(x,$("tab-realm").firstChild);
 x.querySelectorAll("[data-cmd120]").forEach(b=>b.onclick=()=>{const a=b.dataset.cmd120;if(a==="save"){baseSave120();toast("Game saved")}else if(a==="settings"&&typeof showSettings110==="function")showSettings110();else if(a==="guide"&&typeof showGuide110==="function")showGuide110();else if(a==="focus"){focusPlayer50();renderMap()}});
}
function inject120(){
 if($("style120"))return;
 const s=document.createElement("style");s.id="style120";s.textContent=".bottom-nav{z-index:999!important;pointer-events:auto!important;min-height:66px!important;box-shadow:0 -10px 28px rgba(0,0,0,.38)}.bottom-nav button{min-height:54px!important;touch-action:manipulation!important;pointer-events:auto!important}.map{min-height:0!important}.map svg{min-height:0!important;max-height:520px;object-fit:contain}.atlas120{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;background:#0d1014;border-top:1px solid rgba(255,255,255,.06);scrollbar-width:none}.atlas120::-webkit-scrollbar{display:none}.atlas120 button{flex:0 0 auto;background:#171a20;border:1px solid var(--line);color:var(--text);border-radius:9px;padding:8px 10px;font-size:8px}.command120{margin:6px 0!important;overflow:hidden}.cmd120grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 14px}.cmd120grid>div{background:#101216;border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:8px}.cmd120grid span{display:block;color:var(--muted);font-size:7px;text-transform:uppercase}.cmd120grid b{display:block;font-size:12px;margin-top:3px}.cmd120actions{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:0 14px 10px}.cmd120actions button{background:#101216;border:1px solid var(--line);border-radius:8px;padding:9px;font-size:8px}.situation120{padding:0 14px 10px}.situation120>div{padding:7px 0;border-top:1px solid rgba(255,255,255,.05)}.situation120 b{font-size:9px}.situation120 span{display:block;color:var(--muted);font-size:8px;margin-top:2px}details{padding-top:5px}summary{font-size:8px;color:var(--gold);padding:7px 0;cursor:pointer}@media(max-width:560px){.cmd120grid{grid-template-columns:repeat(2,1fr)}}";
 document.head.appendChild(s);
}
function renderTop(){baseRenderTop120();inject120()}
function renderTitles(){baseRenderTitles120();repairWorld120();compactTitles120()}
function renderRealm(){baseRenderRealm120();command120()}
function renderCourt(){baseRenderCourt120()}
function renderDynasty(){baseRenderDynasty120()}
function renderDiplomacy(){baseRenderDiplomacy120()}
function renderWar(){baseRenderWar120()}
function saveSilent(){try{baseSave120()}catch(e){}try{localStorage.setItem(SAVE120,JSON.stringify(S))}catch(e){}}
function reset(){localStorage.removeItem(SAVE120);baseReset120()}
function render(){
 ensure120();repairWorld120();baseRender120();inject120();syncTab120(S.ui120.activeTab,false);
}
ensure120();repairWorld120();render();