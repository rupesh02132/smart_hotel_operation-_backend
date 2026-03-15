const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

const generateInvoiceAndEmail = async (booking) => {
  const invoiceDir = path.join(__dirname, "../invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = path.join(
    invoiceDir,
    `invoice-${booking._id}.pdf`
  );

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Booking ID: ${booking._id}`);
  doc.text(`Guest: ${booking.user.firstname} ${booking.user.lastname}`);
  doc.text(`Email: ${booking.user.email}`);
  doc.text(`Listing: ${booking.listing.title}`);
  doc.text(`Total Paid: ₹${booking.totalPrice}`);
  doc.text(`Payment ID: ${booking.paymentDetails.paymentId}`);
  doc.text(`Date: ${new Date().toDateString()}`);

  doc.end();

  // Save invoice path
  booking.invoicePath = filePath;
  await booking.save();

  // Email invoice
  await sendEmail({
    to: booking.user.email,
    subject: "Your Booking Invoice",
    text: "Thank you for your booking. Invoice attached.",
    attachments: [{ path: filePath }],
  });
};

module.exports = { generateInvoiceAndEmail };
