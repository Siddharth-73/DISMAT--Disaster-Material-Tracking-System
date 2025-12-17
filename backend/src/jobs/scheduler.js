import cron from "node-cron";
import { syncEONET } from "./syncEONET.js";
import { syncUSGS } from "./syncUSGS.js";
import { expireDisasterZones } from "./expireDisasterZones.js";

export const startSchedulers = () => {
  cron.schedule("0 */6 * * *", async () => {
    await syncEONET();
    await syncUSGS();
  });
  cron.schedule("0 * * * *", async () => {
    await expireDisasterZones();
  });
};
