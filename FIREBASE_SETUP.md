# 🔥 Firebase Setup Guide for SharePlat

Follow these steps to configure Firebase for your SharePlat application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `SharePlat` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Note**: Test mode allows read/write access without authentication. Update security rules before production!
4. Select a Cloud Firestore location (choose closest to your users)
5. Click **"Enable"**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** (`</>`) to add a web app
5. Enter app nickname: `SharePlat Web`
6. Click **"Register app"**
7. Copy the `firebaseConfig` object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Update App.jsx

1. Open `App.jsx` in your code editor
2. Find lines 18-24 (the Firebase configuration section)
3. Replace the placeholder values with your actual Firebase config:

**BEFORE:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**AFTER:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

4. Save the file

## Step 5: Test the Application

1. Make sure the dev server is running (`npm run dev`)
2. Open http://localhost:3000 in your browser
3. Try posting a food offer or request
4. Check Firebase Console → Firestore Database to see the data appear in real-time!

## 📊 Firestore Collections Created Automatically

The app will automatically create these collections when you post data:

### `foodOffers`
Created when providers post surplus food
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## 🎯 Next Steps (Optional Enhancements)

1. **Enable Authentication**:
   - Go to Authentication → Get Started
   - Enable Email/Password or Google Sign-In
   - Update the app to require login

2. **Add Indexes** (if you get index errors):
   - Firebase will show a link in the console
   - Click it to auto-create the required index

3. **Set up Firebase Hosting**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled in test mode
- [ ] Firebase config copied to App.jsx
- [ ] App running at http://localhost:3000
- [ ] Can post food offers successfully
- [ ] Can post food requests successfully
- [ ] Data appears in Firestore Console
- [ ] Real-time updates working

## 🚨 Troubleshooting: "Permission Denied" Error
If you see `FirebaseError: [code=permission-denied]`, it means your Firestore Security Rules are blocking access.

**To Fix:**
1. Go to **Firestore Database** > **Rules** tab
2. Paste these rules to allow authenticated users:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click **Publish**
