import { createFileRoute } from "@tanstack/react-router";
import PrayerDashboard from "@/components/PrayerDashboard";

export const Route = createFileRoute("/")({
  component: PrayerDashboard,
  head: () => ({
    meta: [
      { title: "Vaktia — Kohët e Faljes | Prishtinë" },
      { name: "description", content: "Vaktia digjitale me kohët e faljes për Prishtinë, Kosovë. Modaliteti TV / Kiosk." },
    ],
  }),
});
