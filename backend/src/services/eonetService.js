import axios from "axios";

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

export const fetchEONETEvents = async () => {
  const res = await axios.get(EONET_URL, {
    params: {
      status: "open",
      limit: 50,
    },
  });

  return res.data.events;
};
