# Rehearsal Scheduler

A web application designed to help bands and music groups efficiently schedule rehearsals, track attendance, send automated reminders, and suggest optimal rehearsal times based on member availability.

## 🎯 Features

- **User Management**
  - Role-based access (band member, band manager, admin)
  - Profile management with instrument/role specification
  - Band/group creation and member invitation system

- **Scheduling System**
  - Create and manage rehearsal events
  - Recurring rehearsal setup
  - Calendar view of all scheduled rehearsals

- **Availability Tracking**
  - One-click RSVP system (attending, maybe, not attending)
  - Visual display of member availability
  - Availability polling for new rehearsal time suggestions

- **Smart Scheduling**
  - Algorithm to suggest optimal rehearsal times
  - Conflict detection
  - Priority-based scheduling

- **Notifications and Reminders**
  - Automated email/push notifications
  - Customizable reminder system
  - Status change alerts

- **Attendance Tracking**
  - Historical attendance records
  - Attendance statistics and reporting
  - No-show follow-up system

- **Resource Management**
  - Equipment checklist for rehearsals
  - Rehearsal space booking integration
  - Setlist sharing and management

- **Communication Tools**
  - In-app messaging for rehearsal-specific discussions
  - Notes and feedback system
  - Announcement broadcasts

## 🚀 Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material-UI component library
- FullCalendar.js for calendar integration
- Responsive design with CSS Grid/Flexbox

### Backend
- Node.js with Express
- RESTful API with OpenAPI specification
- JWT authentication
- Prisma ORM

### Database
- PostgreSQL
- Redis for caching

### DevOps
- Docker containers
- AWS hosting (ECS/EKS)
- GitHub Actions for CI/CD
- AWS CloudWatch monitoring

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dxaginfo/bandpractice-scheduler-tool-20250624.git
   cd bandpractice-scheduler-tool-20250624
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy example environment files
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Edit the .env files with your local configuration
   ```

4. **Database setup**
   ```bash
   # Using Docker
   docker-compose up -d db redis
   
   # Run migrations
   cd backend
   npx prisma migrate dev
   ```

5. **Start development servers**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # In another terminal, start frontend server
   cd frontend
   npm start
   ```

6. The frontend should now be available at http://localhost:3000 and the API at http://localhost:4000

### Using Docker Compose (Recommended for Local Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Project Structure

```
bandpractice-scheduler-tool-20250624/
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service clients
│   │   ├── store/           # Redux store configuration
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main application component
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js backend application
│   ├── src/                 # Source code
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express application setup
│   ├── prisma/              # Prisma schema and migrations
│   └── package.json         # Backend dependencies
│
├── docker-compose.yml       # Docker compose configuration
├── .github/                 # GitHub Actions workflows
└── README.md                # Project documentation
```

## 📊 Database Schema

The application uses PostgreSQL with the following key tables:

- **users**: User accounts and authentication
- **bands**: Music group information
- **band_members**: Relationship between users and bands
- **rehearsals**: Scheduled rehearsal events
- **attendance**: User attendance records for rehearsals
- **resources**: Files and resources for rehearsals
- **availability**: User availability patterns
- **notifications**: System notifications

## 🔐 Security Considerations

- Secure password storage with bcrypt
- JWT with short expiry and refresh token rotation
- Role-based access control
- Data encryption at rest and in transit
- GDPR-compliant data handling
- Protection against common web vulnerabilities

## 📱 Mobile Support

The application is designed with a responsive interface that works well on:
- Desktop browsers
- Tablets
- Mobile phones

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or suggestions, please open an issue in this repository.