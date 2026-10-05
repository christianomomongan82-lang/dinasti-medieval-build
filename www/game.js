const C=[
["Northwatch","Duke Edric","yours",7,2.4,180,165,92,"90,45 220,54 248,135 198,188 86,154","Northwatch Keep","Northern Marches","Arvend"],
["Ironford","Count Bren","yours",5,1.8,120,300,125,"220,54 350,34 404,117 350,190 248,135","Ironford Hold","Northern Marches","Arvend"],
["Pinefall","Countess Elira","yours",6,1.6,140,110,205,"86,154 198,188 222,280 135,321 48,248","Pinefall Hall","Northern Marches","Arvend"],
["Sunmere","Duke Roderic","rival",8,3.1,260,465,110,"350,34 510,48 583,114 505,174 404,117","Sunmere Castle","Eastern Reach","Arvend"],
["Redvale","Count Merek","rival",4,1.4,110,395,250,"350,190 404,117 505,174 525,276 445,322","Redvale Keep","Eastern Reach","Arvend"],
["Highmoor","Lady Sera","neutral",3,1,80,244,285,"222,280 350,190 445,322 365,392 235,352","Highmoor Fort","Eastern Reach","Arvend"],
["Gold Coast","Prince Alden","neutral",9,4.2,310,585,245,"505,174 583,114 696,153 709,283 615,322 525,276","Goldport","Gold Coast","Arvend"],
["Eastmere","Baron Hadrik","neutral",2,.8,60,575,370,"615,322 709,283 720,430 545,430","Eastmere Manor","Gold Coast","Arvend"]
];

const s={
  i:0,y:1066,m:8,g:42,p:18,pi:12,l:860,a:32,paused:false,speed:1,
  duchies:{Northern_Marches:"yours",Eastern_Reach:"mixed",Gold_Coast:"independent"},
  kingdomHolder:"King Aldric",dynasty:"House Vael",
  events:[
    "Border scouts report increased levies in Sunmere.",
    "A travelling jurist offers to settle an inheritance dispute.",
    "Lady Alina has begun her studies in rhetoric."
  ]
};

const $=x=>document.getElementById(x);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cur=()=>C[s.i];

function toast(x){
  const t=$("toast");t.textContent=x;t.classList.add("show");clearTimeout(toast.t);
  toast.t=setTimeout(()=>t.classList.remove("show"),1600);
}
function log(x){s.events.unshift(x);s.events=s.events.slice(0,8);renderEvents()}
function renderEvents(){$("events").innerHTML=s.events.map(x=>"<div class='event'><i></i><p>"+esc(x)+"</p></div>").join("")}

function renderMap(){
  $("mapRegions").innerHTML=C.map((c,i)=>"<polygon class='region "+c[2]+(i===s.i?" selected":"")+"' data-i='"+i+"' points='"+c[8]+"'></polygon>").join("");
  $("mapLabels").innerHTML=C.map(c=>"<text class='map-label' x='"+c[6]+"' y='"+c[7]+"'>"+esc(c[0])+"</text>").join("");
  document.querySelectorAll(".region").forEach(e=>e.onclick=()=>{s.i=+e.dataset.i;render()});
}

function renderTitles(){
  const c=cur();
  $("baronyTitle").textContent=c[9];
  $("countyTitle").textContent=c[0];
  $("duchyTitle").textContent=c[10];
  $("kingdomTitle").textContent="Kingdom of "+c[11];
  const owned=C.filter(x=>x[2]==="yours").length;
  $("realmTier").textContent=owned>=6?"KINGDOM":owned>=3?"DUCHY":"COUNTY";
}

function renderCounty(){
  const c=cur(),own=c[2]==="yours",rival=c[2]==="rival";
  $("countyName").textContent=c[0];$("countyHolder").textContent=c[1];
  $("countyDev").textContent=c[3];$("countyTax").textContent=c[4].toFixed(1)+"/mo";
  $("countyGarrison").textContent=c[5];
  $("countyStatus").textContent=own?"YOUR COUNTY":rival?"RIVAL REALM":"INDEPENDENT";
  const a=own?[
    ["Collect Taxes","+ "+c[4].toFixed(1)+" gold","tax"],
    ["Develop Holding","-15 gold · +1 dev","dev"],
    ["Raise Levies","+120 troops · -8 gold","levy"],
    ["Create Duchy","200 prestige · 2 counties","duchy"]
  ]:rival?[
    ["Declare War","Claim border","war"],
    ["Sway Rival","Improve opinion","sway"],
    ["Arrange Marriage","Seek alliance","marry"],
    ["Study Realm","Reveal strength","study"]
  ]:[
    ["Fabricate Claim","-60 prestige","claim"],
    ["Sway Local Lord","+12 opinion","sway"],
    ["Arrange Marriage","Create family tie","marry"],
    ["Send Gift","-10 gold","gift"]
  ];
  $("countyActions").innerHTML=a.map(x=>"<button class='action-btn' data-a='"+x[2]+"'><b>"+esc(x[0])+"</b><span>"+esc(x[1])+"</span></button>").join("");
  document.querySelectorAll(".action-btn").forEach(e=>e.onclick=()=>act(e.dataset.a));
}

