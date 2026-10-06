function boot(){
 const old=storeGet();if(old&&WORLD.chars[old.rulerId]){S=Object.assign(stateFresh(old.rulerId),old);render();return}
 showStart();
}
function showStart(){
 const rows=WORLD.kingdoms.map(k=>{const v=WORLD.chars[k.holder];return `<button class="start-card" data-start="${k.holder}"><div><b>${v.name}</b><small>Kingdom of ${k.name}</small><span>${v.dynasty} · ${v.culture} · ${v.faith}</span></div><strong>${v.martial}/${v.diplomacy}/${v.stewardship}</strong></button>`}).join('');
 openModal(`<div class="sheet-head"><div><span class="eyebrow">NEW CAMPAIGN</span><h2>Choose your ruler</h2><div class="sub">Six kingdoms. Hundreds of decisions. One dynasty to survive.</div></div></div><div class="start-grid">${rows}</div>`);
 $$('button.start-card').forEach(b=>b.onclick=()=>newGame(b.dataset.start));
}
function newGame(id){
 S=stateFresh(id);S.relations={};Object.values(WORLD.chars).forEach(c=>{if(c.id!==id)S.relations[c.id]=c.opinion});
 const r=ruler();const owned=WORLD.counties.filter(c=>c.holder===id);owned.forEach(c=>c.status='player');
 const d=WORLD.duchies.find(x=>x.holder===id);if(d)S.selected=d.capital;
 const k=WORLD.kingdoms.find(x=>x.holder===id);if(k){WORLD.counties.filter(c=>c.kingdom===k.id).forEach(c=>{if(c!==selected())c.status='vassal'})}
 setupCouncil();log(`${r.name} ascended as ruler of ${k?.name||d?.name||'a county'}.`);closeModal();render();storePut();toast('Campaign started');
}
function setupCouncil(){
 const r=ruler(),k=selected()?selected().kingdom:null;
 const pool=Object.values(WORLD.chars).filter(c=>c.alive&&c.id!==r.id&&(!k||WORLD.counties.some(x=>x.holder===c.id&&x.kingdom===k)));
 const roleStats={chancellor:'diplomacy',marshal:'martial',steward:'stewardship',spymaster:'intrigue',chaplain:'learning'};
 for(const role of Object.keys(S.council)){const stat=roleStats[role],p=pool.filter(c=>!Object.values(S.council).includes(c.id)).sort((a,b)=>(b[stat]||0)-(a[stat]||0))[0];if(p)S.council[role]=p.id}
}
function ensureState(){if(!S)S=stateFresh(Object.keys(WORLD.chars)[0])}
function screen(name){ensureState();S.screen=name;window.scrollTo(0,0);render()}
function header(){
 const r=ruler();const k=WORLD.kingdoms.find(k=>k.holder===r.id)||WORLD.kingdoms.find(k=>WORLD.duchies.some(d=>d.holder===r.id&&d.parent===k.id));
 return `<header class="top"><div class="brand"><div class="crest">♜</div><div><h1>Dynasty Realms</h1><small>${r?.name||'Unknown'} · ${r?.dynasty||''}</small></div></div><div class="top-actions"><button class="top-btn" data-top="pause">${S.paused?'▶':'Ⅱ'}</button><button class="top-btn" data-top="settings">⚙</button></div></header><div class="ticker"><div class="tick"><span>Date</span><b>${S.year}.${String(S.month).padStart(2,'0')}</b></div><div class="tick"><span>Gold</span><b>${Math.floor(S.gold)}</b></div><div class="tick"><span>Prestige</span><b>${Math.floor(S.prestige)}</b></div><div class="tick"><span>Piety</span><b>${Math.floor(S.piety)}</b></div><div class="tick"><span>Levies</span><b>${Math.floor(S.levies)}</b></div><div class="tick"><span>Legitimacy</span><b>${Math.floor(S.legitimacy)}</b></div><div class="tick"><span>Stress</span><b>${Math.floor(S.stress)}</b></div></div>`
}
function nav(){
 return `<nav class="bottom">${[['realm','♜','Realm'],['court','♝','Court'],['dynasty','♔','Dynasty'],['diplomacy','♞','Diplomacy'],['war','⚔','War']].map(x=>`<button data-nav="${x[0]}" class="${S.screen===x[0]?'active':''}">${x[1]}<span>${x[2]}</span></button>`).join('')}</nav>`
}
function render(){
 ensureState();$('#top').innerHTML=header();$('#nav').innerHTML=nav();const root=$('#screen');root.className='screen';
 root.innerHTML=S.screen==='realm'?realm():S.screen==='court'?court():S.screen==='dynasty'?dynasty():S.screen==='diplomacy'?diplomacy():war();bind();
}
function mapSVG(){
 const mode=S.mapMode||'political';
 const blocks=WORLD.kingdoms.map((k,i)=>{const col=i%3,row=Math.floor(i/3);return `<text class="kingdomLabel" x="${col*300+150}" y="${row*350+22}">${k.name}</text>`}).join('');
 const colors=mode==='culture'?WORLD.kingdoms.map(k=>[k.id,k.color]):WORLD.kingdoms.map(k=>[k.id,k.color]);
 const polys=WORLD.counties.map(c=>{
  let cls='neutral';if(c.holder===S.rulerId)cls='player';else if(WORLD.duchies.find(d=>d.id===c.duchy)?.holder===S.rulerId)cls='vassal';else if(S.wars.some(w=>(w.a===S.rulerId||w.d===S.rulerId)&&w.target===c.id))cls='rival';
  const x=c.x,y=c.y;
  return `<g><polygon data-county="${c.id}" class="county ${cls} ${S.selected===c.id?'sel':''}" points="${x},${y} ${x+c.w},${y-5} ${x+c.w+8},${y+c.h*.45} ${x+c.w-4},${y+c.h} ${x-5},${y+c.h*.9} ${x-10},${y+c.h*.38}"/><text class="countyText" x="${x+c.w/2}" y="${y+c.h/2+4}">${c.name}</text></g>`
 }).join('');
 return `<div class="panel"><div class="panel-head"><div><span class="eyebrow">WORLD ATLAS</span><h3>Known Realms</h3></div><span class="badge">${WORLD.counties.length} counties</span></div><div class="map-toolbar">${[['political','Political'],['culture','Culture'],['faith','Faith'],['economy','Economy']].map(([a,b])=>`<button class="${mode===a?'active':''}" data-mapmode="${a}">${b}</button>`).join('')}</div><div class="map-wrap"><svg class="map-svg" viewBox="0 0 900 800" preserveAspectRatio="xMidYMid meet">${blocks}${polys}</svg></div><div class="legend"><span><i class="dot" style="background:#61775e"></i>Your domain</span><span><i class="dot" style="background:#6f805d"></i>Vassal</span><span><i class="dot" style="background:#875451"></i>Rival</span><span><i class="dot" style="background:#75634c"></i>Independent</span></div></div>`
}
function countyDetail(){
 const c=selected();if(!c)return '<div class="panel empty">No county selected.</div>';const h=WORLD.chars[c.holder];
 const own=c.holder===S.rulerId||WORLD.duchies.find(d=>d.id===c.duchy)?.holder===S.rulerId;
 return `<div class="panel"><div class="detail"><div class="detail-top"><div><span class="eyebrow">COUNTY DETAIL</span><h3>${c.name}</h3><div class="sub">${c.terrain} · ${c.culture} · ${c.faith}</div></div><span class="badge">${own?'YOUR REALM':'FOREIGN'}</span></div><div class="grid3" style="margin-top:11px"><div class="metric"><span>Holder</span><b>${h?.name||'Vacant'}</b></div><div class="metric"><span>Development</span><b>${c.dev}</b></div><div class="metric"><span>Taxes</span><b>${c.tax.toFixed(1)}</b></div><div class="metric"><span>Garrison</span><b>${c.garrison}</b></div><div class="metric"><span>Levies</span><b>${c.levy}</b></div><div class="metric"><span>Population</span><b>${Math.floor(c.population)}</b></div></div><div class="action-grid">${own?`<button class="action" data-caction="develop"><b>Develop County</b><span>-45 gold · +1 development</span></button><button class="action" data-caction="granary"><b>Build Granary</b><span>-30 gold · +food</span></button><button class="action" data-caction="gift"><b>Send Gift</b><span>-15 gold · +18 opinion</span></button><button class="action" data-caction="recruit"><b>Raise Local Levy</b><span>+120 levies</span></button>`:`<button class="action" data-caction="claim"><b>Fabricate Claim</b><span>-30 prestige</span></button><button class="action" data-caction="inspect"><b>Study Province</b><span>Reveal details</span></button>`}</div></div></div>`
}
function realm(){
 const r=ruler(),own=WORLD.counties.filter(c=>c.holder===r.id),vass=WORLD.counties.filter(c=>WORLD.duchies.find(d=>d.id===c.duchy)?.holder===r.id),food=Math.round(own.reduce((n,c)=>n+c.food,0)/Math.max(1,own.length));
 return `<div class="hero"><div><span class="eyebrow">THE AGE OF CROWNS</span><h2>Your Realm</h2><p>Rule, build, marry, negotiate and fight for your house.</p></div></div>${mapSVG()}${countyDetail()}<div class="panel"><div class="panel-head"><div><span class="eyebrow">REALM STATUS</span><h3>At a glance</h3></div><span class="badge">${WORLD.kingdoms.find(k=>k.holder===r.id)?.name||'Duchy'}</span></div><div class="section grid3"><div class="metric"><span>Domain</span><b>${own.length}</b></div><div class="metric"><span>Vassal land</span><b>${vass.length}</b></div><div class="metric"><span>Avg food</span><b>${food}</b></div><div class="metric"><span>Population</span><b>${Math.floor(own.reduce((n,c)=>n+c.population,0))}</b></div><div class="metric"><span>Stability</span><b>${Math.floor(clamp(45+S.legitimacy*.35-S.stress*.18,0,100))}</b></div><div class="metric"><span>Dynasty renown</span><b>${Math.floor(S.dynastyRenown)}</b></div></div></div><div class="panel"><div class="panel-head"><div><span class="eyebrow">RECENT CHRONICLE</span><h3>What happened</h3></div></div><div class="section">${S.events.map(e=>`<div class="event">${e.text}<time>${e.year}.${String(e.month).padStart(2,'0')}</time></div>`).join('')||'<div class="empty">The chronicle awaits your first decision.</div>'}</div></div>`
}
