import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  getTimesForLocation,
  getCityLabel,
  REGION_CITIES,
  type AnyCityKey,
  type RegionKey,
} from "../../prayer-data";

export default defineTool({
  name: "get_prayer_times",
  title: "Get prayer times",
  description: "Return the daily prayer times (Imsaku to Jacia) for a Kosovo (BIK) or Albania (KMSH) city on a date.",
  inputSchema: {
    region: z.enum(["Kosove", "Shqiperi"]).describe("Kosove (BIK) or Shqiperi (KMSH)."),
    city: z.string().min(1).describe("City key from list_cities, e.g. Prishtina or Shengjin."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date YYYY-MM-DD; defaults to today."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ region, city, date }) => {
    if (!REGION_CITIES[region as RegionKey].includes(city)) {
      throw new ToolError(`Unknown city "${city}" for ${region}. Use list_cities.`);
    }
    const d = date ? new Date(`${date}T12:00:00`) : new Date();
    if (isNaN(d.getTime())) throw new ToolError("Invalid date.");
    const t = getTimesForLocation(d, region as RegionKey, city as AnyCityKey);
    const times = { ...t };
    const label = getCityLabel(region as RegionKey, city as AnyCityKey);
    const day = d.toISOString().slice(0, 10);
    return {
      content: [{ type: "text", text: `${label} ${day}: ${Object.entries(times).map(([k, v]) => `${k} ${v}`).join(", ")}` }],
      structuredContent: { region, city, cityLabel: label, date: day, times },
    };
  },
});
