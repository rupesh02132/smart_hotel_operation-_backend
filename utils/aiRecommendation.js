const aiRecommendation = ({ basePrice, finalPrice, factor }) => {
  if (factor >= 1.3) {
    return {
      decision: "BOOK_NOW",
      message: "High demand detected. Prices may rise further.",
      color: "red",
    };
  }

  if (factor <= 1.05) {
    return {
      decision: "WAIT",
      message: "Low demand. Prices may drop if you wait.",
      color: "green",
    };
  }

  return {
    decision: "NEUTRAL",
    message: "Stable pricing. Book if dates are important.",
    color: "yellow",
  };
};

module.exports = { aiRecommendation };
