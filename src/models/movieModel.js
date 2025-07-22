import mongoose, { Schema } from 'mongoose';

const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  ratings: [
    {
      site: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
    },
  ],
  description: {
    type: String,
    required: false,
  },
  director: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return (
          !v ||
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)
        );
      },
      message: "Please enter a valid URL",
    },
  },
  posterFile: {
    type: String,
    required: false,
  },
});

export const movieModel = mongoose.model('Movie', movieSchema);

