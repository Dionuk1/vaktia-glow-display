import { KEYS, LABELS, CITIES, AL_CITIES, FRIDAY, DEFAULTS, cityLabel, timesFor, nextPrayer, currentPrayer, atTime } from "./times.js";
const $=id=>document.getElementById(id);

// Settings: chrome.storage.local (shared with background) mirrored to localStorage.
const LS="vaktiaks_ext_settings";
let local={}; try{ local=JSON.parse(localStorage.getItem(LS)||"{}"); }catch{}
const stored=(await chrome.storage.local.get("settings")).settings;
let s={...DEFAULTS,...local,...(stored||{})};
function save(patch){
  s={...s,...patch};
  localStorage.setItem(LS,JSON.stringify(s));
  chrome.storage.local.set({settings:s});
  $("saved").classList.add("show"); clearTimeout(save.t); save.t=setTimeout(()=>$("saved").classList.remove("show"),1200);
  applyUI(); render();
}

for(const [k,[l]] of Object.entries(CITIES)) $("city").add(new Option(l,k));
for(const [k,l] of Object.entries(AL_CITIES)) $("alCity").add(new Option(k==="Shengjin"?`${l} (Këshilli i Lezhës)`:k==="Velipoje"?`${l} (Këshilli i Shkodrës)`:l,k));
for(let m=-15;m<=15;m++) $("offset").add(new Option(m===0?"0 min":`${m>0?"+":""}${m} min`,m));
$("offset").onchange=e=>save({offset:Number(e.target.value)});
$("preAlert").onchange=e=>save({preAlert:Number(e.target.value)});
$("city").onchange=e=>save({city:e.target.value});
$("alCity").onchange=e=>save({alCity:e.target.value});
document.querySelectorAll("[data-region]").forEach(b=>b.onclick=()=>save({region:b.dataset.region}));
for(const id of ["notify","sound","beep","compact"]) $(id).onchange=e=>save({[id]:e.target.checked});
$("openSettings").onclick=()=>$("ov").classList.add("open");
$("closeSettings").onclick=()=>$("ov").classList.remove("open");
$("ov").onclick=e=>{ if(e.target.id==="ov") $("ov").classList.remove("open"); };

function applyUI(){
  $("city").value=s.city; $("alCity").value=s.alCity; $("offset").value=String(s.offset||0); $("preAlert").value=String(s.preAlert||0);
  for(const id of ["notify","sound","beep","compact"]) $(id).checked=!!s[id];
  document.querySelectorAll("[data-region]").forEach(b=>b.classList.toggle("on",b.dataset.region===s.region));
  $("ksField").style.display=s.region==="ks"?"block":"none";
  $("alField").style.display=s.region==="al"?"block":"none";
  document.body.classList.toggle("compact",!!s.compact);
  $("loc").textContent=`📍 ${cityLabel(s)}, ${s.region==="al"?"Shqipëri · KMSH":"Kosovë · BIK"}`;
}

function render(){
  const now=new Date(),t=timesFor(now,s),n=nextPrayer(now,s),cur=currentPrayer(now,s);
  $("date").textContent=now.toLocaleDateString("sq-AL",{weekday:"long",day:"numeric",month:"long"});
  const sec=Math.max(0,Math.floor((n.at-now)/1000));
  if(s.beep&&render.prev&&render.prev!==cur) beep(); render.prev=cur;
  $("list").innerHTML=KEYS.map(k=>{
    const cls=k===cur?"on":k===n.key?"next-up":"";
    const tag=k===cur?"<small>● Tani</small>":k===n.key?`<small>Në vijim · ${hms(sec)}</small>`:"";
    return `<li class="${cls}"><span>${LABELS[k]}${tag}</span><b>${t[k]}</b></li>`;
  }).join("");
  // Friday: Hytbeja/Xhumaja always visible; glow during the Friday window (Kosovo fixed times).
  const fri=now.getDay()===5&&s.region==="ks";
  const inJum=fri&&now>=atTime(now,FRIDAY.khutbah)&&now<atTime(now,"12:30");
  $("fri").innerHTML=s.region==="ks"
    ?`<div class="${inJum?"on":""}"><span>Hytbeja</span><b>${FRIDAY.khutbah}</b></div><div class="${inJum?"on":""}"><span>Xhumaja</span><b>${FRIDAY.prayer}</b></div>`
    :"";
  $("nextLabel").textContent=`Deri te ${LABELS[n.key]}`;
  $("cd").textContent=hms(sec);
}
applyUI(); render(); setInterval(render,1000);
function hms(sec){return [sec/3600,(sec%3600)/60,sec%60].map(x=>String(Math.floor(x)).padStart(2,"0")).join(":");}
function beep(){try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.15;o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.4);}catch{}}
