import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, LogOut, Mail, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Modal } from "./FeatureModals";

const SUNNAHS = [
  { key: "sabah_para", label: "2 rekate para Sabahut" },
  { key: "dreka_para", label: "4 rekate para Drekës" },
  { key: "dreka_pas", label: "2 rekate pas Drekës" },
  { key: "ikindi_para", label: "4 rekate para Ikindisë" },
  { key: "aksham_pas", label: "2 rekate pas Akshamit" },
  { key: "jaci_para", label: "4 rekate para Jacisë" },
  { key: "jaci_pas", label: "2 rekate pas Jacisë" },
] as const;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  };

  const verify = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setErr("Kodi nuk është i saktë ose ka skaduar.");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#00D9A3]/20 bg-[#0B1E24] p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Mail className="size-4 text-[#00D9A3]" /> Kyçu me Email
      </div>
      <p className="text-xs text-[#9CA3AF]">
        Pa fjalëkalim — ju dërgojmë një kod ose link sigurie në email.
      </p>
      {!sent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emri@email.com"
            className="min-w-0 flex-1 rounded-xl border border-[#00D9A3]/25 bg-[#18282E] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00D9A3]"
          />
          <button disabled={busy} className="rounded-xl bg-[#00D9A3] px-4 py-2.5 text-sm font-bold text-[#0B1E24] disabled:opacity-60">
            {busy ? "Duke dërguar…" : "Dërgo kodin"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          className="space-y-2"
        >
          <p className="text-xs text-[#B6FF2E]">Kontrolloni email-in {email}. Shkruani kodin ose klikoni linkun.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Kodi nga email-i"
              className="min-w-0 flex-1 rounded-xl border border-[#00D9A3]/25 bg-[#18282E] px-3 py-2.5 text-center text-lg tracking-[0.4em] text-white outline-none focus:border-[#00D9A3]"
            />
            <button disabled={busy || code.length < 4} className="rounded-xl bg-[#00D9A3] px-4 py-2.5 text-sm font-bold text-[#0B1E24] disabled:opacity-60">
              Verifiko
            </button>
          </div>
          <button type="button" onClick={() => setSent(false)} className="text-xs text-[#9CA3AF] underline">
            Ndrysho email-in
          </button>
        </form>
      )}
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}

type Row = { display_name: string; total: number; is_me: boolean };

export function SunnahModal({ onClose }: { onClose: () => void }) {
  const { session, ready } = useSession();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [board, setBoard] = useState<Row[]>([]);
  const uid = session?.user.id;

  const load = useCallback(async () => {
    if (!uid) return;
    const [{ data: logs }, { data: lb }] = await Promise.all([
      supabase.from("sunnah_logs").select("prayer").eq("log_date", today()),
      supabase.rpc("get_sunnah_leaderboard", { _limit: 20 }),
    ]);
    setDone(new Set((logs ?? []).map((l) => l.prayer)));
    setBoard((lb ?? []) as Row[]);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    load();
    const id = window.setInterval(load, 30_000);
    const ch = supabase
      .channel("sunnah-logs")
      .on("postgres_changes", { event: "*", schema: "public", table: "sunnah_logs" }, () => load())
      .subscribe();
    return () => {
      window.clearInterval(id);
      supabase.removeChannel(ch);
    };
  }, [uid, load]);

  const toggle = async (key: string) => {
    const has = done.has(key);
    const next = new Set(done);
    if (has) next.delete(key);
    else next.add(key);
    setDone(next);
    if (has) await supabase.from("sunnah_logs").delete().eq("log_date", today()).eq("prayer", key);
    else await supabase.from("sunnah_logs").insert({ prayer: key, log_date: today() });
    load();
  };

  return (
    <Modal title="Gjurmuesi i Syneteve" onClose={onClose}>
      {!ready ? null : !session ? (
        <EmailLogin />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#9CA3AF]">
            <span className="truncate">I kyçur: {session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#00D9A3]/25 px-3 py-1 text-white hover:border-[#00D9A3]"
            >
              <LogOut className="size-3" /> Dil
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="text-sm font-bold text-white">Synetet e sotme</h4>
              <span className="text-xs font-bold tabular-nums text-[#00D9A3]">
                {done.size}/{SUNNAHS.length}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUNNAHS.map((s) => {
                const on = done.has(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggle(s.key)}
                    className={[
                      "flex items-center gap-3 rounded-2xl border p-3 text-left text-sm transition",
                      on ? "border-[#00D9A3] bg-[#00D9A3]/10 text-white" : "border-[#00D9A3]/15 bg-[#0B1E24] text-[#9CA3AF]",
                    ].join(" ")}
                  >
                    <span className={["grid size-6 shrink-0 place-items-center rounded-full border", on ? "border-[#00D9A3] bg-[#00D9A3] text-[#0B1E24]" : "border-[#9CA3AF]/40"].join(" ")}>
                      {on && <Check className="size-3.5" />}
                    </span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
              <Trophy className="size-4 text-[#F59E0B]" /> Renditja e Komunitetit
            </h4>
            {board.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">Ende nuk ka rezultate. Bëhu i pari!</p>
            ) : (
              <ol className="space-y-1.5">
                {board.map((r, i) => (
                  <li
                    key={i}
                    className={[
                      "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                      r.is_me ? "border-[#B6FF2E]/40 bg-[#B6FF2E]/5" : "border-[#00D9A3]/10 bg-[#0B1E24]",
                    ].join(" ")}
                  >
                    <span className="w-6 text-center font-bold tabular-nums text-[#00D9A3]">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-white">
                      {r.display_name} {r.is_me && <span className="text-[10px] text-[#B6FF2E]">(ti)</span>}
                    </span>
                    <span className="font-bold tabular-nums text-white">{r.total}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
