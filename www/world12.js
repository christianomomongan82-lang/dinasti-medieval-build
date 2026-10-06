// Dynasty Realms v0.12 - expanded political map

if(!WORLD.kingdoms)WORLD.kingdoms=[{id:"k_arvend",name:"Kingdom of Arvend",holder:"c_edric"},{id:"k_valedorn",name:"Kingdom of Valedorn",holder:"c_garrick"},{id:"k_southreach",name:"Kingdom of Southreach",holder:"c_morren"}];

WORLD.duchies.push(
  {id:"d_frost",name:"Duchy of the Frostlands",deJure:"Frostlands",capital:"c_frostmarch",tier:"duchy"},
  {id:"d_storm",name:"Duchy of the Storm Coast",deJure:"Storm Coast",capital:"c_stormwatch",tier:"duchy"},
  {id:"d_south",name:"Duchy of the Southern Vale",deJure:"Southern Vale",capital:"c_dunwall",tier:"duchy"},
  {id:"d_black",name:"Duchy of the Black Coast",deJure:"Black Coast",capital:"c_blackharbor",tier:"duchy"}
);

WORLD.counties.push(
  {id:"c_frostmarch",name:"Frostmarch",duchy:"d_frost",status:"rival",dev:7,tax:1.8,garrison:150,levy:230,x:70,y:48,points:"20,20 100,10 140,50 95,85 25,70",barony:"Frostmarch Keep",fort:3,terrain:"mountains"},
  {id:"c_whitehaven",name:"Whitehaven",duchy:"d_frost",status:"neutral",dev:8,tax:2.4,garrison:180,levy:250,x:220,y:55,points:"140,20 260,15 300,55 248,98 140,90",barony:"Whitehaven Hall",fort:2,terrain:"hills"},
  {id:"c_stormwatch",name:"Stormwatch",duchy:"d_storm",status:"rival",dev:9,tax:3.2,garrison:250,levy:340,x:600,y:55,points:"510,20 620,15 690,60 630,105 520,90",barony:"Stormwatch Castle",fort:4,terrain:"coast"},
  {id:"c_lakeaster",name:"Lake Aster",duchy:"d_storm",status:"neutral",dev:7,tax:2.5,garrison:170,levy:220,x:665,y:160,points:"620,105 720,95 720,190 690,225 610,180",barony:"Aster Hold",fort:2,terrain:"plains"},
  {id:"c_dunwall",name:"Dunwall",duchy:"d_south",status:"neutral",dev:6,tax:1.5,garrison:120,levy:180,x:60,y:335,points:"0,300 70,265 135,320 110,395 25,390",barony:"Dunwall Fort",fort:2,terrain:"hills"},
  {id:"c_westmoor",name:"Westmoor",duchy:"d_south",status:"neutral",dev:8,tax:2.2,garrison:155,levy:230,x:180,y:375,points:"110,325 220,300 260,360 230,425 130,425",barony:"Westmoor Hall",fort:2,terrain:"forest"},
  {id:"c_silverfen",name:"Silverfen",duchy:"d_south",status:"neutral",dev:9,tax:3.1,garrison:190,levy:280,x:355,y:400,points:"260,350 370,335 455,385 430,430 270,430",barony:"Silverfen Keep",fort:3,terrain:"marsh"},
  {id:"c_blackharbor",name:"Blackharbor",duchy:"d_black",status:"neutral",dev:10,tax:4.4,garrison:290,levy:410,x:630,y:380,points:"530,325 620,290 720,320 720,430 570,430",barony:"Blackport",fort:3,terrain:"coast"}
);

const extraChars={
  c_garrick:{id:"c_garrick",name:"King Garrick",age:46,sex:"m",dynasty:"House Veyne",title:"King of Valedorn",martial:10,diplomacy:7,stewardship:8,intrigue:5,learning:5,traits:["Ambitious","Brave"],opinion:-12,alive:true,spouse:null,father:null,mother:null,children:[],health:91,fertility:.62},
  c_lyra:{id:"c_lyra",name:"Duchess Lyra",age:34,sex:"f",dynasty:"House Veyne",title:"Duchess of the Storm Coast",martial:7,diplomacy:11,stewardship:9,intrigue:8,learning:7,traits:["Diligent"],opinion:-5,alive:true,spouse:null,father:null,mother:null,children:[],health:96,fertility:.72},
  c_morren:{id:"c_morren",name:"King Morren",age:42,sex:"m",dynasty:"House Calder",title:"King of Southreach",martial:8,diplomacy:10,stewardship:12,intrigue:7,learning:6,traits:["Patient","Diligent"],opinion:18,alive:true,spouse:null,father:null,mother:null,children:[],health:94,fertility:.68},
  c_seraphine:{id:"c_seraphine",name:"Duchess Seraphine",age:38,sex:"f",dynasty:"House Calder",title:"Duchess of the Black Coast",martial:6,diplomacy:9,stewardship:11,intrigue:9,learning:8,traits:["Calm","Ambitious"],opinion:9,alive:true,spouse:null,father:null,mother:null,children:[],health:95,fertility:.66},
  c_aldren:{id:"c_aldren",name:"Count Aldren",age:37,sex:"m",dynasty:"House Aldren",title:"Count of Whitehaven",martial:7,diplomacy:6,stewardship:9,intrigue:5,learning:5,traits:["Content"],opinion:4,alive:true,spouse:null,father:null,mother:null,children:[],health:93,fertility:.65},
  c_tavia:{id:"c_tavia",name:"Countess Tavia",age:31,sex:"f",dynasty:"House Tavia",title:"Countess of Lake Aster",martial:5,diplomacy:8,stewardship:10,intrigue:7,learning:7,traits:["Calm"],opinion:3,alive:true,spouse:null,father:null,mother:null,children:[],health:96,fertility:.73},
  c_jonas:{id:"c_jonas",name:"Count Jonas",age:45,sex:"m",dynasty:"House Jonas",title:"Count of Dunwall",martial:9,diplomacy:6,stewardship:6,intrigue:4,learning:3,traits:["Brave"],opinion:5,alive:true,spouse:null,father:null,mother:null,children:[],health:89,fertility:.56},
  c_maera:{id:"c_maera",name:"Countess Maera",age:33,sex:"f",dynasty:"House Maera",title:"Countess of Westmoor",martial:4,diplomacy:10,stewardship:9,intrigue:8,learning:8,traits:["Kind"],opinion:12,alive:true,spouse:null,father:null,mother:null,children:[],health:97,fertility:.75},
  c_darin:{id:"c_darin",name:"Count Darin",age:40,sex:"m",dynasty:"House Darin",title:"Count of Silverfen",martial:6,diplomacy:7,stewardship:10,intrigue:6,learning:6,traits:["Frugal"],opinion:8,alive:true,spouse:null,father:null,mother:null,children:[],health:92,fertility:.63},
  c_kael:{id:"c_kael",name:"Count Kael",age:36,sex:"m",dynasty:"House Kael",title:"Count of Blackharbor",martial:8,diplomacy:8,stewardship:9,intrigue:7,learning:5,traits:["Ambitious"],opinion:-2,alive:true,spouse:null,father:null,mother:null,children:[],health:94,fertility:.67}
};
Object.assign(WORLD.characters,extraChars);

