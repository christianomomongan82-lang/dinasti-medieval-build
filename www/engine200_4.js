function openModal(inner){const m=$("#modal");m.innerHTML='<div class="sheet">'+inner+'</div>';m.classList.add("open");const c=m.querySelector("[data-close]");if(c)c.onclick=closeModal}
function closeModal(){$("#modal").classList.remove("open");$("#modal").innerHTML=""}
function chooseCouncil(role){
 const stat={chancellor:"diplomacy",marshal:"martial",steward:"stewardship",spymaster:"intrigue",chaplain:"learning"}[role];
 const pool=Object.values(WORLD.chars).filter(c=>c.alive&&c.id!==S.rulerId).sort((a,b)=>(b[stat]||0)-(a[stat]||0)).slice(0,14);
 openModal('<div class="sheet-head"><div><span class="eyebrow">ROYAL APPOINTMENT</span><h2>Choose '+role+'</h2></div><button class="close" data-close>×</button></div><div class="cards">'+pool.map(v=>'<button class="list-card pick" data-pick="'+v.id+'"><div><b>'+v.name+'</b><small>'+v.title+' · '+v.dynasty+'</small></div><strong>'+v[stat]+'</strong></button>').join('')+'</div>');
 $$('[data-pick]').forEach(b=>b.onclick=()=>{S.council[role]=b.dataset.pick;closeModal();log(WORLD.chars[b.dataset.pick].name+' appointed as '+role+'.');render();storePut()})
}
function countyAction(a){
 const c=selected(),h=c&&WORLD.chars[c.holder];if(!c)return;
 const own=c.holder===S.rulerId||WORLD.duchies.find(d=>d.id===c.duchy)?.holder===S.rulerId;
 if(a==='develop'&&own){if(S.gold<45)return toast('Need 45 gold');S.gold-=45;c.dev++;c.prosperity+=4;c.tax+=.2;log(c.name+' received a development charter.')}
 if(a==='granary'&&own){if(S.gold<30)return toast('Need 30 gold');S.gold-=30;c.food+=25;log('A granary was built in '+c.name+'.')}
 if(a==='gift'&&own){if(S.gold<15)return toast('Need 15 gold');S.gold-=15;S.relations[c.holder]=relation(c.holder)+18;log('The crown sent a gift to '+(h?.name||'the local lord')+'.')}
 if(a==='recruit'&&own){const n=Math.min(120,S.troopCap-S.levies);S.levies+=n;S.army.men+=Math.floor(n*.3);log('Local levies answered the royal summons in '+c.name+'.')}
 if(a==='claim'&&!own){if(S.prestige<30)return toast('Need 30 prestige');S.prestige-=30;c.claimedBy=S.rulerId;log('A legal claim was fabricated on '+c.name+'.')}
 if(a==='inspect'){toast(c.name+': '+Math.floor(c.population)+' people · food '+Math.floor(c.food)+' · control '+Math.floor(c.control));return}
 render();storePut()
}
function diplomacyAction(id,kind){
 const v=WORLD.chars[id];if(!v)return;
 if(kind==='gift'){if(S.gold<15)return toast('Need 15 gold');S.gold-=15;S.relations[id]=clamp(relation(id)+18,-100,100);log('Diplomatic gift sent to '+v.name+'.')}
 if(kind==='alliance'){if(S.prestige<25)return toast('Need 25 prestige');S.prestige-=25;S.relations[id]=clamp(relation(id)+25,-100,100);log(v.name+' accepted a dynasty alliance.')}
 if(kind==='trade'){if(S.prestige<20)return toast('Need 20 prestige');S.prestige-=20;S.tradeRoutes=(S.tradeRoutes||0)+1;log('A merchant charter opened a new trade route.')}
 render();storePut()
}
function dynAction(a){
 if(a!=='marry')return;
 const r=ruler(),target=Object.values(WORLD.chars).find(c=>c.alive&&c.id!==r.id&&c.sex!==r.sex&&c.age>=16&&c.age<=45&&c.spouse==null);
 if(!target)return toast('No suitable match');
 r.spouse=target.id;target.spouse=r.id;S.spouse=target.id;S.legitimacy=clamp(S.legitimacy+4,0,100);log(r.name+' married '+target.name+'.');render();storePut()
}
function warAction(a){
 const c=selected();if(!c)return;
 if(a==='move'){S.army.location=c.id;S.army.supply=clamp(S.army.supply-4,0,100);S.army.fatigue=clamp(S.army.fatigue+2,0,100);toast('Army moved to '+c.name);render();storePut();return}
 if(a==='recruit'){if(S.gold<25)return toast('Need 25 gold');S.gold-=25;const n=Math.min(150,S.troopCap-S.levies);S.levies+=n;S.army.men+=n;log('150 troops were recruited for the field army.')}
 if(a==='train'){if(S.gold<10)return toast('Need 10 gold');S.gold-=10;S.army.morale=clamp(S.army.morale+10,0,100);S.army.fatigue=clamp(S.army.fatigue-8,0,100);log('The host completed a military drill.')}
 if(a==='battle'){
   const enemy=180+c.garrison*.75+c.fort*90; if(S.army.location!==c.id)return toast('Move the army to the target first');
   const power=S.army.men*(S.army.morale/100)*(S.army.supply/100)*(1-S.army.fatigue/220);
   const ratio=power/Math.max(1,enemy);
   const ownLoss=Math.max(18,Math.floor(S.army.men*(ratio>.9?.06:.13))),enemyLoss=Math.max(25,Math.floor(enemy*(ratio>1?.11:.06)));
   S.army.men=Math.max(0,S.army.men-ownLoss);c.garrison=Math.max(0,c.garrison-enemyLoss);S.army.morale=clamp(S.army.morale-(ratio>.9?5:15),0,100);S.army.fatigue=clamp(S.army.fatigue+10,0,100);
   if(ratio>1){c.siege+=18;c.control=clamp(c.control-5,0,100);S.wars.push({id:'w'+Date.now(),a:S.rulerId,d:c.holder,target:c.id,name:'War for '+c.name,score:Math.round(ratio*12),months:1});log('Victory at '+c.name+': '+ownLoss+' friendly losses, roughly '+enemyLoss+' enemy losses.')}else log('The army was repulsed at '+c.name+'.'); 
 }
 render();storePut()
}
function declareWar(){
 const c=selected();if(!c)return;
 if(c.holder===S.rulerId)return toast('That county is already yours');
 if(c.claimedBy!==S.rulerId)return toast('Fabricate a claim first');
 S.wars.push({id:'w'+Date.now(),a:S.rulerId,d:c.holder,target:c.id,name:'War for '+c.name,score:0,months:0});log('War declared for the county of '+c.name+'.');render();storePut()
}
function settings(){
 openModal('<div class="sheet-head"><div><span class="eyebrow">GAME</span><h2>Settings</h2></div><button class="close" data-close>×</button></div><div class="cards"><button class="action" data-set="save"><b>Save Campaign</b><span>Write current state to the device.</span></button><button class="action" data-set="new"><b>New Campaign</b><span>Choose another ruler.</span></button><button class="action" data-set="reset"><b>Reset Everything</b><span>Clear the clean v2.0 save.</span></button></div>');
 $$('[data-set]').forEach(b=>b.onclick=()=>{if(b.dataset.set==='save'){storePut();toast('Saved');closeModal()}else if(b.dataset.set==='new'){closeModal();showStart()}else{localStorage.removeItem('dynasty_realms_v200');location.reload()}})
}
function bind(){
 $$('[data-nav]').forEach(b=>b.onclick=()=>screen(b.dataset.nav));
 $$('[data-top]').forEach(b=>b.onclick=()=>b.dataset.top==='pause'?(S.paused=!S.paused,render()):settings());
 $$('[data-county]').forEach(p=>p.onclick=()=>{S.selected=p.dataset.county;render()});
 $$('[data-mapmode]').forEach(b=>b.onclick=()=>{S.mapMode=b.dataset.mapmode;render()});
 $$('[data-caction]').forEach(b=>b.onclick=()=>countyAction(b.dataset.caction));
 $$('[data-council]').forEach(b=>b.onclick=()=>chooseCouncil(b.dataset.council));
 $$('[data-dipl]').forEach(b=>b.onclick=()=>diplomacyAction(b.dataset.dipl,b.dataset.kind));
 $$('[data-war]').forEach(b=>b.onclick=()=>b.dataset.war==='declare'?declareWar():warAction(b.dataset.war));
 $$('[data-dyn]').forEach(b=>b.onclick=()=>dynAction(b.dataset.dyn));
}
function monthTick(){
 if(S.paused)return;
 S.month++;if(S.month>12){S.month=1;S.year++}
 const own=WORLD.counties.filter(c=>c.holder===S.rulerId),vass=WORLD.counties.filter(c=>WORLD.duchies.find(d=>d.id===c.duchy)?.holder===S.rulerId);
 let income=own.reduce((n,c)=>n+c.tax*(1+c.dev*.025),0)+vass.reduce((n,c)=>n+c.tax*.25,0);S.gold+=income-3;
 own.forEach(c=>{c.food=clamp(c.food+(c.terrain==='plains'?3:1.5)-c.population*.003,0,150);c.population=Math.max(30,c.population+(c.food>55?Math.floor(c.population*.006):-Math.floor(c.population*.003));c.prosperity=clamp(c.prosperity+(c.food>60?.6:-.8),0,100)});
 S.army.supply=clamp(S.army.supply-(S.army.location===S.selected?1.5:3),0,100);S.army.fatigue=clamp(S.army.fatigue-(S.army.location===S.selected?1:0),0,100);S.levies=Math.min(S.troopCap,Math.floor(S.levies+income*.45));S.stress=clamp(S.stress+(S.gold<20?2:-.3),0,100);
 if(S.month%12===0)log('A new year begins. The realm has earned '+Math.floor(income*12)+' gold in annual revenue.');
 if(S.month%3===0){WORLD.chars[ruler().id].age+=.01}
 storePut();render()
}
$("#modal").onclick=e=>{if(e.target.id==='modal')closeModal()}
function bootClean(){const old=storeGet();if(old&&WORLD.chars[old.rulerId]){S=old;render()}else{S=null;showStart()}}
setInterval(()=>monthTick(),4500);
bootClean();
