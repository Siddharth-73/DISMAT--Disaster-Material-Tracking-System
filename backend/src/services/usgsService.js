import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const USGS_URL =
  "https://earthquake.usgs.gov/fdsnws/event/1/query";

export const fetchUSGSEarthquakes = async () => {
  const res = await axios.get(USGS_URL, {
    params: {
      format: "geojson",
      starttime: "NOW-1day",
      minlatitude: 6,
      maxlatitude: 37,
      minlongitude: 68,
      maxlongitude: 98,
      minmagnitude: 3
    }
  });

  return res.data.features;
};
