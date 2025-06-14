# Personal Todo App 📝

A modern, personal todo application with namespaces and checklists built with React and Firebase.

## ✨ Features

- 🔐 **User Authentication** - Firebase Auth with email/password
- 📁 **Namespaces** - Organize tasks by categories (Office, Home, Personal, etc.)
- ✅ **Checklists** - Each task can have multiple checklist items
- 🎯 **Task Management** - Create, update, delete tasks
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Modern UI** - Material-UI components with beautiful design

## 🛠️ Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Authentication**: Firebase Auth
- **Database**: MongoDB Atlas (free tier)
- **Backend**: Express.js (to be deployed on Render)
- **Deployment**: AWS Amplify (frontend), Render (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Firebase account
- MongoDB Atlas account (free)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Email/Password
   - Get your Firebase config from Project Settings
   - Replace the config in `src/config/firebase.js`

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Visit `http://localhost:3000`
   - Create an account and start using the app!

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.js          # Authentication component
│   ├── Dashboard/
│   │   ├── Dashboard.js      # Main dashboard
│   │   └── NamespaceView.js  # Namespace/tasks view
│   └── Task/
│       └── TaskCard.js       # Individual task component
├── config/
│   └── firebase.js           # Firebase configuration
├── services/
│   └── api.js                # API service functions
├── App.js                    # Main app component
└── index.js                  # Entry point
```

## 🔥 Firebase Setup Steps

1. **Create Firebase Project**
   - Go to Firebase Console
   - Click "Add project"
   - Name: `todo-app-personal`
   - Disable Google Analytics

2. **Enable Authentication**
   - Authentication → Sign-in method
   - Enable "Email/Password"

3. **Get Config**
   - Project Settings → General
   - Your apps → Web app
   - Copy the `firebaseConfig` object
   - Paste it in `src/config/firebase.js`

## 🚀 Deployment

### Frontend (AWS Amplify)
1. Push code to GitHub
2. Go to AWS Amplify Console
3. Connect GitHub repository
4. Deploy automatically

### Backend (Coming Soon)
- Express.js API on Render
- MongoDB Atlas connection
- JWT authentication

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this for your personal projects.

## 🎯 Future Features

- [ ] Backend API integration
- [ ] Real-time sync
- [ ] Task due dates
- [ ] Task priorities
- [ ] Dark mode
- [ ] Export/Import functionality
- [ ] Mobile app (React Native)

---

**Built with ❤️ for personal productivity** 