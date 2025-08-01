import { bookingModel } from "../models/bookingModel";


export const scanTicketQR = async (req, res) => {
    try {
        const { qrCode } = req.query; // Assuming QR code is passed as a query parameter
        if (!qrCode) {
            return res.status(400).json({ message: "QR code is required" });
        }

        // Logic to scan the QR code and retrieve booking details
        const booking = await bookingModel.findOne({ qrCode });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        await bookingModel.updateOne({ _id: booking._id }, { isUsed: true });

        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// export const delete

export const getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await bookingModel.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getShowtimes = async (req, res) => {
    try {
        const showtimes = await showtimeModel.find();
        res.status(200).json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const showtime = await showtimeModel.findById(id);
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        res.status(200).json(showtime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}