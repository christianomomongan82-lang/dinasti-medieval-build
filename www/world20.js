// Dynasty Realms v0.20 - Grand World Expansion
const WORLD20_KINGDOMS=[
{id:"k_lyrion",name:"Kingdom of Lyrion",holder:"c_caelen",capital:"c_lyrion_gate",culture:"lyric",faith:"moon_faith",x:1135,y:95},
{id:"k_varmark",name:"Kingdom of Varmark",holder:"c_edran",capital:"c_varmark_gate",culture:"varmark",faith:"iron_oath",x:1135,y:270},
{id:"k_serevan",name:"Kingdom of Serevan",holder:"c_oren",capital:"c_serevan_gate",culture:"serevan",faith:"river_way",x:1135,y:445}
];
const WORLD20_DUCHIES=[
{id:"d_lyr_north",name:"Duchy of the Silver North",k:"k_lyrion",holder:"c_davor"},
{id:"d_lyr_crown",name:"Duchy of the Crownfields",k:"k_lyrion",holder:"c_lysa"},
{id:"d_lyr_azure",name:"Duchy of the Azure Coast",k:"k_lyrion",holder:"c_torren"},
{id:"d_var_high",name:"Duchy of the High March",k:"k_varmark",holder:"c_rurik"},
{id:"d_var_iron",name:"Duchy of the Iron Vale",k:"k_varmark",holder:"c_vela"},
{id:"d_var_west",name:"Duchy of the Western Hills",k:"k_varmark",holder:"c_harkan"},
{id:"d_ser_river",name:"Duchy of the River Crown",k:"k_serevan",holder:"c_selene"},
{id:"d_ser_sun",name:"Duchy of the Sunreach",k:"k_serevan",holder:"c_varro"},
{id:"d_ser_delta",name:"Duchy of the Great Delta",k:"k_serevan",holder:"c_mirek"}
];
const WORLD20_COUNTIES=[
["c_lyrion_gate","Lyrion Gate","d_lyr_north","c_caelen",8,2.8,180,250,"forest"],
["c_silverpine","Silverpine","d_lyr_north","c_count_silverpine",10,3.8,230,330,"forest"],
["c_frostmere","Frostmere","d_lyr_north","c_count_frostmere",7,2.1,160,220,"hills"],
["c_lyr_court","Lyrion Court","d_lyr_crown","c_lysa",12,4.9,270,400,"plains"],
["c_amberrest","Amberrest","d_lyr_crown","c_count_amberrest",9,3.4,210,300,"plains"],
["c_greymarch","Greymarch","d_lyr_crown","c_count_greymarch",8,2.7,190,270,"hills"],
["c_azureport","Azureport","d_lyr_azure","c_torren",11,5.2,300,380,"coast"],
["c_saltwind","Saltwind","d_lyr_azure","c_count_saltwind",9,4.0,220,320,"coast"],
["c_blueridge","Blueridge","d_lyr_azure","c_count_blueridge",6,1.8,150,210,"hills"],
["c_varmark_gate","Varmark Gate","d_var_high","c_edran",9,3.0,210,280,"hills"],
["c_steelplain","Steelplain","d_var_high","c_count_steelplain",10,4.1,240,360,"plains"],
["c_coldrun","Coldrun","d_var_high","c_count_coldrun",7,2.0,155,230,"mountains"],
["c_ironheart","Ironheart","d_var_iron","c_vela",13,5.1,290,420,"hills"],
["c_redforge","Redforge","d_var_iron","c_count_redforge",11,4.3,260,380,"hills"],
["c_coalvale","Coalvale","d_var_iron","c_count_coalvale",9,3.0,200,310,"mountains"],
["c_westhold","Westhold","d_var_west","c_harkan",8,2.6,185,270,"forest"],
["c_stonepass","Stonepass","d_var_west","c_count_stonepass",7,2.2,220,300,"mountains"],
["c_bracken","Bracken","d_var_west","c_count_bracken",6,1.9,150,205,"forest"],
["c_serevan_gate","Serevan Gate","d_ser_river","c_oren",10,3.3,220,300,"plains"],
["c_riverfall","Riverfall","d_ser_river","c_count_riverfall",12,4.8,260,390,"plains"],
["c_greenbank","Greenbank","d_ser_river","c_count_greenbank",9,3.0,180,270,"forest"],
["c_sunspire","Sunspire","d_ser_sun","c_varro",11,4.5,255,350,"hills"],
["c_dawnfield","Dawnfield","d_ser_sun","c_count_dawnfield",10,3.7,225,315,"plains"],
["c_holywood","Holywood","d_ser_sun","c_count_holywood",8,2.6,175,250,"forest"],
["c_deltaport","Deltaport","d_ser_delta","c_mirek",13,5.6,310,430,"coast"],
["c_reedmarsh","Reedmarsh","d_ser_delta","c_count_reedmarsh",10,3.6,205,295,"marsh"],
["c_moonbay","Moonbay","d_ser_delta","c_count_moonbay",8,3.1,190,280,"coast"]
];
const WORLD20_KINGS=[
["c_caelen","King Caelen","House Caelen",46,8,11,10,7,8,["Diligent","Diplomat"],"lyric","moon_faith"],
["c_edran","King Edran","House Edran",51,12,6,9,7,4,["Wrathful","Brave"],"varmark","iron_oath"],
["c_oren","King Oren","House Oren",41,7,12,12,8,10,["Patient","Diligent"],"serevan","river_way"]
];
const WORLD20_DUKES=[
["c_davor","Duke Davor","House Davor",42,11,7,7,6,4,["Brave","Ambitious"],"lyric","moon_faith"],
["c_lysa","Duchess Lysa","House Lysa",36,6,13,12,8,9,["Diligent","Calm"],"lyric","moon_faith"],
["c_torren","Duke Torren","House Torren",39,9,8,9,10,6,["Ambitious","Deceitful"],"lyric","moon_faith"],
["c_rurik","Duke Rurik","House Rurik",44,13,5,7,6,3,["Brave","Wrathful"],"varmark","iron_oath"],
["c_vela","Duchess Vela","House Vela",33,8,9,13,9,5,["Frugal","Ambitious"],"varmark","iron_oath"],
["c_harkan","Duke Harkan","House Harkan",48,10,7,8,5,6,["Content"],"varmark","iron_oath"],
["c_selene","Duchess Selene","House Selene",37,6,12,11,9,11,["Kind"],"serevan","river_way"],
["c_varro","Duke Varro","House Varro",45,9,8,8,10,7,["Zealous","Ambitious"],"serevan","river_way"],
["c_mirek","Duke Mirek","House Mirek",38,8,10,11,12,6,["Deceitful","Calm"],"serevan","river_way"]
];
const WORLD20_COUNTS=[
["c_count_silverpine","Count Halric","House Halric"],["c_count_frostmere","Countess Elska","House Elska"],
["c_count_amberrest","Count Joren","House Joren"],["c_count_greymarch","Countess Maelin","House Maelin"],
["c_count_saltwind","Count Soren","House Soren"],["c_count_blueridge","Countess Yara","House Yara"],
["c_count_steelplain","Count Borin","House Borin"],["c_count_coldrun","Countess Kessa","House Kessa"],
["c_count_redforge","Count Hadran","House Hadran"],["c_count_coalvale","Countess Mira","House Mira"],
["c_count_stonepass","Count Garet","House Garet"],["c_count_bracken","Countess Tessa","House Tessa"],
["c_count_riverfall","Count Ilyan","House Ilyan"],["c_count_greenbank","Countess Rina","House Rina"],
["c_count_dawnfield","Count Davin","House Davin"],["c_count_holywood","Countess Elen","House Elen"],
["c_count_reedmarsh","Count Jarek","House Jarek"],["c_count_moonbay","Countess Nalia","House Nalia"]
];
function rect20(x,y,w,h){return x+","+y+" "+(x+w)+","+y+" "+(x+w)+","+(y+h)+" "+x+","+(y+h)}
function link20(a,b){WORLD.adjacency[a]=WORLD.adjacency[a]||[];WORLD.adjacency[b]=WORLD.adjacency[b]||[];if(!WORLD.adjacency[a].includes(b))WORLD.adjacency[a].push(b);if(!WORLD.adjacency[b].includes(a))WORLD.adjacency[b].push(a)}
function seedChar20(x){
 return {id:x[0],name:x[1],age:x[3],sex:x[1].includes("Duchess")||x[1].includes("Countess")?"f":"m",dynasty:x[2],title:x[1],martial:x[4],diplomacy:x[5],stewardship:x[6],intrigue:x[7],learning:x[8],traits:x[9],opinion:5,alive:true,spouse:null,father:null,mother:null,children:[],health:92,fertility:.64,culture:x[10],faith:x[11]}
}
function addWorld20(){
 if(WORLD.kingdoms?.some(k=>k.id==="k_lyrion"))return;
 WORLD.kingdoms=WORLD.kingdoms||[];WORLD.duchies=WORLD.duchies||[];WORLD.counties=WORLD.counties||[];WORLD.titles=WORLD.titles||[];WORLD.characters=WORLD.characters||{};WORLD.cultures=WORLD.cultures||{};WORLD.faiths=WORLD.faiths||{};
 WORLD.cultures.lyric={name:"Lyric",group:"Western",heritage:"Valic",description:"A courtly culture of scholars, silver trade and royal ceremony."};
 WORLD.cultures.varmark={name:"Varmark",group:"Northern",heritage:"Dornic",description:"A militarized culture built around mines, fortresses and sworn service."};
 WORLD.cultures.serevan={name:"Serevan",group:"Southern",heritage:"Lothic",description:"A river-and-delta culture driven by irrigation, merchants and temples."};
 WORLD.faiths.moon_faith={name:"Moon Litany",group:"Mystic",piety:"Balanced",description:"A ritual faith centered on cycles, scholarship and night vigils."};
 WORLD.faiths.iron_oath={name:"Iron Oath",group:"Militant",piety:"Zealous",description:"A martial faith binding rulers to sworn duty and fortress defense."};
 WORLD.faiths.river_way={name:"River Way",group:"Riverine",piety:"Balanced",description:"A faith of renewal, water rites and sacred stewardship."};
 WORLD20_KINGS.forEach(seed=>{WORLD.characters[seed[0]]=seedChar20(seed)});
 WORLD20_DUKES.forEach(seed=>{WORLD.characters[seed[0]]=seedChar20(seed)});
 WORLD20_KINGS.forEach(k=>{WORLD.kingdoms.push({id:WORLD20_KINGDOMS.find(x=>x.holder===k[0]).id,name:WORLD20_KINGDOMS.find(x=>x.holder===k[0]).name,holder:k[0],capital:WORLD20_KINGDOMS.find(x=>x.holder===k[0]).capital,tier:"kingdom",culture:k[10],faith:k[11]});WORLD.titles.push({id:WORLD20_KINGDOMS.find(x=>x.holder===k[0]).id,name:WORLD20_KINGDOMS.find(x=>x.holder===k[0]).name,type:"kingdom",parent:null,holder:k[0],deJure:true})});
 WORLD20_DUCHIES.forEach(d=>{WORLD.duchies.push({id:d.id,name:d.name,deJure:d.name.replace("Duchy of ",""),capital:null,tier:"duchy",holder:d.holder,parent:d.k});WORLD.titles.push({id:d.id,name:d.name,type:"duchy",parent:d.k,holder:d.holder,deJure:true})});
 WORLD20_COUNTS.forEach((n,i)=>{const id=n[0],name=n[1],did=WORLD20_COUNTIES.find(x=>x[0]===id)[2],holder=n[0];WORLD.characters[holder]=seedChar20([holder,name,n[2],30+i%15,5+i%6,7+i%6,7+i%7,5+i%5,4+i%6,[["Content","Diligent","Calm","Ambitious","Frugal","Kind","Brave"][i%7]],WORLD20_KINGDOMS[Math.floor((WORLD20_COUNTIES.findIndex(x=>x[0]===id))/9)].culture,WORLD20_KINGDOMS[Math.floor((WORLD20_COUNTIES.findIndex(x=>x[0]===id))/9)].faith])});
 const baseX=930,blockW=145,colW=48,baseY=[18,190,362];
 WORLD20_COUNTIES.forEach((row,i)=>{const [id,name,did,holder,dev,tax,garrison,levy,terrain]=row,kidx=Math.floor(i/9),local=i%3,block=Math.floor((i%9)/3),x=baseX+block*blockW+local*colW,y=baseY[kidx],kid=WORLD20_KINGDOMS[kidx].id;const c={id,name,duchy:did,status:"neutral",dev,tax,garrison,levy,x:x+23,y:y+78,points:rect20(x,y,46,155),barony:name+" Hold",fort:block===0?3:2,terrain,culture:WORLD20_KINGDOMS[kidx].culture,faith:WORLD20_KINGDOMS[kidx].faith,control:70,siege:0,supply:Math.max(60,dev*28),prosperity:60+dev*1.5,population:dev*10+50,food:70+dev*2,migration:0,localPrice:1,workforce:dev*5};WORLD.counties.push(c);WORLD.titles.push({id,name:"County of "+name,type:"county",parent:did,holder,deJure:true});WORLD.titles.push({id:id+"_barony",name:c.barony,type:"barony",parent:id,holder,deJure:true});const d=WORLD.duchies.find(x=>x.id===did);if(d&&!d.capital)d.capital=id});
 WORLD20_COUNTIES.forEach(r=>{const c=WORLD.counties.find(x=>x.id===r[0]);if(c)c.holder=r[3]});
 for(let k=0;k<3;k++)for(let d=0;d<3;d++){const s=k*9+d*3;link20(WORLD20_COUNTIES[s][0],WORLD20_COUNTIES[s+1][0]);link20(WORLD20_COUNTIES[s+1][0],WORLD20_COUNTIES[s+2][0]);if(d<2)link20(WORLD20_COUNTIES[s+2][0],WORLD20_COUNTIES[s+3][0])}
 link20(WORLD20_COUNTIES[8][0],WORLD20_COUNTIES[9][0]);link20(WORLD20_COUNTIES[17][0],WORLD20_COUNTIES[18][0]);link20(WORLD20_COUNTIES[26][0],"c_blackharbor");link20(WORLD20_COUNTIES[0][0],"c_blackharbor");link20(WORLD20_COUNTIES[6][0],"c_seagard");
}
addWorld20();