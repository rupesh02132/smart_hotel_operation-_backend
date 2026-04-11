  // utils/dynamicPricing.js
  const dynamicPrice = ({
    basePrice,
    occupancyRate,
    isWeekend,
    season = "normal",
    cityDemand = 1, // 👈 NEW
  }) => {
    let factor = 1;

    if (occupancyRate > 80) factor += 0.4;
    else if (occupancyRate > 60) factor += 0.25;
    else if (occupancyRate > 40) factor += 0.15;

    if (isWeekend) factor += 0.2;

    if (season === "peak") factor += 0.3;
    if (season === "low") factor -= 0.1;

    factor *= cityDemand; // 👈 AI demand multiplier

    const finalPrice = Math.round(basePrice * factor);

    return {
      basePrice,
      finalPrice,
      factor: factor.toFixed(2),
    };
  };

  module.exports = { dynamicPrice };
