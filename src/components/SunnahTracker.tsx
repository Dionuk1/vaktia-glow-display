import { useCallback, useEffect, useState } from "react";
import { Check, LogOut, Mail, Save, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AUTH_PENDING_KEY, useSession } from "./AuthSession";
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
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Belgrade" }).format(new Date());
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const send = async () => {
    if (!navigator.onLine) { setErr("Për t'u kyçur, lidheni pajisjen me internet."); return; }
    setBusy(true);
    setErr(null);
    try {
      // Set this before auth begins, including an instant callback in another tab.
      try { localStorage.setItem(AUTH_PENDING_KEY, "1"); } catch {}
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/?sunnah=1` },
      });
      if (error) throw error;
      setSent(true);
      toast.success("📩 Linku i verifikimit u dërgua me sukses! Ju lutemi kontrolloni email-in tuaj për t'u kyçur.");
    } catch {
      try { localStorage.removeItem(AUTH_PENDING_KEY); } catch {}
      setErr("Linku nuk u dërgua. Provoni përsëri pas pak.");
    } finally { setBusy(false); }
  };
  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Mail className="size-4 text-primary" /> Kyçu me Email</div>
      {!sent ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="emri@email.com" className="min-w-0 flex-1 rounded-md border border-primary/25 bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          <Button type="submit" disabled={busy}>{busy ? "Duke dërguar…" : "Dërgo linkun"}</Button>
        </form>
      ) : (
        <>
          <p role="status" className="text-sm text-primary">📩 Linku i verifikimit u dërgua me sukses! Ju lutemi kontrolloni email-in tuaj për t'u kyçur.</p>
          <Button variant="link" onClick={() => setSent(false)}>Ndrysho email-in</Button>
        </>
      )}
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

type Row = { display_name: string; total: number; is_me: boolean };
export function SunnahModal({ onClose }: { onClose: () => void }) {
  const { session, ready } = useSession();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [board, setBoard] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const uid = session?.user.id;
  const load = useCallback(async () => {
    if (!uid) return;
    const [logs, lb] = await Promise.all([
      supabase.from("sunnah_logs").select("prayer").eq("user_id", uid).eq("log_date", today()),
      supabase.rpc("get_sunnah_leaderboard", { _limit: 20 }),
    ]);
    if (logs.error || lb.error) { setErr("Rezultatet nuk u ngarkuan. Kontrolloni lidhjen me internet."); return; }
    setErr(null);
    setDone(new Set((logs.data ?? []).map((l) => l.prayer)));
    setBoard(lb.data ?? []);
  }, [uid]);
  useEffect(() => {
    if (!uid) { setDone(new Set()); setBoard([]); return; }
    void load();
    void supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle().then(({ data, error }) => {
      if (error) { setErr("Emri nuk u ngarkua."); return; }
      setName(data?.display_name ?? ""); setSavedName(data?.display_name ?? "");
    });
    const id = window.setInterval(() => { if (navigator.onLine) void load(); }, 30_000);
    const ch = supabase.channel(`sunnah-${uid}`).on("postgres_changes", { event: "*", schema: "public", table: "sunnah_logs", filter: `user_id=eq.${uid}` }, () => void load()).subscribe();
    window.addEventListener("online", load);
    return () => { window.clearInterval(id); void supabase.removeChannel(ch); window.removeEventListener("online", load); };
  }, [uid, load]);
  const toggle = async (key: string) => {
    if (!uid || busy) return;
    if (!navigator.onLine) { setErr("Për të ruajtur synetet dhe renditjen duhet internet."); return; }
    setBusy(true);
    try {
      const result = done.has(key)
        ? await supabase.from("sunnah_logs").delete().eq("user_id", uid).eq("log_date", today()).eq("prayer", key)
        : await supabase.from("sunnah_logs").insert({ user_id: uid, prayer: key, log_date: today() });
      if (result.error) throw result.error;
      await load();
    } catch { setErr("Syneti nuk u ruajt. Provoni përsëri."); }
    finally { setBusy(false); }
  };
  const saveName = async () => {
    if (!uid || !name.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({ id: uid, display_name: name.trim() });
      if (error) throw error;
      setSavedName(name.trim()); toast.success("Emri u ruajt."); await load();
    } catch { setErr("Emri nuk u ruajt. Kontrolloni lidhjen me internet."); }
    finally { setBusy(false); }
  };
  return (
    <Modal title="Gjurmuesi i Syneteve" onClose={onClose}>
      {!ready ? <p role="status" className="text-sm text-muted-foreground">Duke ngarkuar…</p> : !session ? <EmailLogin /> : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">I kyçur: {session.user.email}</span>
            <Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}><LogOut /> Dil</Button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void saveName(); }} className="space-y-2">
            <label htmlFor="leaderboard-name" className="text-sm font-semibold text-foreground">Emri në renditje</label>
            <div className="flex gap-2">
              <input id="leaderboard-name" required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-md border border-primary/25 bg-surface px-3 py-2 text-sm text-foreground" />
              <Button type="submit" disabled={busy || !name.trim() || name.trim() === savedName}><Save /> Ruaj</Button>
            </div>
          </form>
          {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
          <div>
            <div className="mb-2 flex items-baseline justify-between"><h4 className="text-sm font-bold text-foreground">Synetet e sotme</h4><span className="text-xs font-bold tabular-nums text-primary">{done.size}/{SUNNAHS.length}</span></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUNNAHS.map((s) => {
                const on = done.has(s.key);
                return <Button key={s.key} variant="outline" disabled={busy} aria-pressed={on} onClick={() => void toggle(s.key)} className={`h-auto min-h-12 justify-start whitespace-normal p-3 text-left ${on ? "border-primary bg-primary/10 text-foreground" : "border-primary/15 bg-background text-muted-foreground"}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{on && <Check />}</span>{s.label}</Button>;
              })}
            </div>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground"><Trophy className="size-4 text-accent" /> Renditja e Komunitetit</h4>
            {board.length === 0 ? <p className="text-xs text-muted-foreground">Ende nuk ka rezultate. Bëhu i pari!</p> : <ol className="space-y-1.5">{board.map((r, i) => <li key={i} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${r.is_me ? "border-accent/40 bg-accent/5" : "border-primary/10 bg-background"}`}><span className="w-6 text-center font-bold tabular-nums text-primary">{i + 1}</span><span className="min-w-0 flex-1 truncate text-foreground">{r.display_name} {r.is_me && <span className="text-xs text-accent">(ti)</span>}</span><span className="font-bold tabular-nums text-foreground">{r.total}</span></li>)}</ol>}
          </div>
        </div>
      )}
    </Modal>
  );
}
