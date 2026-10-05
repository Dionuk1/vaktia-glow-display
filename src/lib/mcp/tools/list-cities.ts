import { defineTool } from "@lovable.dev/mcp-js";
import { REGION_CITIES, getCityLabel, type AnyCityKey, type RegionKey } from "../../prayer-data";

export default defineTool({
  name: "list_cities",
  title: "List cities",
  description: "List the supported city keys for Kosovo and Albania, with Qibla bearings.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const regions = (["Kosove", "Shqiperi"] as RegionKey[]).map((r) => ({
      region: r,
      qiblaDegrees: r === "Kosove" ? 138 : 136,
      cities: REGION_CITIES[r].map((c) => ({ key: c, label: getCityLabel(r, c as AnyCityKey) })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(regions) }],
      structuredContent: { regions },
    };
  },
});
