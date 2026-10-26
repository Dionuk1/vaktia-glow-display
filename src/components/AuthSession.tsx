import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openModule } from "@/lib/modules";

export const AUTH_PENDING_KEY = "vaktiaks_magic_link_pending";
const AuthContext = createContext<{ session: Session | null; ready: boolean }>({ session: null, ready: false });
export const useSession = () => useContext(AuthContext);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let announced = false;
    const url = new URL(window.location.href);
    const returned = url.searchParams.get("sunnah") === "1";
    const update = (next: Session | null) => {
      if (!active) return;
      setSession(next);
      setReady(true);
      let pending = returned;
      try { pending ||= localStorage.getItem(AUTH_PENDING_KEY) === "1"; } catch {}
      if (!next || !pending || announced) return;
      announced = true;
      try { localStorage.removeItem(AUTH_PENDING_KEY); } catch {}
      url.searchParams.delete("sunnah");
      // Do not leave callback credentials in the address bar.
      if (returned) window.history.replaceState(null, "", url.pathname + url.search);
      toast.success("🟢 U kyçët me sukses!");
      window.setTimeout(() => openModule("kaza"), 0);
    };
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      update(next);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void router.options.context.queryClient.invalidateQueries();
    });
    void supabase.auth.getSession().then(({ data }) => update(data.session));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [router]);
  return <AuthContext.Provider value={{ session, ready }}>{children}</AuthContext.Provider>;
}