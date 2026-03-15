// utils/pricingEngine.js
module.exports.calculateDynamicPrice = ({
  basePrice,
  cityDemand = 1,
  occupancyRate = 0,
  isWeekend = false,
  isSeasonalPeak = false,
}) => {
  let price = basePrice;

  if (isWeekend) price *= 1.15;
  if (isSeasonalPeak) price *= 1.25;

  price *= 1 + occupancyRate * 0.5;
  price *= cityDemand;

  return Math.round(price);
};
