# Movies Reservation App

A full-stack web application for reserving movie tickets, managing showtimes, and handling user authentication. The app supports different user roles (admin, user, receptionist) and provides a modern, responsive interface for booking seats, viewing showtimes, and managing bookings.

## Features

- User authentication (signup, login, JWT-based)
- Movie and showtime management (admin)
- Hall and seat management
- Seat selection and booking (user)
- Booking details and history
- Online payment integration (Stripe)
- File upload for movie posters
- Error handling and validation

## Technologies Used

### Frontend

- React 18
- React Router v6
- Material-UI (MUI)
- Axios
- Vite (for development/build)

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT for authentication
- Multer (file uploads)
- Stripe (online payments)
- dotenv (environment variables)
- CORS

### Dev Tools

- ESLint & Prettier
- Nodemon

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file (see `.env.example` if available)
4. Start the backend: `npm run server`
5. Start the frontend: `npm run client`

## Folder Structure

- `src/` - Source code (controllers, models, routes, views, services, utils)
- `public/` - Static files and uploads
- `package.json` - Project configuration

## API Documentation

Below is a list of all available API routes for the Movie Reservation App.

### Login and auth Routes
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **POST** | `/register` | Register a new user | `{ "name": "string", "email": "string", "password": "string", "confirmPassword": "string", "phone": "string", "role": "string" }` | `{ "message": "Signup successful", "user" }` |
| **POST** | `/auth/login` | Login and get JWT token | `{ "email": "string", "password": "string" }` | `{ "token": "jwt-token", "user": { ... } }` |
| **GET**  | `/movies` | Get all movies | — | `[ { "title": "Movie 1", "genre": "Action" }, ... ]` |
| **GET**  | `/movies/:id` | Get movie by ID | — | `{ "title": "Movie 1", "genre": "Action" }` |
| **POST** | `/reservations` | Create a reservation | `{ "movieId": "string", "seats": ["A1", "A2"] }` | `{ "message": "Reservation confirmed" }` |
| **GET**  | `/reservations/:id` | Get reservation by ID | — | `{ "id": "string", "movie": { ... }, "seats": [...] }` |

---

For more details, see the code and comments in each folder.
