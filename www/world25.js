// Dynasty Realms v0.25 - Second Grand World Expansion
const WORLD25_K=[
{id:"k_dorvan",name:"Kingdom of Dorvan",holder:"c_adran",capital:"c_dorvan_gate",culture:"dorvanic",faith:"stone_law"},
{id:"k_nareth",name:"Kingdom of Nareth",holder:"c_isolde",capital:"c_nareth_gate",culture:"nareth",faith:"star_path"}
];
const WORLD25_D=[
["d_dor_north","Duchy of the Northwood","k_dorvan","c_lynd"],
["d_dor_crown","Duchy of the Crown Vale","k_dorvan","c_marren"],
["d_dor_coast","Duchy of the Sapphire Coast","k_dorvan","c_avel"],
["d_nat_high","Duchy of the High Kingdom","k_nareth","c_venn"],
["d_nat_heart","Duchy of the Green Heart","k_nareth","c_sera"],
["d_nat_coast","Duchy of the Star Coast","k_nareth","c_omer"]
];
const WORLD25_C=[
["c_dorvan_gate","Dorvan Gate","d_dor_north","c_adran",10,3.2,220,300,"plains"],
["c_lynd","Lyndwood","d_dor_north","c_lynd",9,2.8,190,270,"forest"],
["c_winteroak","Winteroak","d_dor_north","c_winteroak",7,2.0,150,220,"forest"],
["c_marren","Marren Vale","d_dor_crown","c_marren",12,4.8,260,380,"plains"],
["c_swanfield","Swanfield","d_dor_crown","c_swanfield",10,3.6,220,320,"plains"],
["c_redspire","Redspire","d_dor_crown","c_redspire",8,2.9,230,300,"hills"],
["c_avel","Avelport","d_dor_coast","c_avel",13,5.5,300,420,"coast"],
["c_seabright","Seabright","d_dor_coast","c_seabright",10,4.2,210,330,"coast"],
["c_tidewatch","Tidewatch","d_dor_coast","c_tidewatch",8,3.0,180,250,"coast"],
["c_nareth_gate","Nareth Gate","d_nat_high","c_isolde",9,3.0,220,300,"hills"],
["c_venn","Venn March","d_nat_high","c_venn",10,4.0,250,350,"mountains"],
["c_crownhold","Crownhold","d_nat_high","c_crownhold",8,2.7,240,280,"hills"],
["c_sera","Seravale","d_nat_heart","c_sera",12,4.7,240,370,"plains"],
["c_blossom","Blossom Vale","d_nat_heart","c_blossom",11,3.9,210,330,"forest"],
["c_hazelplain","Hazelplain","d_nat_heart","c_hazelplain",9,3.1,180,280,"plains"],
["c_omer","Omer Coast","d_nat_coast","c_omer",11,4.8,250,370,"coast"],
["c_starseat","Starseat","d_nat_coast","c_starseat",10,4.0,230,320,"coast"],
["c_nightbay","Nightbay","d_nat_coast","c_nightbay",8,3.4,190,270,"coast"]
];
const WORLD25_DUKES=[
["c_lynd","Duke Lynd","House Lynd",43,10,8,9,7,5,["Brave","Diligent"]],
["c_marren","Duke Marren","House Marren",39,8,12,11,6,8,["Patient","Ambitious"]],
["c_avel","Duchess Avel","House Avel",34,7,11,10,9,9,["Diplomat","Ambitious"]],
["c_venn","Duke Venn","House Venn",46,12,6,8,7,4,["Wrathful","Brave"]],
["c_sera","Duchess Sera","House Seraine",37,6,13,12,8,10,["Kind","Diligent"]],
["c_omer","Duke Omer","House Omer",41,9,8,9,10,6,["Deceitful","Ambitious"]]
];
const WORLD25_COUNTS=[
["c_winteroak","Count Rellan","House Rellan"],["c_swanfield","Countess Swan","House Swan"],["c_redspire","Count Halven","House Halven"],
["c_seabright","Countess Brina","House Brina"],["c_tidewatch","Count Tor","House Tor"],["c_crownhold","Countess Ysolde","House Ysolde"],
["c_blossom","Count Brevin","House Brevin"],["c_hazelplain","Countess Nera","House Nera"],["c_starseat","Count Olan","House Olan"],["c_nightbay","Countess Nyra","House Nyra"]
];
const WORLD25_ALL=[
["c_winteroak","Count Rellan","House Rellan"],["c_swanfield","Countess Swan","House Swan"],["c_redspire","Count Halven","House Halven"],
["c_seabright","Countess Brina","House Brina"],["c_tidewatch","Count Tor","House Tor"],["c_crownhold","Countess Ysolde","House Ysolde"],
["c_blossom","Count Brevin","House Brevin"],["c_hazelplain","Countess Nera","House Nera"],["c_starseat","Count Olan","House Olan"],["c_nightbay","Countess Nyra","House Nyra"]
];
function seed25(id,name,dyn,age,m,d,s,i,l,traits,culture,faith){return{id,name,age,sex:name.includes("Queen")||name.includes("Duchess")||name.includes("Countess")?"f":"m",dynasty:dyn,title:name,martial:m,diplomacy:d,stewardship:s,intrigue:i,learning:l,traits,opinion:4,alive:true,spouse:null,father:null,mother:null,children:[],health:92,fertility:.65,culture,faith}}
function addWorld25(){
 if(WORLD.kingdoms?.some(k=>k.id==="k_dorvan"))return;
 WORLD.kingdoms=WORLD.kingdoms||[];WORLD.duchies=WORLD.duchies||[];WORLD.counties=WORLD.counties||[];WORLD.titles=WORLD.titles||[];WORLD.characters=WORLD.characters||{};
 WORLD.cultures.dorvanic={name:"Dorvanic",group:"Western",heritage:"Valic",description:"A frontier culture balancing estates, ports and royal roads."};
 WORLD.cultures.nareth={name:"Narethi",group:"Eastern",heritage:"Lothic",description:"A coastal culture bound to star navigation and temple guilds."};
 WORLD.faiths.stone_law={name:"Stone Law",group:"Lawbound",piety:"Balanced",description:"A faith emphasizing oaths, stone shrines and lawful rule."};
 WORLD.faiths.star_path={name:"Star Path",group:"Mystic",piety:"Balanced",description:"A faith of navigation, constellations and sacred journeys."};
 const kings=[
 ["c_adran","King Adran","House Adran",48,10,9,10,7,6,["Ambitious","Diligent"],"dorvanic","stone_law"],
 ["c_isolde","Queen Isolde","House Isolde",43,8,12,11,8,10,["Calm","Diplomat"],"nareth","star_path"]];
 kings.forEach(x=>WORLD.characters[x[0]]=seed25(x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],x[10],x[11]));
 WORLD25_DUKES.forEach(x=>WORLD.characters[x[0]]=seed25(x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],WORLD25_K[Math.floor(WORLD25_DUKES.indexOf(x)/3)].culture,WORLD25_K[Math.floor(WORLD25_DUKES.indexOf(x)/3)].faith));
 WORLD25_ALL.forEach((x,ii)=>{const kidx=ii<5?0:1;const k=WORLD25_K[kidx];WORLD.characters[x[0]]=seed25(x[0],x[1],x[2],30+ii%13,5+ii%6,7+ii%5,7+ii%5,5+ii%5,5+ii%4,[["Content","Diligent","Kind","Ambitious","Brave"][ii%5]],k.culture,k.faith)});
 WORLD25_K.forEach(k=>{WORLD.kingdoms.push({...k,tier:"kingdom"});WORLD.titles.push({id:k.id,name:k.name,type:"kingdom",parent:null,holder:k.holder,deJure:true})});
 WORLD25_D.forEach(d=>{WORLD.duchies.push({id:d[0],name:d[1],deJure:d[1].replace("Duchy of ",""),capital:null,tier:"duchy",holder:d[3],parent:d[2]});WORLD.titles.push({id:d[0],name:d[1],type:"duchy",parent:d[2],holder:d[3],deJure:true})});
 WORLD25_C.forEach((r,i)=>{const id=r[0],name=r[1],did=r[2],holder=r[3],c={id,name,duchy:did,status:"neutral",dev:r[4],tax:r[5],garrison:r[6],levy:r[7],x:972+(i%3)*155,y:642+Math.floor((i%9)/3)*175+(Math.floor(i/9)*30),points:rect20(900+(i%3)*155,565+Math.floor((i%9)/3)*175+(Math.floor(i/9)*30),145,155),barony:name+" Hold",fort:2,terrain:r[8],culture:i<9?"dorvanic":"nareth",faith:i<9?"stone_law":"star_path",control:70,siege:0,supply:Math.max(60,r[4]*28),prosperity:60+r[4],population:r[4]*10+50,food:70+r[4]*2,localPrice:1,workforce:r[4]*5};WORLD.counties.push(c);WORLD.titles.push({id,name:"County of "+name,type:"county",parent:did,holder,deJure:true});WORLD.titles.push({id:id+"_barony",name:c.barony,type:"barony",parent:id,holder,deJure:true});const d=WORLD.duchies.find(x=>x.id===did);if(d&&!d.capital)d.capital=id});
 // Ensure duchy capital is its duke and count holders exist separately.
 WORLD25_D.forEach(d=>{const h=d[3],titleId=d[0];if(titleId&&h){const t=title(titleId);if(t)t.holder=h}});
 link20("c_nightbay","c_mistmoor");link20("c_avel","c_blackharbor");link20("c_dorvan_gate","c_greyfen");link20("c_nareth_gate","c_deltaport");
 for(let b=0;b<2;b++){const off=b*9;for(let d=0;d<3;d++){const s=off+d*3;link20(WORLD25_C[s][0],WORLD25_C[s+1][0]);link20(WORLD25_C[s+1][0],WORLD25_C[s+2][0]);if(d<2)link20(WORLD25_C[s+2][0],WORLD25_C[s+3][0])}}
}
addWorld25();