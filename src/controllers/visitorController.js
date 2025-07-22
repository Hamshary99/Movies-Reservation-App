// import { showtimeModel } from "../models/showtimeModel.js";

// export const getShowtimes = async (req, res) => {
//     try {
//         const showtimes = await showtimeModel.find();
//         res.status(200).json(showtimes);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const getShowtime = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const showtime = await showtimeModel.findById(id);
//         if (!showtime) {
//             return res.status(404).json({ message: "Showtime not found" });
//         }
//         res.status(200).json(showtime);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const getMovie = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const movie = await showtimeModel.findById(id).populate('movie');
//         console.log(movie);
//         if (!movie) {
//             return res.status(404).json({ message: "Movie not found" });
//         }
//         res.status(200).json(movie);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };