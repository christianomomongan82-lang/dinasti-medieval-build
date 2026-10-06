// Dynasty Realms v1.30 - Real Mobile Screen Architecture
const BASE130_RENDER=render;
const BASE130_RENDER_TOP=renderTop;
const BASE130_RENDER_MAP=renderMap;
const SAVE130="dynasty_realms_save_v130";
const ORIGINAL_HOLDERS130={
 c_northwatch:"c_edric",c_ironford:"c_bren",c_pinefall:"c_elira",
 c_sunmere:"c_roderic",c_redvale:"c_merek",c_highmoor:"c_sera",
 c_goldcoast:"c_alden",c_eastmere:"c_hadrik"
};
function ensure130(){
 S.ui130=S.ui130&&typeof S.ui130==="object"?S.ui130:{screen:"realm",mapFocus:null};
 if(!["realm","court","dynasty","diplomacy","war"].includes(S.ui130.screen))S.ui130.screen="realm";
}
function repairOriginalWorld130(){
 WORLD.counties.forEach(c=>{
   if(ORIGINAL_HOLDERS130[c.id]){
     const h=ORIGINAL_HOLDERS130[c.id];
     c.holder=h;
     const t=title(c.id);if(t)t.holder=h;
     const b=title(c.id+"_barony");if(b)b.holder=h;
     S.titleHolders=S.titleHolders||{};S.titleHolders[c.id]=h;
   }
 });
 S.titleHolders=S.titleHolders||{};
 WORLD.duchies.forEach(d=>{
   const h=d.id==="d_north"?"c_edric":d.id==="d_east"?"c_roderic":d.id==="d_gold"?"c_alden":d.holder;
   if(valid130(h)){d.holder=h;S.titleHolders[d.id]=h;const t=title(d.id);if(t)t.holder=h}
 });
 if(WORLD.kingdom){WORLD.kingdom.holder="c_edric";const t=title("k_arvend");if(t)t.holder="c_edric";S.titleHolders.k_arvend="c_edric"}
 WORLD.counties.forEach(c=>c.status=c.holder===S.rulerId||((typeof isPlayerVassal==="function")&&isPlayerVassal(c.holder))?"yours":c.status==="rival"?"rival":"neutral");
}
function valid130(id){return !!(id&&WORLD.characters?.[id]?.alive)}
function screen130(name){
 ensure130();S.ui130.screen=name;
 document.body.dataset.screen=name;
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
 window.scrollTo({top:0,behavior:"instant"});
 const labels={realm:"Realm",court:"Court",dynasty:"Dynasty",diplomacy:"Diplomacy",war:"War"};
 const h=$("screenTitle130");if(h)h.textContent=labels[name]||"Realm";
 render130();
}
function atlas130(){
 let x=$("atlas130");if(x)x.remove();
 x=document.createElement("section");x.id="atlas130";x.className="atlas130 panel";
 const ks=WORLD.kingdoms||[];
 x.innerHTML="<div class='panel-head'><div><span class='eyebrow'>WORLD ATLAS</span><h2>Known Kingdoms</h2></div><span class='badge'>"+WORLD.counties.length+" counties</span></div><div class='atlas-grid130'>"+ks.map(k=>{
  const h=char(k.holder),cs=WORLD.counties.filter(c=typeof kingdom50ForCounty==="function"?kingdom50ForCounty(c.id)===k.id:c.id===k.capital);
  return "<button class='atlas-card130' data-king130='"+k.id+"'><b>"+esc(k.name.replace(/^Kingdom of /,""))+"</b><span>"+esc(h?.name||"Vacant")+" · "+cs.length+" counties</span><small>"+esc(WORLD.duchies.filter(d=>d.parent===k.id).map(d=>d.name.replace(/^Duchy of /,"")).join(" · ")||"Realm")+"</small></button>";
 }).join("")+"</div>";
 $("tab-realm")?.appendChild(x);
 x.querySelectorAll("[data-king130]").forEach(b=>b.onclick=()=>{
   const k=ks.find(v=>v.id===b.dataset.king130);
   if(k&&typeof mapJumpId120==="function"){const id=mapJumpId120(k);if(id){S.selectedCounty=id;typeof focusCounty50==="function"&&focusCounty50(id)}}
   renderMap();toast(k?.name||"Kingdom selected");
 });
}
function renderMap130(){
 BASE130_RENDER_MAP();
 const map=document.querySelector(".map");
 if(map){
   map.querySelector("svg")?.setAttribute("viewBox","0 0 1400 1950");
 }
 atlas130();
}
function nav130(e){
 const b=e.target.closest?.(".bottom-nav button[data-tab]");
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();screen130(b.dataset.tab);
}
function inject130(){
 if($("style130"))return;
 const s=document.createElement("style");s.id="style130";s.textContent=`
html,body{overscroll-behavior-y:none}
body{padding-bottom:0!important;overflow-x:hidden}
body[data-screen] .main{display:block!important}
body[data-screen] .main>.panel{display:none!important}
body[data-screen="realm"] .main>.map-card,
body[data-screen="realm"] .main>.selected,
body[data-screen="realm"] .main>#tab-realm,
body[data-screen="realm"] .main>.event-panel{display:block!important}
body[data-screen="court"] .main>#tab-court,
body[data-screen="dynasty"] .main>.ruler,
body[data-screen="dynasty"] .main>#tab-dynasty,
body[data-screen="diplomacy"] .main>#tab-diplomacy,
body[data-screen="war"] .main>#tab-war{display:block!important}
body[data-screen="court"] .topbar,body[data-screen="dynasty"] .topbar,body[data-screen="diplomacy"] .topbar,body[data-screen="war"] .topbar{display:flex}
body[data-screen="court"] .titles,body[data-screen="court"] .stats-strip,
body[data-screen="dynasty"] .titles,body[data-screen="dynasty"] .stats-strip,
body[data-screen="diplomacy"] .titles,body[data-screen="diplomacy"] .stats-strip,
body[data-screen="war"] .titles,body[data-screen="war"] .stats-strip{display:none}
body[data-screen="realm"] .titles{display:block}
body[data-screen="realm"] .stats-strip{display:grid}
body[data-screen="realm"] .topbar{display:flex}
body[data-screen="realm"] .main{padding-bottom:90px}
body[data-screen="court"] .main,body[data-screen="dynasty"] .main,body[data-screen="diplomacy"] .main,body[data-screen="war"] .main{padding:8px 0 90px}
body[data-screen="dynasty"] .ruler{margin-bottom:10px}
body[data-screen="realm"] .map-card{margin-top:4px}
body[data-screen] .tab-page{display:none}
body[data-screen="realm"] #tab-realm,body[data-screen="court"] #tab-court,body[data-screen="dynasty"] #tab-dynasty,body[data-screen="diplomacy"] #tab-diplomacy,body[data-screen="war"] #tab-war{display:block!important}
.map-card .map{min-height:340px}
.map-card .map svg{width:100%;height:auto;max-height:560px;object-fit:contain}
.atlas130{margin-top:10px}
.atlas-grid130{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:10px 14px 14px}
.atlas-card130{background:#101216;border:1px solid var(--line);border-radius:11px;text-align:left;padding:11px;min-height:74px}
.atlas-card130 b{display:block;font-family:Georgia,serif;font-size:12px}
.atlas-card130 span,.atlas-card130 small{display:block;color:var(--muted);font-size:8px;margin-top:4px;line-height:1.35}
.atlas-card130:active{transform:scale(.98);background:#20242c}
.bottom-nav{z-index:1000!important;max-width:900px!important}
.bottom-nav button{min-height:54px!important;padding:7px 2px!important;touch-action:manipulation!important}
body[data-screen] .bottom-nav button.active{color:#eadfc7;background:#211f27;border-radius:10px}
@media(max-width:560px){.atlas-grid130{grid-template-columns:1fr}.map-card .map svg{max-height:430px}}
`;
 document.head.appendChild(s);
}
function renderTop(){BASE130_RENDER_TOP();inject130()}
function render130(){
 ensure130();repairOriginalWorld130();inject130();
 BASE130_RENDER();
 document.body.dataset.screen=S.ui130.screen;
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===S.ui130.screen));
 if(S.ui130.screen==="realm"){renderMap130();atlas130()}
}
function render(){render130()}
ensure130();repairOriginalWorld130();inject130();
document.removeEventListener("click",navCapture120,true);
document.addEventListener("click",nav130,true);
screen130(S.ui130.screen);
