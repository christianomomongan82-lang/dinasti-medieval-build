// Dynasty Realms v0.50 - Fourth Grand World Expansion
const WORLD50_LAYOUT={k_elyndor:{x:30,y:1000},k_kaedor:{x:505,y:1000},k_rhovan:{x:30,y:1450},k_ostria:{x:505,y:1450}};
const WORLD50_SPEC=[
{kid:"k_elyndor",name:"Kingdom of Elyndor",king:"c_halric",kingName:"King Halric",dyn:"House Halric",culture:"elyndori",faith:"dawn_law",dukes:[
{id:"d_ely_north",name:"Duchy of Northvale",ruler:"c_garran",rulerName:"Duke Garran",dyn:"House Garran",counties:["Frostmere","Pinewatch","Highfield"]},
{id:"d_ely_crown",name:"Duchy of Crownfield",ruler:"c_lysa",rulerName:"Duchess Lysa",dyn:"House Lysa",counties:["Crownfield","Ravenby","Eastbrook"]},
{id:"d_ely_coast",name:"Duchy of White Coast",ruler:"c_arden",rulerName:"Duke Arden",dyn:"House Arden",counties:["Whiteport","Saltmere","Cliffhaven"]}]},
{kid:"k_kaedor",name:"Kingdom of Kaedor",king:"c_maelia",kingName:"Queen Maelia",dyn:"House Maelia",culture:"kaedori",faith:"iron_covenant",dukes:[
{id:"d_kae_high",name:"Duchy of Highroad",ruler:"c_joren",rulerName:"Duke Joren",dyn:"House Joren",counties:["Highroad","Stonegate","Redhill"]},
{id:"d_kae_iron",name:"Duchy of Iron Vale",ruler:"c_varek",rulerName:"Duke Varek",dyn:"House Varek",counties:["Ironvale","Blackridge","Forgemark"]},
{id:"d_kae_south",name:"Duchy of South March",ruler:"c_mirea",rulerName:"Duchess Mirea",dyn:"House Mirea",counties:["Southwatch","Greymoor","Kingsrest"]}]},
{kid:"k_rhovan",name:"Kingdom of Rhovan",king:"c_torren",kingName:"King Torren",dyn:"House Torren",culture:"rhovani",faith:"river_crown",dukes:[
{id:"d_rho_river",name:"Duchy of Riverlands",ruler:"c_davor",rulerName:"Duke Davor",dyn:"House Davor",counties:["Riverbend","Longmead","Mossford"]},
{id:"d_rho_hill",name:"Duchy of Red Hills",ruler:"c_serin",rulerName:"Duke Serin",dyn:"House Serin",counties:["Redhill Vale","Oakrest","Windscar"]},
{id:"d_rho_lake",name:"Duchy of Lake Crown",ruler:"c_vesa",rulerName:"Duchess Vesa",dyn:"House Vesa",counties:["Lakeshire","Bluewater","Sunmere East"]}]},
{kid:"k_ostria",name:"Kingdom of Ostria",king:"c_ysara",kingName:"Queen Ysara",dyn:"House Ysara",culture:"ostrian",faith:"star_oath",dukes:[
{id:"d_ost_sun",name:"Duchy of Sun Coast",ruler:"c_cyran",rulerName:"Duke Cyran",dyn:"House Cyran",counties:["Suncoast","Amber Bay","Goldenreach"]},
{id:"d_ost_mist",name:"Duchy of Mistwood",ruler:"c_elric",rulerName:"Duke Elric",dyn:"House Elric",counties:["Mistwood","Deepgrove","Silverpath"]},
{id:"d_ost_crown",name:"Duchy of Crown Sea",ruler:"c_nyra",rulerName:"Duchess Nyra",dyn:"House Nyra",counties:["Crownsea","Stormbay","Lastwatch"]}]}
];
function seedCharacter50(id,name,dyn,age,sex,culture,faith,stats,traits){return{id,name,age,sex,dynasty:dyn,title:name,martial:stats[0],diplomacy:stats[1],stewardship:stats[2],intrigue:stats[3],learning:stats[4],traits:traits||["Diligent"],opinion:10,alive:true,spouse:null,father:null,mother:null,children:[],health:92,fertility:.68,culture,faith}}
function addWorld50(){
 if((WORLD.kingdoms||[]).some(k=>k.id==="k_elyndor"))return;
 WORLD.kingdoms=WORLD.kingdoms||[];WORLD.duchies=WORLD.duchies||[];WORLD.counties=WORLD.counties||[];WORLD.titles=WORLD.titles||[];WORLD.characters=WORLD.characters||{};WORLD.cultures=WORLD.cultures||{};WORLD.faiths=WORLD.faiths||{};WORLD.adjacency=WORLD.adjacency||{};
 Object.assign(WORLD.cultures,{
  elyndori:{name:"Elyndori",group:"Western",heritage:"Valic",description:"An administrative court culture shaped by grain estates and fortified roads."},
  kaedori:{name:"Kaedori",group:"Northern",heritage:"Valic",description:"A hard frontier culture famous for ironworking and disciplined infantry."},
  rhovani:{name:"Rhovani",group:"River",heritage:"Lothic",description:"A riverine culture organized around toll roads, grain fleets and old crowns."},
  ostrian:{name:"Ostrian",group:"Coastal",heritage:"Marinic",description:"A maritime culture whose noble houses dominate ports, shipyards and sea trade."}
 });
 Object.assign(WORLD.faiths,{
  dawn_law:{name:"Dawn Law",group:"Lawbound",piety:"Balanced",description:"A reform faith centered on civic duty, courts and sacred oaths."},
  iron_covenant:{name:"Iron Covenant",group:"Warrior",piety:"Zealous",description:"An austere faith that glorifies endurance, military service and sworn loyalty."},
  river_crown:{name:"River Crown",group:"River",piety:"Balanced",description:"A river faith that treats kingship, harvests and safe passage as sacred duties."},
  star_oath:{name:"Star Oath",group:"Mystic",piety:"Scholastic",description:"A seafaring faith guided by navigation, astronomy and sacred vows."}
 });
 WORLD50_SPEC.forEach((k,ki)=>{
  const culture=k.culture,faith=k.faith;
  const ksex=ki%2===0?"m":"f";
  WORLD.characters[k.king]=seedCharacter50(k.king,k.kingName,k.dyn,46+(ki%3),ksex,culture,faith,[11+ki,12-(ki%2),10+ki,7+ki%2,7+ki],["Ambitious","Patient"]);WORLD.characters[k.king].title=k.name;
  k.dukes.forEach((d,di)=>{
   const sex=d.rulerName.indexOf("Duchess")>=0?"f":"m";
   WORLD.characters[d.ruler]=seedCharacter50(d.ruler,d.rulerName,d.dyn,34+di*4+ki,sex,culture,faith,[8+di+ki,9+((di+ki)%4),9+di,6+di,5+ki],["Diligent",di===1?"Ambitious":"Brave"]);WORLD.characters[d.ruler].title=d.name;
   for(let ci=0;ci<3;ci++){
    const id=d.id+"_c"+ci,cn=d.counties[ci];let holder=ci===0&&di===0?k.king:ci===0?d.ruler:id+"_lord";
    if(ci===2){const cid=id+"_lord";WORLD.characters[cid]=seedCharacter50(cid,"Count of "+cn,"House "+cn.replace(/\s/g,""),29+((ci+di+ki)%9),((ci+di+ki)%5===0)?"f":"m",culture,faith,[6+ci,7+di,7+ki,5+ci,5+di],[(ci+di)%2?"Kind":"Content"]);WORLD.characters[cid].title="Count of "+cn}
    const x=WORLD50_LAYOUT[k.kid].x+ci*145,y=WORLD50_LAYOUT[k.kid].y+di*125,terrain=di===2?"coast":ci===1?"forest":"plains";
    const county={id,name:cn,duchy:d.id,status:"neutral",dev:8+((ki+di+ci)%6),tax:2+((ki*2+di+ci)%7)*.45,garrison:150+((ki+ci)*35),levy:220+((di+ci)*30)+ki*16,x:x+69,y:y+56,points:rect20(x,y,138,112),barony:cn+" Keep",fort:2+((di+ki)%3),terrain,culture,faith,control:72,siege:0,supply:Math.max(60,100+((ki+ci)%4)*10),prosperity:62+(ci+di)*3,population:110+(ki+di+ci)*14,food:80+(ci+1)*4,localPrice:1,workforce:40+(ki+ci)*3};
    WORLD.counties.push(county);WORLD.titles.push({id,name:"County of "+cn,type:"county",parent:d.id,holder,deJure:true});WORLD.titles.push({id:id+"_barony",name:county.barony,type:"barony",parent:id,holder,deJure:true});if(!d.capital&&holder===d.ruler)d.capital=id;
   }
   if(!d.capital)d.capital=d.id+"_c1";
   WORLD.duchies.push({id:d.id,name:d.name,deJure:d.name.replace("Duchy of ",""),capital:d.capital,tier:"duchy",holder:d.ruler,parent:k.kid});WORLD.titles.push({id:d.id,name:d.name,type:"duchy",parent:k.kid,holder:d.ruler,deJure:true});
  });
  WORLD.kingdoms.push({id:k.kid,name:k.name,holder:k.king,capital:k.dukes[0].id+"_c0",tier:"kingdom",culture,faith});WORLD.titles.push({id:k.kid,name:k.name,type:"kingdom",parent:null,holder:k.king,deJure:true});
 });
 function link(a,b){WORLD.adjacency[a]=WORLD.adjacency[a]||[];WORLD.adjacency[b]=WORLD.adjacency[b]||[];if(!WORLD.adjacency[a].includes(b))WORLD.adjacency[a].push(b);if(!WORLD.adjacency[b].includes(a))WORLD.adjacency[b].push(a)}
 WORLD50_SPEC.forEach(k=>k.dukes.forEach((d,di)=>{const ids=d.counties.map((_,ci)=>d.id+"_c"+ci);link(ids[0],ids[1]);link(ids[1],ids[2]);if(di>0)link(ids[0],k.dukes[di-1].id+"_c2")}));
 [["d_ely_coast_c2","d_kae_high_c0"],["d_kae_south_c2","d_rho_river_c0"],["d_rho_lake_c2","d_ost_sun_c0"],["c_eastmere","d_ely_north_c0"],["c_blackharbor","d_kae_high_c0"],["c_nightbay","d_rho_river_c0"],["c_stormwatch","d_ost_sun_c0"]].forEach(x=>{if((WORLD.counties||[]).some(c=>c.id===x[0])&&(WORLD.counties||[]).some(c=>c.id===x[1]))link(x[0],x[1])});
}
addWorld50();