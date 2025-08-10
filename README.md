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

## 🔐 Authentication Routes

| Method | Endpoint                  | Description                                                   | Access       | Auth Required |
|--------|---------------------------|---------------------------------------------------------------|--------------|--------------|
| **POST**   | `/api/auth/login`          | Logs in a user and returns a JWT token                        | All roles    | No           |
| **POST**   | `/api/auth/register`       | Registers a new user (default role: `user`)                   | All roles    | No           |
| **POST**   | `/api/auth/forgotPassword` | Sends a password reset link to the user’s email               | All roles    | No           |
| **PATCH**  | `/api/auth/resetPassword/:token` | Resets the password using a valid reset token          | All roles    | No           |
| **PATCH**  | `/api/auth/changePassword` | Changes the logged-in user’s password without reset flow      | user, admin, receptionist | Yes          |

---

## 🛠 Admin Routes
> All these routes require **authentication** and **admin role**.

#### Movie Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **GET** | `/admin/movie/:id` | Get a single movie by ID | ✅ |
| **GET** | `/admin/movies` | Get all movies | ✅ |
| **POST** | `/admin/movie` | Create a new movie | ✅ |
| **PUT** | `/admin/movie/:id` | Update an existing movie | ✅ |
| **DELETE** | `/admin/movie/:id` | Delete a specific movie | ✅ |
| **DELETE** | `/admin/movies` | Delete all movies | ✅ |

#### Hall Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/admin/hall` | Create a new hall | ✅ |
| **GET** | `/admin/halls` | Get all halls | ✅ |
| **GET** | `/admin/hall/:id` | Get a single hall (includes seats) | ✅ |
| **PUT** | `/admin/hall/:id` | Update an existing hall | ✅ |
| **DELETE** | `/admin/hall/:id` | Delete a specific hall | ✅ |
| **DELETE** | `/admin/halls` | Delete all halls | ✅ |

#### Showtime Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/admin/showtime` | Create a new showtime | ✅ |
| **GET** | `/admin/showtimes` | Get all showtimes | ✅ |
| **GET** | `/admin/showtime/:id` | Get a single showtime | ✅ |
| **PUT** | `/admin/showtime/:id` | Update an existing showtime | ✅ |
| **DELETE** | `/admin/showtime/:id` | Delete a specific showtime | ✅ |
| **DELETE** | `/admin/showtimes` | Delete all showtimes | ✅ |

---

## 📌 User Routes
> Not all of them require auth

###  Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET**    | `/profile/:id` | User/Admin | Get a user's profile |
| **PUT**    | `/profile/:id` | User | Update the logged-in user's profile |
| **DELETE** | `/profile/:id` | User | Delete the logged-in user's profile |


### Movies & Showtimes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET**    | `/movies` | Public | Get all movies |
| **GET**    | `/movies/:id` | Public | Get details of a movie |
| **GET**    | `/movies/:movieId/showtimes/:date` | Public | Get showtimes of a movie for a given date |
| **GET**    | `/showtime/:id` | Public | Get details of a specific showtime |
| **GET**    | `/showtime` | Public | Get all showtimes of a movie (via query params) |
| **GET**    | `/showtime/:id/seats` | Public | Get available seats for a showtime |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/booking` | User | Create a booking |
| **GET** | `/booking/:id` | User | Get details of a booking |
| **GET** | `/booking` | User | Get all bookings of the logged-in user |
| **PUT** | `/booking/:id` | User | Update a booking |
| **DELETE** | `/booking/:id` | User | Delete a booking |

---

## 🎟️ Receptionist Routes

### Ticket Scanning & Booking Verification
| Method | Endpoint                  | Auth Role     | Description |
|--------|---------------------------|---------------|-------------|
| **GET**   | `/scanTicketQR`            | Receptionist  | Scans a ticket QR code and marks it as used |
| **GET**   | `/bookingDetails/:id`      | Receptionist  | Retrieves booking details by booking ID |

### Showtimes
| Method | Endpoint                  | Auth Role     | Description |
|--------|---------------------------|---------------|-------------|
| **GET**    | `/showtimes`               | Receptionist  | Retrieves all showtimes |
| **GET**    | `/showtime/:id`            | Receptionist  | Retrieves details of a specific showtime |


## Project URL
https://roadmap.sh/projects/movie-reservation-system
---

For more details, see the code and comments in each folder.
