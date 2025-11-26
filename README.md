# 🍽️ SharePlate - Waste Food Management Platform

A fully functional React + Firebase web application that connects food providers with receivers to reduce food waste and help those in need.

## ✨ Features

### 🔐 Authentication
- Email/Password registration and login via Firebase Auth
- Protected routes - only logged-in users can access app pages
- Logout functionality
- User email displayed on home page

### 📄 Multiple Pages (React Router)
- **Login Page**: Secure login with Firebase Authentication
- **Register Page**: Create new account
- **Home Page**: Welcome screen with user greeting and navigation cards
- **About Page**: Mission statement and information about food sharing
- **Provider Page**: Post surplus food and view receiver requests
- **Receiver Page**: Post food requirements and browse available offers

### 🍽️ For Food Providers
- Post surplus food with detailed information (quantity, type, preparation time, etc.)
- View active food requests from receivers
- Accept requests and update delivery status
- Real-time tracking: Posted → Accepted → Picked Up → On the Way → Delivered

### 🙏 For Food Receivers
- Post food requirements with preferences
- Browse available food offers in real-time
- Claim food offers and track delivery status
- Filter by location, food type, and status

### 🎨 UI/UX Highlights
- **Clean white + green theme** with professional design
- **Smooth animations** and transitions throughout
- **Green status badges** for easy tracking
- **Real-time updates** via Firebase listeners
- **Responsive design** for mobile and desktop
- **Micro-animations** for enhanced user experience
- **Progress tracker** showing delivery status visually
- **Navigation bar** with active link highlighting

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install:
- React 18
- Firebase 10 (Auth + Firestore)
- React Router DOM
- Vite



### 2. Run the Application
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

## 📊 Firebase Collections

The app uses two Firestore collections:

### `foodOffers`
- providerName
- contact
- location
- quantity
- foodType (Veg/Non-Veg/Mixed)
- category (Cooked/Packaged/Bakery/Others)
- preparedAt
- bestBefore
- notes
- status (Posted/Accepted/Picked Up/On the Way/Delivered)
- createdAt
- acceptedByName
- acceptedByContact

### `foodRequests`
- receiverName
- orgName
- contact
- location
- requiredQuantity
- preferredFoodType (Veg/Non-Veg/Any)
- timeWindow
- notes
- status (Looking/Matched/Fulfilled/Cancelled)
- createdAt
- matchedOfferId

## 🎯 How It Works

1. **Register/Login** with email and password
2. **Navigate** to Provider or Receiver page from home
3. **Providers** post surplus food with details
4. **Receivers** post their food requirements
5. Both sides see real-time lists of matching opportunities
6. Either side can initiate contact and accept/claim
7. Status updates flow through the tracking system
8. All changes sync in real-time across all connected clients

## 🔍 Filtering & Search

- **Location filter**: Search by address or area
- **Food type filter**: Veg, Non-Veg, Mixed, or Any
- **Status filter**: Filter by current delivery status

## 🛠️ Tech Stack

- **React 18** - UI framework with hooks
- **Firebase 10** - Backend (Firestore for real-time database)
- **Vite** - Build tool and dev server
- **CSS-in-JS** - Inline styles with dynamic theming

## 📱 Responsive Design

The app automatically adapts to different screen sizes:
- **Desktop**: Two-column layout (form + list)
- **Mobile**: Single-column stacked layout

## 🎨 Color Scheme (White + Green Theme)

- **Primary Green**: #1FAF4C
- **Posted**: Green (#1FAF4C)
- **Accepted**: Yellow-Green (#9ACD32)
- **Picked Up / On the Way**: Teal (#20B2AA)
- **Delivered**: Dark Green (#006400)
- **Background**: White (#ffffff)
- **Accents**: Light green gradients (#E8F5E9, #C8E6C9)

## 🔐 Security Notes

For production deployment:
1. Update Firestore security rules
2. Enable Firebase Authentication
3. Add user roles and permissions
4. Implement rate limiting
5. Use environment variables for config

## 📝 License

MIT License - Feel free to use this project for social good!

## 💚 Mission

**Making a difference, one meal at a time. Together we can end food waste and hunger.**

---

Built with ❤️ using React + Firebase
