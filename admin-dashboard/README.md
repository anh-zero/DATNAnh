# Travel Booking API

## Overview
The Travel Booking API is a Node.js application designed to facilitate travel bookings, manage tours, and handle user and partner interactions. This API provides a robust backend for travel-related services, allowing users to book tours, manage their profiles, and interact with various partners.

## Features
- User registration and authentication
- Admin management for user roles
- Tour management including creation, updates, and retrieval
- Booking management for users
- Partner management for travel service providers

## Directory Structure
```
travel-booking-api
├── config
│   ├── db.js
│   └── config.js
├── controllers
│   ├── adminController.js
│   ├── userController.js
│   ├── customerController.js
│   ├── bookingController.js
│   ├── tourController.js
│   └── partnerController.js
├── middlewares
│   ├── auth.js
│   └── errorHandler.js
├── models
│   ├── adminModel.js
│   ├── userModel.js
│   ├── customerModel.js
│   ├── bookingModel.js
│   ├── tourModel.js
│   ├── partnerModel.js
│   └── tourPartnerModel.js
├── routes
│   ├── adminRoutes.js
│   ├── userRoutes.js
│   ├── customerRoutes.js
│   ├── bookingRoutes.js
│   ├── tourRoutes.js
│   └── partnerRoutes.js
├── services
│   ├── adminService.js
│   ├── userService.js
│   ├── customerService.js
│   ├── bookingService.js
│   ├── tourService.js
│   └── partnerService.js
├── utils
│   ├── validators.js
│   └── helpers.js
├── app.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd travel-booking-api
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your environment variables (e.g., database connection strings).

## Usage
To start the server, run:
```
npm start
```
The API will be available at `http://localhost:5000`.

## API Endpoints
- **Admin Routes**: `/api/admin`
- **User Routes**: `/api/users`
- **Customer Routes**: `/api/customers`
- **Booking Routes**: `/api/bookings`
- **Tour Routes**: `/api/tours`
- **Partner Routes**: `/api/partners`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.