WORLD.adjacency.c_northwatch.push("c_frostmarch");
WORLD.adjacency.c_ironford.push("c_whitehaven");
WORLD.adjacency.c_ironford.push("c_stormwatch");
WORLD.adjacency.c_pinefall.push("c_dunwall");
WORLD.adjacency.c_highmoor.push("c_westmoor");
WORLD.adjacency.c_highmoor.push("c_silverfen");
WORLD.adjacency.c_eastmere.push("c_blackharbor");
WORLD.adjacency.c_goldcoast.push("c_stormwatch");
WORLD.adjacency.c_goldcoast.push("c_blackharbor");
WORLD.adjacency.c_frostmarch=["c_northwatch","c_whitehaven"];
WORLD.adjacency.c_whitehaven=["c_frostmarch","c_ironford"];
WORLD.adjacency.c_stormwatch=["c_ironford","c_sunmere","c_goldcoast","c_lakeaster"];
WORLD.adjacency.c_lakeaster=["c_stormwatch","c_goldcoast","c_blackharbor"];
WORLD.adjacency.c_dunwall=["c_pinefall","c_westmoor"];
WORLD.adjacency.c_westmoor=["c_dunwall","c_pinefall","c_highmoor","c_silverfen"];
WORLD.adjacency.c_silverfen=["c_westmoor","c_highmoor","c_eastmere","c_blackharbor"];
WORLD.adjacency.c_blackharbor=["c_goldcoast","c_eastmere","c_lakeaster","c_silverfen"];

const extraDuchyHolders={d_frost:"c_garrick",d_storm:"c_lyra",d_south:"c_morren",d_black:"c_seraphine"};
Object.entries(extraDuchyHolders).forEach(([id,h])=>{
  const d=duchy(id);if(d)d.holder=h;
});
WORLD.counties.forEach(c=>{
  c.culture=c.duchy==="d_frost"?"northlander":c.duchy==="d_south"?"arvendic":"easterner";
  c.faith=c.id==="c_silverfen"?"sun_cult":"old_church";
  c.control=c.control??75;c.siege=c.siege??0;c.supply=c.supply??Math.max(60,c.dev*28);
  const holder={c_frostmarch:"c_garrick",c_whitehaven:"c_aldren",c_stormwatch:"c_lyra",c_lakeaster:"c_tavia",c_dunwall:"c_jonas",c_westmoor:"c_maera",c_silverfen:"c_darin",c_blackharbor:"c_kael"}[c.id];
  if(holder)c.holder=holder;
});

[
  {id:"k_valedorn",name:"Kingdom of Valedorn",type:"kingdom",parent:null,holder:"c_garrick",deJure:true},
  {id:"k_southreach",name:"Kingdom of Southreach",type:"kingdom",parent:null,holder:"c_morren",deJure:true}
].forEach(t=>{if(!WORLD.titles.some(x=>x.id===t.id))WORLD.titles.push(t)});
WORLD.titles.filter(t=>["d_frost","d_storm","d_south","d_black"].includes(t.id)).forEach(t=>{
  if(t.id==="d_frost"||t.id==="d_storm")t.parent="k_valedorn";
  else t.parent="k_southreach";
});
WORLD.duchies.forEach(d=>{
  if(!WORLD.titles.some(t=>t.id===d.id))WORLD.titles.push({id:d.id,name:d.name,type:"duchy",parent:d.id==="d_frost"||d.id==="d_storm"?"k_valedorn":"k_southreach",holder:d.holder,deJure:true});
});
WORLD.counties.filter(c=>c.id.startsWith("c_")).forEach(c=>{
  if(!WORLD.titles.some(t=>t.id===c.id)){
    WORLD.titles.push({id:c.id,name:"County of "+c.name,type:"county",parent:c.duchy,holder:c.holder,deJure:true});
    WORLD.titles.push({id:c.id+"_barony",name:c.barony,type:"barony",parent:c.id,holder:c.holder,deJure:true});
  }
});
Object.values(extraChars).forEach(c=>{c.culture=c.dynasty==="House Veyne"?"northlander":"arvendic";c.faith=c.id==="c_seraphine"?"sun_cult":"old_church"});
