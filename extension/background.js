import { LABELS, NOTIFY_KEYS, nextPrayer } from "./times.js";
async function schedule(){
  await chrome.alarms.clearAll();
  const { city="Prishtina", notify=false } = await chrome.storage.local.get(["city","notify"]);
  if(!notify) return;
  let now=new Date(),n;
  // Schedule the next notifiable prayer (skip Imsaku and sunrise).
  do{ n=nextPrayer(now,city); now=new Date(n.at.getTime()+1000);}while(!NOTIFY_KEYS.includes(n.key));
  chrome.alarms.create(`prayer:${n.key}`,{when:n.at.getTime()});
}
chrome.alarms.onAlarm.addListener(a=>{
  if(!a.name.startsWith("prayer:")) return;
  const k=a.name.slice(7);
  chrome.notifications.create({type:"basic",iconUrl:"icon-192.png",title:`Koha e ${LABELS[k]}`,message:"Ka hyrë koha e namazit — VaktiaKS"});
  schedule();
});
chrome.runtime.onInstalled.addListener(schedule);
chrome.runtime.onStartup.addListener(schedule);
chrome.storage.onChanged.addListener(schedule);
