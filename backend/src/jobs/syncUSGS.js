import { fetchUSGSEarthquakes } from "../services/usgsService.js";
import { normalizeUSGSQuake } from "../services/usgsNormalizer.js";

export const syncUSGS = async () => {
  console.log("🌎 Syncing USGS earthquakes...");

  const quakes = await fetchUSGSEarthquakes();

  for (const quake of quakes) {
    console.log("USGS quake:", quake.id, quake.properties.mag);

    await normalizeUSGSQuake(quake);
  }

  console.log(`✅ USGS sync complete (${quakes.length} earthquakes)`);
};