function stats(){
  $("year").textContent=s.y;$("gold").textContent=Math.floor(s.g);
  $("prestige").textContent=Math.floor(s.p);$("piety").textContent=Math.floor(s.pi);
  $("levies").textContent=Math.floor(s.l);$("age").textContent=s.a.toFixed(1)+" years";
}
function character(){
  $("heir").textContent="Lady Alina, age 9";
  $("spouse").textContent="Duchess Mara";
  $("dynasty").textContent=s.dynasty;
}

function act(a){
  const c=cur(),own=c[2]==="yours";
  if(a==="tax"&&own){s.g+=c[4];log("Taxes collected from "+c[0]+": +"+c[4].toFixed(1)+" gold.");toast("Gold +"+c[4].toFixed(1))}
  else if(a==="dev"&&own){if(s.g<15)return toast("Not enough gold");s.g-=15;c[3]++;c[4]+=.45;log(c[0]+" developed to level "+c[3]+".");toast("Holding developed")}
  else if(a==="levy"&&own){if(s.g<8)return toast("Not enough gold");s.g-=8;s.l+=120;c[5]+=40;log("Levy raised in "+c[0]+": +120 troops.");toast("Levies +120")}
  else if(a==="duchy"&&own){
    const n=C.filter(x=>x[2]==="yours").length;
    if(s.p<200)return toast("Need 200 prestige");
    if(n<2)return toast("Control 2 counties first");
    s.p-=200; s.duchies[c[10].replace(/ /g,"_")]="yours";
    log("House Vael formally created the Duchy of "+c[10]+".");
    toast("Duchy created");
  }
  else if(a==="claim"){if(s.p<60)return toast("Need 60 prestige");s.p-=60;log("A claim was fabricated on "+c[0]+".");toast("Claim created")}
  else if(a==="sway"){s.p=Math.max(0,s.p-2);log("Diplomats began swaying "+c[1]+".");toast("Swaying court")}
  else if(a==="marry"){s.p+=12;s.pi+=3;log("Marriage proposal sent to "+c[1]+".");toast("Proposal sent")}
  else if(a==="gift"){if(s.g<10)return toast("Not enough gold");s.g-=10;s.p+=4;log("Gift sent to "+c[1]+".");toast("Gift delivered")}
  else if(a==="study"){log("Scouts estimate "+c[1]+" can field "+c[5]+" troops here.");toast("Intel recorded")}
  else if(a==="war"){
    if(!rivalTarget())return toast("Select a rival county");
    if(s.l<700)return toast("Army too small");
    s.l-=220;s.g=Math.max(0,s.g-12);
    if(Math.random()>.38){
      c[2]="yours";c[1]="Duke Edric";s.p+=35;s.g+=20;
      log("Victory! "+c[0]+" joins your realm.");toast("War won")
    }else{
      s.l=Math.max(0,s.l-180);s.p=Math.max(0,s.p-25);
      log("Defeat in "+c[0]+".");toast("War lost")
    }
  }
  render();
}
function rivalTarget(){return cur()[2]==="rival"}

function randomEvent(){
  const r=Math.floor(Math.random()*4);
  if(r===0){s.g+=10;log("A merchant charter brought +10 gold.")}
  else if(r===1){s.p+=15;log("A feast impressed nearby nobles. +15 prestige.")}
  else if(r===2){s.pi+=12;log("The court repaired a shrine. +12 piety.")}
  else{s.l=Math.max(0,s.l-90);log("Harsh winter reduced levies by 90.")}
}
function advance(){
  if(s.paused)return;
  s.m++;
  if(s.m>12){
    s.m=1;s.y++;s.a+=1/12;
    s.g+=C.filter(c=>c[2]==="yours").reduce((n,c)=>n+c[4],0);
    s.p++;s.pi+=.5;if(Math.random()<.16)randomEvent();
  }
  stats();
}
function render(){renderMap();renderTitles();renderCounty();stats();character();renderEvents()}

function selectCounty(i){s.i=+i;render()}
document.querySelectorAll(".speed button").forEach(b=>b.onclick=()=>{
  s.speed=+b.dataset.speed;s.paused=s.speed===0;
  document.querySelectorAll(".speed button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  $("pauseBtn").textContent=s.paused?"▶":"Ⅱ";
});
$("pauseBtn").onclick=()=>{s.paused=!s.paused;$("pauseBtn").textContent=s.paused?"▶":"Ⅱ"};
$("newGameBtn").onclick=()=>location.reload();
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  const t=b.dataset.tab;
  if(t==="war")toast("War council: choose a rival county.");
  else if(t==="dynasty")toast("Dynasty: succession and genealogy are next.");
  else if(t==="court")toast("Court: vassals and council are next.");
});
render();
setInterval(()=>{let n=[0,0,1,2][s.speed];while(n--)advance()},2500);
