# Todo App Backend API

Express.js backend for the Personal Todo App with MongoDB and Firebase Authentication.

## 🚀 Features

- **RESTful API** - Complete CRUD operations for tasks and namespaces
- **Firebase Authentication** - Secure JWT token verification
- **MongoDB Integration** - Efficient data storage with Mongoose ODM
- **Rate Limiting** - Protection against spam and abuse
- **CORS Support** - Configurable cross-origin resource sharing
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Structured error responses

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js          # User schema
│   ├── Namespace.js     # Namespace schema
│   └── Task.js          # Task schema with embedded checklist
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── namespaces.js    # Namespace CRUD operations
│   └── tasks.js         # Task CRUD operations
├── middleware/
│   └── auth.js          # Firebase token verification
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── env.example          # Environment variables template
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Update the following variables:

- **MONGO_URI**: Your MongoDB Atlas connection string
- **FIREBASE_SERVICE_ACCOUNT**: Firebase Admin SDK service account JSON
- **CORS_ORIGIN**: Your frontend URL (for production)

### 3. MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (M0 free tier)
3. Create a database user
4. Whitelist your IP address
5. Get the connection string and update `MONGO_URI`

### 4. Firebase Admin SDK Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Generate a new private key
5. Add these environment variables:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your-key...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```

### 5. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register/update user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify` - Verify token

### Namespaces
- `GET /api/namespaces` - Get all namespaces
- `GET /api/namespaces/:id` - Get specific namespace
- `POST /api/namespaces` - Create namespace
- `PUT /api/namespaces/:id` - Update namespace
- `DELETE /api/namespaces/:id` - Delete namespace
- `POST /api/namespaces/reorder` - Reorder namespaces

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `GET /api/tasks/stats/summary` - Get task statistics

### Checklist Operations
- `PATCH /api/tasks/:id/checklist/:itemId/toggle` - Toggle checklist item
- `POST /api/tasks/:id/checklist` - Add checklist item
- `DELETE /api/tasks/:id/checklist/:itemId` - Delete checklist item

## 🚀 Deployment to Render

### 1. Push to GitHub

Make sure your code is pushed to a GitHub repository.

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `todo-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables

In Render service settings, add these environment variables:

```
MONGO_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your-key...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### 4. Deploy

Click "Create Web Service" and Render will automatically deploy your backend.

Your API will be available at: `https://your-service-name.onrender.com`

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **CORS**: Configurable origin restrictions
- **Firebase Auth**: JWT token verification
- **Input Validation**: Request data validation
- **User Isolation**: All data scoped to authenticated user

## 📊 Database Schema

### User
- `firebaseUid` - Firebase user ID
- `email` - User email
- `displayName` - User display name
- `photoURL` - Profile picture URL

### Namespace
- `name` - Namespace name
- `description` - Optional description
- `color` - UI color code
- `icon` - Icon identifier
- `userId` - Owner's Firebase UID

### Task
- `title` - Task title
- `description` - Optional description
- `completed` - Completion status
- `priority` - low/medium/high
- `dueDate` - Optional due date
- `checklist` - Array of checklist items
- `namespaceId` - Reference to namespace
- `userId` - Owner's Firebase UID

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Verify IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

2. **Firebase Auth Errors**
   - Verify service account JSON is valid
   - Check Firebase project settings
   - Ensure Firebase Auth is enabled

3. **CORS Errors**
   - Update `CORS_ORIGIN` to match your frontend URL
   - Check that frontend is sending requests to correct backend URL

### Logs

Check Render logs for detailed error information:
- Go to your service dashboard
- Click on "Logs" tab
- Look for error messages and stack traces

## 📝 License

MIT License - See main project README for details. 