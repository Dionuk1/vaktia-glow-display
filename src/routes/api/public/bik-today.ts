import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300",
  "Content-Type": "application/json",
};

function to24h(s: string): string {
  // "3:24 am" / "12:35 pm" -> "03:24" / "12:35"
  const m = s.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3];
  if (ap === "am") {
    if (h === 12) h = 0;
  } else if (ap === "pm") {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${min}`;
}

const KEY_MAP: Record<string, string> = {
  Sabahu: "sabahu",
  "L. e Diellit": "lindja",
  "Lindja e Diellit": "lindja",
  Dreka: "dreka",
  Ikindia: "ikindia",
  Akshami: "akshami",
  Jacia: "jacia",
};

function parse(html: string) {
  const out: Record<string, string> = {};
  // Match every row: <th class="prayerName ...">NAME</th><td class="begins ...">TIME</td>
  const re =
    /<th[^>]*class="prayerName[^"]*"[^>]*>([^<]+)<\/th>\s*<td[^>]*class="begins[^"]*"[^>]*>([^<]+)<\/td>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const name = m[1].trim();
    const time = to24h(m[2]);
    const key = KEY_MAP[name];
    if (key && time) out[key] = time;
  }
  // Date from header (e.g. "25/05/2026")
  const d = html.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const date = d ? `${d[3]}-${d[2]}-${d[1]}` : null;
  return { date, times: out };
}

export const Route = createFileRoute("/api/public/bik-today")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        try {
          const res = await fetch("https://bislame.net/namazet/", {
            headers: { "User-Agent": "Mozilla/5.0 (Vaktia)" },
          });
          if (!res.ok) {
            return new Response(
              JSON.stringify({ error: `HTTP ${res.status}` }),
              { status: 502, headers: CORS }
            );
          }
          const html = await res.text();
          const parsed = parse(html);
          const required = ["sabahu", "lindja", "dreka", "ikindia", "akshami", "jacia"];
          const missing = required.filter((k) => !parsed.times[k]);
          if (missing.length) {
            return new Response(
              JSON.stringify({ error: "parse_failed", missing }),
              { status: 502, headers: CORS }
            );
          }
          return new Response(
            JSON.stringify({
              source: "https://bislame.net/namazet/",
              fetchedAt: new Date().toISOString(),
              date: parsed.date,
              times: parsed.times,
            }),
            { status: 200, headers: CORS }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "fetch_failed" }),
            { status: 500, headers: CORS }
          );
        }
      },
    },
  },
});
