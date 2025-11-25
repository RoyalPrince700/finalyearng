# FinalYearNG

A comprehensive MERN stack platform for Nigerian university students to generate, write, and manage final year projects using AI assistance.

## 🚀 Features

- **AI-Powered Topic Generation**: Generate project topics based on department, domain, and keywords
- **Chapter Generation**: AI-assisted writing for all 5 project chapters
- **Interactive AI Chat**: Get real-time help with editing, reviews, and improvements
- **Rich Text Editor**: Professional editing experience with formatting tools
- **Project Management**: Save drafts, track progress, and manage multiple projects
- **Export Support**: Export projects to DOCX and PDF formats (placeholder)
- **Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** + **bcryptjs** - Authentication
- **Axios** - HTTP client for AI API calls
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** + **Vite** - Modern React development
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TipTap** - Rich text editor (placeholder)
- **Lucide React** - Modern icon library

### AI Integration
- **Kimi (Moonshot AI)** - Primary AI model for development
- **Centralized AI Service** - Easy switching between AI providers
- **System Prompts** - Academic writing guidelines for Nigerian universities

## 📁 Project Structure

```
finalyearng/
├── frontend/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # API client
│   │   │   └── api.js
│   │   ├── components/              # Reusable components
│   │   │   ├── ChatUI.jsx          # AI chat interface
│   │   │   ├── Editor.jsx          # Rich text editor
│   │   │   └── Navbar.jsx          # Navigation bar
│   │   ├── context/                 # React context
│   │   │   └── AuthContext.jsx     # Authentication state
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── ProjectEditor.jsx   # Project editing interface
│   │   │   ├── Register.jsx        # Registration page
│   │   │   └── TopicGenerator.jsx  # Topic generation page
│   │   ├── App.jsx                 # Main app component
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # App entry point
│   ├── package.json
│   ├── env.example                # Environment variables template
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── index.html
├── backend/                         # Node.js backend
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── controllers/                # Route controllers
│   │   ├── aiController.js         # AI-related endpoints
│   │   ├── authController.js       # Authentication endpoints
│   │   └── projectController.js    # Project management endpoints
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/                     # MongoDB models
│   │   ├── Project.js              # Project schema
│   │   └── User.js                 # User schema
│   ├── routes/                     # API routes
│   │   ├── aiRoutes.js             # AI endpoints
│   │   ├── authRoutes.js           # Auth endpoints
│   │   └── projectRoutes.js        # Project endpoints
│   ├── services/
│   │   └── aiService.js            # Centralized AI service
│   ├── utils/                      # Utility functions
│   ├── server.js                   # Main backend file
│   ├── package.json
│   └── env.example                 # Environment variables template
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Kimi API key from Moonshot AI

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finalyearng
   JWT_SECRET=your_super_secret_jwt_key_here
   KIMI_API_KEY=your_kimi_api_key_here
   KIMI_BASE_URL=https://api.moonshot.cn/v1
   CLIENT_URL=http://localhost:5173
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   The frontend `.env` file is already configured to work with the backend running on `http://localhost:5000`.

4. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/project` - Get all user projects (protected)
- `POST /api/project` - Create new project (protected)
- `GET /api/project/:id` - Get specific project (protected)
- `PUT /api/project/:id` - Update project (protected)
- `DELETE /api/project/:id` - Delete project (protected)
- `POST /api/project/:id/save` - Save project draft (protected)

### AI Services
- `POST /api/ai/topics` - Generate project topics (protected)
- `POST /api/ai/generate` - Generate chapter content (protected)
- `POST /api/ai/chat` - AI chat for reviews/edits (protected)
- `GET /api/ai/models` - Get available AI models (protected)

## 🤖 AI Integration

The platform uses a centralized AI service (`backend/services/aiService.js`) that currently integrates with Kimi (Moonshot AI). The service is designed to easily switch between different AI providers.

### System Prompts
All AI interactions include academic writing guidelines specifically for Nigerian universities:
- Formal academic English
- APA-style formatting and references
- Original, plagiarism-free content
- Nigerian context awareness
- Proper chapter structure (1-5)

### Switching AI Providers
To switch to a different AI provider (OpenAI, GLM, Qwen), modify only the `aiService.js` file:
1. Update API endpoints and authentication
2. Adjust request/response formats
3. Update model names and parameters

## 📝 Development Notes

### TODO Items
- [ ] Implement full TipTap rich text editor features
- [ ] Add DOCX export functionality
- [ ] Add PDF export functionality
- [ ] Implement streaming AI responses
- [ ] Add project sharing features
- [ ] Add email verification for registration
- [ ] Add password reset functionality
- [ ] Add usage tracking and rate limiting
- [ ] Add content moderation for AI responses

### Current Implementation Status
- ✅ Basic project structure and scaffolding
- ✅ Authentication system (JWT)
- ✅ MongoDB models and database connection
- ✅ Basic AI integration with Kimi
- ✅ Topic generation functionality
- ✅ Chapter generation (placeholder)
- ✅ Project management (CRUD operations)
- ✅ Responsive UI with TailwindCSS
- ✅ Basic rich text editor (placeholder)
- ✅ AI chat interface (placeholder)
- ✅ Export functionality (placeholder)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a production MongoDB instance (MongoDB Atlas)
3. Configure proper CORS settings
4. Set up process manager (PM2)

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve static files from `dist/` directory
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**FinalYearNG** - Empowering Nigerian students with AI-assisted academic writing. 🎓🤖
