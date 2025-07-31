# 🏥 WELLCARE Backend

<div align="center">

![WELLCARE Logo](https://img.shields.io/badge/WELLCARE-Healthcare%20Platform-03C03C?style=for-the-badge)

**A comprehensive real-time doctor-patient consultation system backend built with Node.js, Express.js, MongoDB, and Socket.IO**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-wellcare.space-blue?style=for-the-badge)](https://www.wellcare.space)
[![GitHub Repo](https://img.shields.io/badge/📦%20Frontend%20Repo-WELLCARE__FRONTEND-green?style=for-the-badge)](https://github.com/ajaypalamkunnel/WELLCARE_FRONTEND)

</div>

---

## 📋 Project Overview

WELLCARE Backend is a robust, scalable healthcare platform API that enables seamless doctor-patient interactions through real-time communication. Built with modern web technologies, it provides secure video calls, live chat, appointment scheduling, and payment integration for online healthcare consultations.

The platform connects patients with trusted healthcare professionals across diverse medical specialties, offering 24/7 support and ensuring high-quality medical care through a comprehensive digital ecosystem.

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- JWT-based secure authentication
- Role-based access control (Admin, Doctor, Patient)
- Google OAuth integration
- Password reset and email verification
- Session management with cookies

### 👥 **User Management**
- Patient registration and profile management
- Doctor verification and profile setup
- Admin panel for user oversight
- Multi-role support system

### 📅 **Appointment System**
- Real-time appointment booking
- Schedule management for doctors
- Automatic slot cleanup for pending appointments
- Appointment status tracking (pending, confirmed, completed, cancelled)
- Notification system for appointment updates

### 💬 **Real-time Communication**
- Socket.IO powered live chat
- Message history and conversation management
- Real-time notifications
- User presence indicators

### 🎥 **Video Calling Integration**
- Agora Video SDK integration
- Token-based secure video sessions
- High-quality video/audio calls
- Screen sharing capabilities

### 💳 **Payment Processing**
- Razorpay payment gateway integration
- Wallet system for patients and doctors
- Transaction history and management
- Refund processing

### 🏥 **Healthcare Features**
- Digital prescription generation (PDF)
- Medical department categorization
- Doctor specialization filtering
- Patient medical history
- Review and rating system

### 📊 **Analytics & Reporting**
- Appointment analytics
- Revenue tracking
- Doctor performance metrics
- Patient engagement statistics

## 🛠️ Technologies Used

### **Core Technologies**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **TypeScript** - Type-safe JavaScript development

### **Real-time Communication**
- **Socket.IO** - Real-time bidirectional event-based communication
- **Agora SDK** - Video calling and real-time communication

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Secure authentication
- **bcryptjs** - Password hashing
- **Passport.js** - Authentication middleware
- **Cookie Parser** - Cookie handling

### **Payment & File Processing**
- **Razorpay** - Payment gateway integration
- **Cloudinary** - Media storage and management
- **PDFKit** - PDF generation for prescriptions
- **Nodemailer** - Email notifications

### **Development & Deployment**
- **Winston** - Logging system
- **Morgan** - HTTP request logger
- **node-cron** - Scheduled job management
- **ESLint** - Code linting
- **Docker** - Containerization

## 📁 Folder Structure

```
src/
├── 📁 __tests__/              # Test files and test utilities
├── 📁 config/                 # Configuration files
│   ├── dbConfig.ts            # MongoDB connection configuration
│   └── passport.ts            # Passport authentication strategies
├── 📁 constants/              # Application constants and enums
│   └── routePaths.ts          # API route path constants
├── 📁 controller/             # Request handlers and business logic
│   ├── implementation/        # Controller implementations
│   │   ├── admin/             # Admin-specific controllers
│   │   ├── user/              # User management controllers
│   │   ├── doctor/            # Doctor-specific controllers
│   │   ├── chat/              # Chat functionality controllers
│   │   └── consultationBooking/ # Appointment booking controllers
├── 📁 dto/                    # Data Transfer Objects
├── 📁 jobs/                   # Background jobs and cron tasks
│   ├── pendingSlotCleanup.ts  # Clean up expired appointment slots
│   └── subscriptionExpiryHandler.ts # Handle subscription expiry
├── 📁 middleware/             # Custom middleware functions
│   ├── authMiddleware.ts      # JWT authentication middleware
│   ├── checkUserBlocked.ts    # User blocking verification
│   ├── checkRole.ts           # Role-based access control
│   └── morganMiddleware.ts    # HTTP request logging
├── 📁 model/                  # Database models and schemas
│   ├── admin/                 # Admin-related models
│   ├── user/                  # User models
│   ├── doctor/                # Doctor models
│   ├── chat/                  # Chat message models
│   ├── consultationBooking/   # Appointment models
│   ├── department/            # Medical department models
│   ├── prescription/          # Prescription models
│   ├── notification/          # Notification models
│   └── userWallet/            # Wallet models
├── 📁 repositories/           # Data access layer
│   └── implementation/        # Repository implementations
├── 📁 routes/                 # API route definitions
│   ├── admin/                 # Admin routes
│   ├── user/                  # User routes
│   ├── doctor/                # Doctor routes
│   ├── chat/                  # Chat routes
│   └── agora/                 # Video calling routes
├── 📁 services/               # Business logic services
│   └── implementation/        # Service implementations
├── 📁 types/                  # TypeScript type definitions
├── 📁 utils/                  # Utility functions
│   └── chatSocket.ts          # Socket.IO chat implementation
└── index.ts                   # Application entry point
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

### 1. Clone the Repository
```bash
git clone https://github.com/ajaypalamkunnel/WELLCARE_BACKEND.git
cd WELLCARE_BACKEND
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wellcare
DB_NAME=wellcare

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRE_TIME=1h
JWT_REFRESH_EXPIRE_TIME=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Agora Configuration
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Session Configuration
SESSION_SECRET=your_session_secret
```

### 4. Database Setup
Ensure MongoDB is running on your system:
```bash
# For MongoDB Community Edition
mongod

# Or if using MongoDB service
sudo systemctl start mongod
```

### 5. Build the Application
```bash
npm run build
```

### 6. Start the Development Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🛣️ API Endpoints

### **Authentication Routes** (`/api/user`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/signup/basic_details` | User registration | Public |
| POST | `/signup/verify_otp` | OTP verification | Public |
| POST | `/signup/resend_otp` | Resend OTP | Public |
| POST | `/login` | User login | Public |
| POST | `/forgot-password` | Password reset request | Public |
| POST | `/update-password` | Update password | Public |
| POST | `/refresh-token` | Refresh JWT token | Public |
| POST | `/logout` | User logout | Private |
| GET | `/auth/google` | Google OAuth login | Public |
| GET | `/profile` | Get user profile | Private |

### **Doctor Routes** (`/api/doctor`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all doctors | Public |
| GET | `/:doctorId` | Get doctor profile | Public |
| GET | `/schedules` | Get doctor schedules | Private (Doctor) |
| PUT | `/profile` | Update doctor profile | Private (Doctor) |
| POST | `/schedule` | Create schedule | Private (Doctor) |

### **Appointment Routes** (`/api/user`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/consultation-booking/initiate` | Initiate appointment | Private (User) |
| POST | `/consultation-booking/verify` | Verify appointment payment | Private (User) |
| GET | `/consultation-booking/details` | Get booking details | Private (User) |
| GET | `/my-appointments` | Get user appointments | Private (User) |
| PATCH | `/appointments/:id/cancel` | Cancel appointment | Private (User) |

### **Chat Routes** (`/api/chat`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/inbox` | Get user conversations | Private |
| POST | `/message` | Send message | Private |
| GET | `/messages/:conversationId` | Get conversation messages | Private |

### **Admin Routes** (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Private (Admin) |
| GET | `/doctors` | Get all doctors | Private (Admin) |
| PUT | `/doctor/:id/approve` | Approve doctor | Private (Admin) |
| PUT | `/doctor/:id/reject` | Reject doctor | Private (Admin) |
| GET | `/appointments` | Get all appointments | Private (Admin) |

### **Agora Routes** (`/api/agora`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/token` | Generate Agora token | Private |
| POST | `/channel` | Create video channel | Private |

## 🏃‍♂️ How to Run the Project Locally

1. **Clone and Setup**:
   ```bash
   git clone https://github.com/ajaypalamkunnel/WELLCARE_BACKEND.git
   cd WELLCARE_BACKEND
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables
   - Ensure MongoDB is running

3. **Database Initialization**:
   ```bash
   # The application will automatically create collections
   # Optionally seed initial data
   npm run seed  # If seed script exists
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Verify Installation**:
   - Visit `http://localhost:5000` in your browser
   - You should see "Welcome to Wellcare"

6. **Test API Endpoints**:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/

   # Test with Postman or your preferred API client
   ```

## 🌐 Deployment Information

### **Live Application**
- **Production URL**: [https://www.wellcare.space](https://www.wellcare.space)
- **API Base URL**: `https://api.wellcare.space` (or deployed backend URL)

### **GitHub Repositories**
- **Backend Repository**: [WELLCARE_BACKEND](https://github.com/ajaypalamkunnel/WELLCARE_BACKEND)
- **Frontend Repository**: [WELLCARE_FRONTEND](https://github.com/ajaypalamkunnel/WELLCARE_FRONTEND)

### **Deployment Platforms**
The application can be deployed on various platforms:

#### **Recommended Platforms**:
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Database**: MongoDB Atlas (recommended for production)
- **Storage**: Cloudinary (for images and files)

#### **Docker Deployment**:
```bash
# Build Docker image
docker build -t wellcare-backend .

# Run container
docker run -p 5000:5000 --env-file .env wellcare-backend
```

#### **Environment Variables for Production**:
Ensure these are set in your deployment platform:
- All variables from `.env` file
- `NODE_ENV=production`
- Production database URLs
- Production frontend URL for CORS

## 🤝 Contributing Guidelines

We welcome contributions to WELLCARE Backend! Please follow these guidelines:

### **How to Contribute**

1. **Fork the Repository**
   ```bash
   git fork https://github.com/ajaypalamkunnel/WELLCARE_BACKEND.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow TypeScript and ESLint configurations
   - Write tests for new features
   - Update documentation if needed

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Ensure all tests pass

### **Development Guidelines**
- Follow the existing code style and structure
- Use meaningful commit messages
- Write unit tests for new functionality
- Update API documentation for new endpoints
- Ensure backward compatibility

### **Code Style**
- Use TypeScript for type safety
- Follow ESLint rules configured in the project
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🚀 Ready to Transform Healthcare?

**WELLCARE Backend** - Empowering healthcare through technology

[![Star this repo](https://img.shields.io/github/stars/ajaypalamkunnel/WELLCARE_BACKEND?style=social)](https://github.com/ajaypalamkunnel/WELLCARE_BACKEND)
[![Follow on GitHub](https://img.shields.io/github/followers/ajaypalamkunnel?style=social)](https://github.com/ajaypalamkunnel)

**Built with ❤️ by [Ajay Palamkunnel](https://github.com/ajaypalamkunnel)**

</div>
