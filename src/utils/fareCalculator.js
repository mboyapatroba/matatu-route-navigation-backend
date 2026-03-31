const calculateFare = ({ fare, time = new Date() }) => {
  let price = fare.baseFare;

  const hour = time.getHours();

  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19); //boolean

  if (isPeak) {
    price = fare.peakFare;
  }

  if (price > fare.maxFare) {
    price = fare.maxFare;
  }
  return {
    amount: price,
    currency: fare.currency,
    isPeak,
  };
};

module.exports = calculateFare;
