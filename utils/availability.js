// utils/availability.js
const isDateBlocked = (listing, date) => {
  if (listing.blackoutDates?.some(d =>
    new Date(d).toDateString() === new Date(date).toDateString()
  )) return true;

  if (listing.maintenanceBlocks?.some(m =>
    new Date(m.start) <= new Date(date) &&
    new Date(m.end) >= new Date(date)
  )) return true;

  return false;
};

module.exports = { isDateBlocked };
