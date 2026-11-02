import { LABELS, NOTIFY_KEYS, DEFAULTS, cityLabel, nextPrayer } from "./times.js";
async function settings(){ const { settings } = await chrome.storage.local.get("settings"); return { ...DEFAULTS, ...(settings||{}) }; }
async function schedule(){
  await chrome.alarms.clearAll();
  const s = await settings();
  if(!s.notify) return;
  let now=new Date(),n;
  // Schedule the next notifiable prayer (skip Imsaku and sunrise).
  do{ n=nextPrayer(now,s); now=new Date(n.at.getTime()+1000);}while(!NOTIFY_KEYS.includes(n.key));
  chrome.alarms.create(`prayer:${n.key}`,{when:n.at.getTime()});
  const pre=n.at.getTime()-(Number(s.preAlert)||0)*60000;
  if(s.preAlert>0&&pre>Date.now()) chrome.alarms.create(`pre:${n.key}`,{when:pre});
}
chrome.alarms.onAlarm.addListener(async a=>{
  if(a.name.startsWith("pre:")){ const k=a.name.slice(4),s=await settings();
    chrome.notifications.create({type:"basic",iconUrl:"icon-192.png",title:`${LABELS[k]} pas ${s.preAlert} min`,message:`${cityLabel(s)} — VaktiaKS`,silent:!s.sound}); return; }
  if(!a.name.startsWith("prayer:")) return;
  const k=a.name.slice(7), s=await settings();
  chrome.notifications.create({type:"basic",iconUrl:"icon-192.png",title:`Koha e ${LABELS[k]}`,message:`Ka hyrë koha e namazit në ${cityLabel(s)} — VaktiaKS`,silent:!s.sound});
  schedule();
});
chrome.runtime.onInstalled.addListener(schedule);
chrome.runtime.onStartup.addListener(schedule);
chrome.storage.onChanged.addListener(schedule);
