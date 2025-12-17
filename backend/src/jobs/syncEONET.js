import { fetchEONETEvents } from "../services/eonetService.js";
import { normalizeEONETEvent } from "../services/eonetNormalizer.js";

export const syncEONET = async () => {
  console.log("🌍 Syncing EONET events...");

  const events = await fetchEONETEvents();

  for (const event of events) {
    console.log("EONET event:", event.id, event.title);

    await normalizeEONETEvent(event);
  }

  console.log(`✅ EONET sync complete (${events.length} events)`);
};
