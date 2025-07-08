# 🚗 Car Rental System - MERN Stack

A full-stack car rental application built with MongoDB, Express.js, React.js, and Node.js. This system allows users to browse, search, and book rental cars, while providing administrators with a dashboard to manage cars, bookings, and users.

![Car Rental System](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT authentication
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Secure HTTP-only cookie support
- Profile management

### 🚙 Car Management
- Browse available cars with advanced filtering
- Search by location, dates, car type, price range
- Detailed car information with images
- Real-time availability checking
- Admin car inventory management

### 📅 Booking System
- Date-based car availability
- Real-time booking creation and management
- Booking status tracking (pending, confirmed, active, completed, cancelled)
- Payment status management
- Booking history and details

### 👨‍💼 Admin Dashboard
- Comprehensive admin panel
- Car fleet management (CRUD operations)
- Booking oversight and status updates
- User management
- Revenue and booking statistics
- Analytics dashboard

### 🎨 Modern UI/UX
- Responsive design for all devices
- Modern, clean interface
- Loading states and error handling
- Toast notifications
- Dark/light mode support
- Accessibility features

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie handling

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React DatePicker** - Date selection
- **React Toastify** - Notifications
- **Lucide React** - Icon library
- **CSS3** - Styling with custom design system

## 📁 Project Structure

```
car-rental-system/
├── backend/                 # Express.js backend
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── carController.js
│   │   └── bookingController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   ├── Car.js
│   │   └── Booking.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   └── bookingRoutes.js
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Entry point
├── client/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── LoadingSpinner.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Cars.js
│   │   │   ├── CarDetails.js
│   │   │   ├── Bookings.js
│   │   │   ├── Profile.js
│   │   │   └── Admin.js
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Component styles
│   │   └── index.css      # Global styles
│   ├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/car-rental-system.git
   cd car-rental-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/car-rental-db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

6. **Start the development servers**
   
   Backend (from backend directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from client directory):
   ```bash
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  drivingLicense: String,
  role: String (user/admin),
  isActive: Boolean,
  timestamps: true
}
```

### Car Model
```javascript
{
  make: String,
  model: String,
  year: Number,
  type: String,
  transmission: String,
  fuel: String,
  seats: Number,
  color: String,
  licensePlate: String (unique),
  pricePerDay: Number,
  location: String,
  features: [String],
  images: [String],
  isAvailable: Boolean,
  isActive: Boolean,
  mileage: Number,
  description: String,
  timestamps: true
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: User),
  car: ObjectId (ref: Car),
  pickupDate: Date,
  returnDate: Date,
  pickupLocation: String,
  returnLocation: String,
  totalDays: Number,
  pricePerDay: Number,
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  paymentMethod: String,
  notes: String,
  timestamps: true
}
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Cars
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)
- `POST /api/cars/:id/check-availability` - Check availability
- `PATCH /api/cars/:id/availability` - Toggle availability (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/status` - Update status (Admin)
- `GET /api/bookings/stats` - Get statistics (Admin)

## 🎨 Design System

The application uses a custom CSS design system with:

- **Colors**: Primary blue theme with semantic color palette
- **Typography**: System fonts with consistent sizing scale
- **Spacing**: 8-point grid system
- **Components**: Reusable button, form, and card components
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 compliant

## 🔒 Security Features

- **Authentication**: JWT tokens with HTTP-only cookies
- **Authorization**: Role-based access control
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error handling and logging
- **CORS**: Configured cross-origin resource sharing
- **Security Headers**: XSS protection, content type options

## 🌐 Deployment

### Backend Deployment (Render)

1. **Prepare for deployment**
   ```bash
   # Add start script to package.json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. **Deploy to Render**
   - Connect your GitHub repository
   - Set environment variables in Render dashboard
   - Deploy with automatic builds

3. **Environment Variables**
   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

### Frontend Deployment (Netlify)

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Upload build folder or connect GitHub
   - Configure redirects for SPA routing
   - Set environment variables

3. **Netlify Configuration**
   Create `_redirects` file in public folder:
   ```
   /*    /index.html   200
   ```

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access and database user
3. Get connection string and update environment variables

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- Unit tests for controllers and models
- Integration tests for API endpoints
- Frontend component testing with React Testing Library

## 📈 Performance Optimization

- **Database**: MongoDB indexing for optimal queries
- **Caching**: Response caching for frequently accessed data
- **Images**: Optimized image loading and lazy loading
- **Bundling**: React build optimization and code splitting
- **CDN**: Static asset delivery via CDN

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Demo Credentials

For testing purposes, you can use these demo accounts:

**Admin Account:**
- Email: admin@carrental.com
- Password: password123

**User Account:**
- Email: user@carrental.com
- Password: password123

## 🐛 Known Issues

- Image upload functionality needs cloud storage integration
- Payment integration is mocked (needs Stripe/PayPal integration)
- Email notifications need email service integration

## 📋 TODO

- [ ] Add payment gateway integration
- [ ] Implement email notifications
- [ ] Add image upload with cloud storage
- [ ] Implement real-time notifications
- [ ] Add advanced search filters
- [ ] Implement booking reminders
- [ ] Add customer reviews and ratings
- [ ] Implement GPS tracking for cars

## 📞 Support

For support and questions, please open an issue on GitHub or contact:
- Email: support@carrental.com
- Documentation: [Project Wiki](https://github.com/yourusername/car-rental-system/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React.js team for the amazing library
- MongoDB team for the database solution
- Express.js community for the web framework
- All contributors and testers

---

**Built with ❤️ using the MERN Stack**