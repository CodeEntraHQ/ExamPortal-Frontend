# ExamEntra Frontend

A modern, secure, and feature-rich web application for conducting online scholarship exams. Built with React, TypeScript, and Vite, ExamEntra provides a comprehensive platform for exam management, monitoring, and student assessment.

## 🚀 Features

### Core Functionality
- **Exam Management**: Create, edit, and manage exams with comprehensive question banks
- **Real-Time Exam Monitoring**: Face detection and audio monitoring during exams
- **Admission Forms**: Dynamic admission form builder with public submission support
- **Results Management**: View and manage exam results with detailed analytics
- **User Management**: Complete user profile and account management system

### Student Features
- Interactive exam interface with timer and progress tracking
- Real-time exam monitoring with face detection
- Results viewing with detailed feedback
- Dashboard with exam history and upcoming exams

### Admin Features
- Entity management and organization control
- Exam creation and question management
- Admission form builder
- Submission review and status management
- Analytics dashboard

### Representative Features
- Admission form viewing and management
- Submission review and processing

## 🛠️ Tech Stack

### Core Technologies
- **React 18.3.1**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite 6.3.5**: Fast build tool and dev server
- **React Router 7.9.6**: Client-side routing

### UI Components & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Data visualization
- **Sonner**: Toast notifications

### Form Management
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation (via validation middleware)

### Monitoring & Detection
- **MediaPipe**: Face detection and camera utilities
- Custom hooks for audio detection and exam monitoring

### State Management
- React Context API for global state
- Custom providers for Auth, Theme, Notifications, and Exam context

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Backend API**: ExamPortal-Backend should be running (see backend README)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ExamPortal-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables (see [Environment Variables](#environment-variables) section)

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in `VITE_DEV_PORT`).

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server with hot module replacement
- `npm run build`: Build the application for production

### Development Server

The development server runs on port 3000 by default (configurable via `VITE_DEV_PORT`). It includes:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps for debugging

### Code Style

The project uses:
- **ESLint**: Code linting (see `eslint.config.js`)
- **Prettier**: Code formatting (see `.prettierrc`)
- **TypeScript**: Type checking

**Built with ❤️ for secure online examinations**
