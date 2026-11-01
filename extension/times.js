import BIK from "./bik-times.js";
export const KEYS = ["imsaku","sabahu","lindja","dreka","ikindia","akshami","jacia"];
export const LABELS = { imsaku:"Imsaku", sabahu:"Sabahu", lindja:"Lindja e Diellit", dreka:"Dreka", ikindia:"Ikindia", akshami:"Akshami", jacia:"Jacia" };
export const NOTIFY_KEYS = ["sabahu","dreka","ikindia","akshami","jacia"];
export const FRIDAY = { khutbah: "11:40", prayer: "12:00" };
export const CITIES = { Decan:["Deçan",0], Gjakova:["Gjakovë",0], Peja:["Pejë",0], Prizreni:["Prizren",0], Mitrovica:["Mitrovicë",0], Sharri:["Sharr",2], Ferizaj:["Ferizaj",-1], Gjilan:["Gjilan",-1], Prishtina:["Prishtinë",-1], FusheKosova:["Fushë Kosovë",-1], Podujeva:["Podujevë",-1], Vushtrri:["Vushtrri",-1], Presheva:["Preshevë",-2] };
function summer(d){const y=d.getFullYear(),s=31-new Date(y,2,31).getDay(),e=31-new Date(y,9,31).getDay(),m=d.getMonth();return (m>2&&m<9)||(m===2&&d.getDate()>=s)||(m===9&&d.getDate()<e);}
const toMin=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const fmt=n=>`${String(Math.floor(n/60+24)%24).padStart(2,"0")}:${String(((n%60)+60)%60).padStart(2,"0")}`;
export function timesFor(date, city="Prishtina"){
  const key=`${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const row=BIK[key]||BIK["02-28"];
  // BIK rows (2026) already contain civil DST; only correct for year differences.
  const season=(Number(summer(date))-Number(summer(new Date(2026,date.getMonth(),date.getDate()))))*60;
  const off=(CITIES[city]?.[1]??0)+season; const out={};
  for(const k of KEYS) out[k]=fmt(toMin(row[k])+off);
  return out;
}
export function atTime(date,hhmm){const[h,m]=hhmm.split(":").map(Number);const d=new Date(date);d.setHours(h,m,0,0);return d;}
export function nextPrayer(now,city){
  for(const off of [0,1]){const d=new Date(now);d.setDate(d.getDate()+off);const t=timesFor(d,city);
    for(const k of KEYS){const at=atTime(d,t[k]);if(at>now)return{key:k,at};}}
}
