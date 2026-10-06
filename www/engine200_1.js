const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const K=[
 {id:'arvend',name:'Arvend',culture:'Arvendic',faith:'Old Church',color:'#61775e',dukes:[['Northern Marches','Northwatch','Ironford','Pinefall'],['Eastern Reach','Sunmere','Redvale','Highmoor'],['Gold Coast','Goldcoast','Eastmere','Windport']]},
 {id:'valedorn',name:'Valedorn',culture:'Valedornic',faith:'Sun Covenant',color:'#875451',dukes:[['Storm Coast','Stormwatch','Lake Aster','Saltwatch'],['Frostlands','Frostmarch','Whitehaven','Pinecrest'],['Black Coast','Blackharbor','Darkfen','Crownsend']]},
 {id:'ferrowen',name:'Ferrowen',culture:'Ferrowic',faith:'Old Church',color:'#83694f',dukes:[['Heartlands','Greyfen','Briarhall','Amberfield'],['Ashen Vale','Ashgate','Emberfall','Grimpeak'],['Mist Isles','Seagard','Mistmoor','Islewatch']]},
 {id:'dorvan',name:'Dorvan',culture:'Dorvanic',faith:'Stone Law',color:'#6d765b',dukes:[['Northwood','Lyndwood','Winteroak','Pinehall'],['Crown Vale','Marren Vale','Swanfield','Redspire'],['Sapphire Coast','Avelport','Seabright','Tidewatch']]},
 {id:'nareth',name:'Nareth',culture:'Nareth',faith:'Star Path',color:'#5f7180',dukes:[['High Kingdom','Nareth Gate','Venn March','Crownhold'],['Green Heart','Seravale','Blossom Vale','Hazelplain'],['Star Coast','Omer Coast','Starseat','Nightbay']]},
 {id:'lyrion',name:'Lyrion',culture:'Lyric',faith:'Moon Faith',color:'#6d5f7d',dukes:[['Silver North','Silverkeep','Moorgate','Highmere'],['Crownfields','Crownford','Kingsfield','Ravenshire'],['Azure Coast','Azureport','Bluehaven','Seabreak']]}
];
const first=['Alden','Beren','Corin','Darian','Edwin','Garrick','Halric','Joren','Kael','Loran','Marek','Oren','Ronan','Serin','Torren','Varek','Ysolde','Nyra','Maelia','Ysara','Isolde','Lyra','Sera','Vesa'];
const last=['Vael','Veyne','Calder','Ferron','Orwyn','Rellan','Draven','Merrow','Marren','Avel','Serin','Orren'];
const traits=['Brave','Diligent','Patient','Ambitious','Calm','Clever','Temperate','Zealous'];
const WORLD={kingdoms:[],duchies:[],counties:[],chars:{},adj:{}};
function person(id,name,age,sex,culture,faith,dynasty,stat){return{id,name,age,sex,culture,faith,dynasty,alive:true,spouse:null,children:[],traits:[traits[id.length%traits.length],traits[(id.length+2)%traits.length]],martial:stat+2,diplomacy:stat+3,stewardship:stat+2,intrigue:stat+1,learning:stat+1,opinion:10,health:90+stat}};
let pi=0;
for(let ki=0;ki<K.length;ki++){
 const k=K[ki], kingId='king_'+k.id, king=person(kingId,(ki%2?'Queen ':'King ')+first[pi%first.length]+' '+last[pi%last.length],40+ki%8,ki%2?'f':'m',k.culture,k.faith,'House '+last[pi%last.length],8+ki%4);pi++;king.title='Kingdom of '+k.name;WORLD.chars[kingId]=king;WORLD.kingdoms.push({id:k.id,name:'Kingdom of '+k.name,holder:kingId,capital:null,culture:k.culture,faith:k.faith});
 for(let di=0;di<3;di++){
  const d=k.dukes[di],did=k.id+'_d'+di,dukeId='duke_'+did,duke=person(dukeId,(di===1?'Duchess ':'Duke ')+first[pi%first.length]+' '+last[pi%last.length],30+((ki+di)%15),di===1?'f':'m',k.culture,k.faith,'House '+last[pi%last.length],6+((ki+di)%5));pi++;duke.title='Duchy of the '+d[0];WORLD.chars[dukeId]=duke;WORLD.duchies.push({id:did,name:'Duchy of the '+d[0],parent:k.id,holder:dukeId,capital:null});
  for(let ci=0;ci<3;ci++){
   const cid=k.id+'_c'+di+ci, name=d[ci+1], countId='count_'+cid, count=person(countId,(ci===1&&di%2?'Countess ':'Count ')+first[pi%first.length]+' '+last[pi%last.length],26+((ki+di+ci)%20),ci===1&&di%2?'f':'m',k.culture,k.faith,'House '+last[pi%last.length],4+((ci+ki)%4));pi++;count.title='Count of '+name;WORLD.chars[countId]=count;
   const c={id:cid,name,duchy:did,kingdom:k.id,holder:countId,dev:7+((ki+di+ci)%7),tax:1.6+((ki+di+ci)%8)*.45,garrison:120+((ki+di+ci)*25),levy:190+((di+ci)*35)+ki*15,population:90+(ki+di+ci)*16,food:76+(ci*5),control:72,prosperity:60+(di*5),terrain:(di===2?'coast':ci===1?'forest':'plains'),culture:k.culture,faith:k.faith,x:0,y:0,w:0,h:0};
   WORLD.counties.push(c);WORLD.kingdoms[ki].capital??=cid;WORLD.duchies.at(-1).capital??=cid;
  }
 }
}
WORLD.titles=[];WORLD.kingdoms.forEach(k=>WORLD.titles.push({id:k.id,name:k.name,type:'kingdom',holder:k.holder,parent:null}));WORLD.duchies.forEach(d=>WORLD.titles.push({id:d.id,name:d.name,type:'duchy',holder:d.holder,parent:d.parent}));WORLD.counties.forEach(c=>WORLD.titles.push({id:c.id,name:c.name,type:'county',holder:c.holder,parent:c.duchy}));
for(let i=0;i<WORLD.counties.length;i++){const c=WORLD.counties[i],ki=Math.floor(i/9),local=i%9,lr=Math.floor(local/3),lc=local%3,col=ki%3,row=Math.floor(ki/3);c.x=42+col*300+lc*84;c.y=45+row*350+lr*95;c.w=78;c.h=88;}
for(const c of WORLD.counties){const same=WORLD.counties.filter(x=>x.kingdom===c.kingdom&&x!==c);WORLD.adj[c.id]=[];same.forEach(x=>{if(Math.abs(c.x-x.x)<=90&&Math.abs(c.y-x.y)<=100)WORLD.adj[c.id].push(x.id)});}
function stateFresh(rulerId){const r=WORLD.chars[rulerId];const owned=WORLD.counties.filter(c=>c.holder===rulerId);return{version:200,year:1066,month:9,paused:false,speed:1,screen:'realm',rulerId,selected:owned[0]?.id||WORLD.counties[0].id,gold:120,prestige:100,piety:65,legitimacy:78,stress:18,levies:owned.reduce((n,c)=>n+c.levy,0),troopCap:Math.max(800,owned.reduce((n,c)=>n+c.levy,0)*2),army:{location:owned[0]?.id||WORLD.counties[0].id,men:Math.max(400,Math.floor(owned.reduce((n,c)=>n+c.levy,0)*.62)),morale:100,supply:100,fatigue:0},relations:{},wars:[],events:[],council:{chancellor:null,marshal:null,steward:null,spymaster:null,chaplain:null},children:[],spouse:null,dynastyRenown:20};}
let S=null;
function storeGet(){try{return JSON.parse(localStorage.getItem('dynasty_realms_v200')||'null')}catch(e){return null}}
function storePut(){try{localStorage.setItem('dynasty_realms_v200',JSON.stringify(S))}catch(e){}}
function selected(){return WORLD.counties.find(c=>c.id===S.selected)}
function ruler(){return WORLD.chars[S.rulerId]}
function ownerKing(c){return WORLD.kingdoms.find(k=>k.id===c.kingdom)}
function relation(id){return S.relations[id]??WORLD.chars[id]?.opinion??0}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1500)}
function log(text){S.events.unshift({text,year:S.year,month:S.month});S.events=S.events.slice(0,10)}
