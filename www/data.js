const WORLD={
  kingdom:{id:"k_arvend",name:"Kingdom of Arvend",holder:"c_edric",capital:"Northwatch"},
  duchies:[
    {id:"d_north",name:"Duchy of the Northern Marches",deJure:"Northern Marches",capital:"Northwatch"},
    {id:"d_east",name:"Duchy of the Eastern Reach",deJure:"Eastern Reach",capital:"Sunmere"},
    {id:"d_gold",name:"Duchy of the Gold Coast",deJure:"Gold Coast",capital:"Goldport"}
  ],
  counties:[
    {id:"c_northwatch",name:"Northwatch",holder:"c_edric",duchy:"d_north",status:"yours",dev:9,tax:2.8,garrison:220,levy:310,x:160,y:92,points:"88,45 220,54 248,135 198,188 86,154",barony:"Northwatch Keep"},
    {id:"c_ironford",name:"Ironford",holder:"c_bren",duchy:"d_north",status:"yours",dev:7,tax:2.2,garrison:150,levy:220,x:300,y:125,points:"220,54 350,34 404,117 350,190 248,135",barony:"Ironford Hold"},
    {id:"c_pinefall",name:"Pinefall",holder:"c_elira",duchy:"d_north",status:"yours",dev:8,tax:2.0,garrison:170,levy:240,x:110,y:205,points:"86,154 198,188 222,280 135,321 48,248",barony:"Pinefall Hall"},
    {id:"c_sunmere",name:"Sunmere",holder:"c_roderic",duchy:"d_east",status:"rival",dev:10,tax:3.6,garrison:320,levy:430,x:465,y:110,points:"350,34 510,48 583,114 505,174 404,117",barony:"Sunmere Castle"},
    {id:"c_redvale",name:"Redvale",holder:"c_merek",duchy:"d_east",status:"rival",dev:6,tax:1.7,garrison:140,levy:190,x:395,y:250,points:"350,190 404,117 505,174 525,276 445,322",barony:"Redvale Keep"},
    {id:"c_highmoor",name:"Highmoor",holder:"c_sera",duchy:"d_east",status:"neutral",dev:5,tax:1.3,garrison:100,levy:140,x:244,y:285,points:"222,280 350,190 445,322 365,392 235,352",barony:"Highmoor Fort"},
    {id:"c_goldcoast",name:"Gold Coast",holder:"c_alden",duchy:"d_gold",status:"neutral",dev:11,tax:4.8,garrison:360,levy:500,x:585,y:245,points:"505,174 583,114 696,153 709,283 615,322 525,276",barony:"Goldport"},
    {id:"c_eastmere",name:"Eastmere",holder:"c_hadrik",duchy:"d_gold",status:"neutral",dev:4,tax:.9,garrison:70,levy:90,x:575,y:370,points:"615,322 709,283 720,430 545,430",barony:"Eastmere Manor"}
  ],
  characters:{
    c_edric:{id:"c_edric",name:"Duke Edric Vael",age:32,sex:"m",dynasty:"House Vael",title:"Duke of the Northern Marches",martial:8,diplomacy:13,stewardship:10,intrigue:6,learning:7,traits:["Patient","Diplomat","Frugal"],opinion:100,alive:true,spouse:"c_mara",father:null},
    c_mara:{id:"c_mara",name:"Duchess Mara",age:29,sex:"f",dynasty:"House Orwyn",title:"Duchess Consort",martial:4,diplomacy:11,stewardship:9,intrigue:10,learning:8,traits:["Calm","Ambitious"],opinion:82,alive:true,spouse:"c_edric",father:null},
    c_alina:{id:"c_alina",name:"Lady Alina Vael",age:9,sex:"f",dynasty:"House Vael",title:"Heir",martial:3,diplomacy:10,stewardship:6,intrigue:5,learning:8,traits:["Quick"],opinion:65,alive:true,spouse:null,father:"c_edric"},
    c_rowan:{id:"c_rowan",name:"Lord Rowan Vael",age:6,sex:"m",dynasty:"House Vael",title:"Prince",martial:5,diplomacy:6,stewardship:5,intrigue:4,learning:4,traits:["Brave"],opinion:55,alive:true,spouse:null,father:"c_edric"},
    c_bren:{id:"c_bren",name:"Count Bren",age:41,sex:"m",dynasty:"House Brenn",title:"Count of Ironford",martial:9,diplomacy:7,stewardship:8,intrigue:5,learning:4,traits:["Craven"],opinion:61,alive:true,spouse:null},
    c_elira:{id:"c_elira",name:"Countess Elira",age:37,sex:"f",dynasty:"House Elira",title:"Countess of Pinefall",martial:5,diplomacy:12,stewardship:11,intrigue:7,learning:7,traits:["Kind"],opinion:74,alive:true,spouse:null},
    c_roderic:{id:"c_roderic",name:"Duke Roderic",age:39,sex:"m",dynasty:"House Roderic",title:"Duke of the Eastern Reach",martial:12,diplomacy:8,stewardship:7,intrigue:8,learning:5,traits:["Wrathful","Ambitious"],opinion:-24,alive:true,spouse:null},
    c_merek:{id:"c_merek",name:"Count Merek",age:35,sex:"m",dynasty:"House Merek",title:"Count of Redvale",martial:10,diplomacy:5,stewardship:6,intrigue:9,learning:4,traits:["Deceitful"],opinion:-10,alive:true,spouse:null},
    c_sera:{id:"c_sera",name:"Lady Sera",age:28,sex:"f",dynasty:"House Sera",title:"Lady of Highmoor",martial:4,diplomacy:9,stewardship:8,intrigue:8,learning:10,traits:["Zealous"],opinion:18,alive:true,spouse:null},
    c_alden:{id:"c_alden",name:"Prince Alden",age:44,sex:"m",dynasty:"House Alden",title:"Prince of Gold Coast",martial:7,diplomacy:10,stewardship:13,intrigue:6,learning:6,traits:["Diligent"],opinion:25,alive:true,spouse:null},
    c_hadrik:{id:"c_hadrik",name:"Baron Hadrik",age:52,sex:"m",dynasty:"House Hadrik",title:"Baron of Eastmere",martial:6,diplomacy:6,stewardship:7,intrigue:3,learning:5,traits:["Content"],opinion:42,alive:true,spouse:null}
  }
};
