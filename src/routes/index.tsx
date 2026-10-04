import { createFileRoute } from "@tanstack/react-router";
import PrayerDashboard from "@/components/PrayerDashboard";

export const Route = createFileRoute("/")({
  component: PrayerDashboard,
  head: () => ({
    meta: [
      { title: "VaktiaKS — Kohët e Faljes për Kosovë dhe Shqipëri" },
      { name: "description", content: "Oraret zyrtare të namazit për Kosovë dhe Shqipëri, busulla e Kibles, tespihu dhe kalendari islam." },
      { property: "og:title", content: "VaktiaKS — Kohët e Faljes" },
      { property: "og:description", content: "Oraret zyrtare të namazit për Kosovë dhe Shqipëri, busulla e Kibles dhe tespihu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
