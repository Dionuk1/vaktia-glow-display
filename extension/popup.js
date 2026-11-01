import { KEYS, LABELS, CITIES, FRIDAY, timesFor, nextPrayer } from "./times.js";
const $=id=>document.getElementById(id);
let { city="Prishtina", notify=false } = await chrome.storage.local.get(["city","notify"]);
for(const [k,[l]] of Object.entries(CITIES)) $("city").add(new Option(l,k,false,k===city));
$("notify").checked=notify;
$("city").onchange=e=>{city=e.target.value;chrome.storage.local.set({city});render();};
$("notify").onchange=e=>chrome.storage.local.set({notify:e.target.checked});
$("fri").textContent=`Xhumaja: Hytbeja ${FRIDAY.khutbah} · Namazi ${FRIDAY.prayer}`;
function render(){
  const now=new Date(),t=timesFor(now,city),n=nextPrayer(now,city);
  $("date").textContent=now.toLocaleDateString("sq-AL",{weekday:"long",day:"numeric",month:"long"});
  $("list").innerHTML=KEYS.map(k=>`<li class="${n.key===k?"on":""}"><span>${LABELS[k]}</span><b>${t[k]}</b></li>`).join("");
  const s=Math.max(0,Math.floor((n.at-now)/1000));
  $("nextLabel").textContent=`Deri te ${LABELS[n.key]}`;
  $("cd").textContent=[s/3600,(s%3600)/60,s%60].map(x=>String(Math.floor(x)).padStart(2,"0")).join(":");
  $("fri").style.display=now.getDay()===5?"block":"none";
}
render();setInterval(render,1000);
