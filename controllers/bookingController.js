const {
  createBookingService,
  getMyBookingsService,
  getHostBookingsService,
  findBookingByListingId,
  deleteBookingService,
  getAllBookingsService,
  findBookingByIdOrListing
} = require('../service/bookingService');


const createBooking = async (req, res) => {
  try {
    const createdBooking = await createBookingService({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json(createdBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const bookings = await getMyBookingsService(req.user._id);
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getHostBookings = async (req, res) => {
  try {
    const bookings = await getHostBookingsService(req.user._id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const  getMyBookinsgById = async (req, res) => {
  try {
    const { bookingId} = req.params; 


    const booking = await findBookingByListingId(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "No booking found for this listing" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getMyBookinsgBy_Id = async (req, res) => {
  try {
    const { booking_id } = req.params;
 
     const booking = await findBookingByIdOrListing(booking_id);
    res.json(booking);
  } catch (err) {
    console.error(" Booking fetch error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const deletedBooking = await deleteBookingService(bookingId);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBookingCotroller=async(req,res)=>{
  try{
    const bookings=await getAllBookingsService();
    res.json(bookings);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}


module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getMyBookinsgById,
  deleteBooking,
  getAllBookingCotroller,
  getMyBookinsgBy_Id
};
