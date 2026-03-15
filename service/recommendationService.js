const recommendRooms = (rooms) => {

  return rooms
    .map(room => {

      const rating = room.listing.rating || 4;

      const priceScore = 1 / room.basePrice;

      const score =
        rating * 0.5 +
        priceScore * 0.3 +
        (room.guests || 1) * 0.2;

      return {
        room,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.room);
};

module.exports = { recommendRooms };