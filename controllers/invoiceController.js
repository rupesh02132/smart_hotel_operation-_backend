const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { generateInvoicePDF } = require("../utils/invoiceGenerator");

const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const user = await User.findById(booking.user);
    const listing = await Listing.findById(booking.listing);

    const doc = generateInvoicePDF(booking, user, listing);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${booking._id}.pdf`
    );

    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { downloadInvoice };

