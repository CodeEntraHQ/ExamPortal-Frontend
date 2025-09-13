# ExamPortal Frontend

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/ESLint-9.33.0-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.6.2-F7B93E?style=flat-square&logo=prettier&logoColor=white)](https://prettier.io/)
[![Husky](https://img.shields.io/badge/Husky-9.1.7-000000?style=flat-square&logo=husky&logoColor=white)](https://typicode.github.io/husky/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

A modern React application built with Vite, Tailwind CSS, and TypeScript for the ExamPortal.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## GitHub Workflow

### 🔄 Development Process

**⚠️ IMPORTANT**: Never commit directly to the `main` branch. Always use feature branches and pull requests.

#### **Step-by-Step Development Workflow:**

1. **🔄 Always Pull Latest Changes First**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **🌿 Create and Switch to Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b bugfix/issue-description
   ```

3. **💻 Make Your Changes**
   - Write your code
   - Test your changes
   - Ensure all linting passes

4. **✅ Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue description"
   ```

5. **🚀 Push Feature Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **📝 Create Pull Request**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Add descriptive title and description
   - Request review from team members
   - Wait for approval before merging

#### **Branch Naming Conventions:**
- **Features**: `feature/feature-name` (e.g., `feature/user-authentication`)
- **Bug fixes**: `bugfix/issue-description` (e.g., `bugfix/login-validation`)
- **Hotfixes**: `hotfix/critical-issue` (e.g., `hotfix/security-patch`)
- **Refactoring**: `refactor/component-name` (e.g., `refactor/dashboard-cleanup`)

## Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **lint-staged** for running linters on staged files

All code is automatically formatted and linted before commits.
