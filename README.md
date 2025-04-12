# HirePath - Job Application Tracking Platform

HirePath is a comprehensive job application tracking platform that helps job seekers organize their job search, set KPIs, and track their progress.

## Features

- **Job Application Tracking**: Add, edit, and delete job applications
- **Application Status Management**: Track applications through different stages
- **KPI Settings**: Set daily application targets and track progress
- **Dream Companies**: Mark and filter applications for your dream companies
- **Deadline Tracking**: Set and track application deadlines
- **Statistics Dashboard**: View your application progress and statistics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hirepath.git
   cd hirepath
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory with:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

4. Start the development servers:
   ```
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd frontend
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Options

#### Backend (Render)
1. Create a Render account
2. Connect your GitHub repository
3. Configure as a Web Service
4. Set environment variables
5. Deploy

#### Frontend (Vercel)
1. Create a Vercel account
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy

## Technologies Used

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- Express for the backend framework 