const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

const generateInvoicePDF = (booking) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.fontSize(20).text("SMART HOTEL INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Invoice ID: ${booking._id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Guest: ${booking.user.firstname} ${booking.user.lastname}`);
  doc.text(`Email: ${booking.user.email}`);
  doc.text(`Phone: ${booking.user.phone || "-"}`);
  doc.moveDown();

  doc.text(`Room: ${booking.listing.title}`);
  doc.text(`Location: ${booking.listing.city}, ${booking.listing.country}`);
  doc.moveDown();

  doc.text(`Check-in: ${new Date(booking.checkIn).toDateString()}`);
  doc.text(`Check-out: ${new Date(booking.checkOut).toDateString()}`);
  doc.text(`Guests: ${booking.guests}`);
  doc.moveDown();

  doc.text(`Total Price: ₹${booking.totalPrice}`);
  doc.text(`Payment Method: ${booking.paymentMethod}`);
  doc.text(`Payment Status: Paid`);
  doc.moveDown();

  const gst = Math.round(booking.totalPrice * 0.12);
  doc.text(`GST (12%): ₹${gst}`);
  doc.fontSize(14).text(`Grand Total: ₹${booking.totalPrice + gst}`);
  doc.moveDown();

  doc.fontSize(10).text("Thank you for choosing Smart Hotel");

  doc.end();
  return doc;
};

const generateInvoiceAndEmail = async (booking) => {
  const invoiceDir = path.join(__dirname, "../invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = path.join(invoiceDir, `invoice-${booking._id}.pdf`);
  const pdf = generateInvoicePDF(booking);

  pdf.pipe(fs.createWriteStream(filePath));

  await sendEmail({
    to: booking.user.email,
    subject: "Your Smart Hotel Invoice",
    text: "Thank you for your stay. Invoice attached.",
    attachments: [{ path: filePath }],
  });
};

module.exports = { generateInvoicePDF, generateInvoiceAndEmail };
