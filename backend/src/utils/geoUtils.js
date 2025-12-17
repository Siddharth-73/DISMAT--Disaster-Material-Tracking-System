export const isInsideIndia = (lat, lng) => {
  return (
    lat >= 6 &&
    lat <= 37 &&
    lng >= 68 &&
    lng <= 98
  );
};
