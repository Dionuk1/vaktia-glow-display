import { defineMcp } from "@lovable.dev/mcp-js";
import getPrayerTimes from "./tools/get-prayer-times";
import listCities from "./tools/list-cities";

export default defineMcp({
  name: "vaktia-ks",
  title: "Vaktia KS",
  version: "0.1.0",
  instructions:
    "Prayer times for Kosovo (BIK) and Albania (KMSH). Call `list_cities` for valid city keys, then `get_prayer_times`.",
  tools: [listCities, getPrayerTimes],
});
