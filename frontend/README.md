# Course Registration Mobile Application

## 🎓 Project Information
- **Developer**: NIRANJAN V – 7376232AD203
- **Version**: 1.0.0
- **Platform**: React Native (Expo)
- **Type**: College Mini Project
- **Level**: Frontend Only (No Backend Required)

## 📱 Features
✅ User Authentication (Mock Login)  
✅ Course Browsing & Search  
✅ Course Registration with Mock Payment  
✅ Progress Tracking with Interactive Sliders  
✅ Learning Streaks Monitoring  
✅ Weekly Timetable View  
✅ Admin Panel for Viewing Registrations  
✅ Beautiful Material Design UI  

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (will be installed automatically)
- Android/iOS device or emulator

### Installation Steps

1. **Extract the project folder**
   ```bash
   cd course-registration-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator (Mac only)
   - Or press `w` for web browser

## 🔑 Login Credentials

### Student Account
- **Email**: `student@college.edu`
- **Password**: `student123`

### Admin Account
- **Email**: `admin@college.edu`
- **Password**: `admin123`

## 📂 Project Structure

```
course-registration-app/
├── App.js                          # Main app with navigation
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── src/
│   ├── data/
│   │   └── mockData.js            # Mock backend service
│   ├── screens/
│   │   ├── LoginScreen.js         # Login interface
│   │   ├── CoursesScreen.js       # Browse & register
│   │   ├── MyCoursesScreen.js     # Registered courses
│   │   ├── ProgressScreen.js      # Track progress
│   │   ├── TimetableScreen.js     # Weekly schedule
│   │   └── AdminScreen.js         # Admin panel
│   └── components/                # Reusable components (if any)
└── README.md                      # This file
```

## 🎯 User Flows

### Student Flow
1. **Login** → Enter student credentials
2. **Explore** → Browse available courses with search/filter
3. **View Details** → See course information, schedule, instructor
4. **Register** → Mock payment and course registration
5. **My Courses** → View all registered courses
6. **Progress** → Track learning progress with interactive sliders
7. **Mark Attendance** → Build daily learning streaks
8. **Timetable** → View weekly class schedule

### Admin Flow
1. **Login** → Enter admin credentials
2. **View Registrations** → See all student registrations
3. **Sort & Filter** → Organize by date/student/course
4. **View Details** → Check registration and progress info
5. **Browse Courses** → View all available courses

## 💡 Key Features Explained

### 1. Course Browsing
- Search by course name, code, instructor
- Filter by category
- View detailed course information
- Check enrollment status

### 2. Registration Process
- One-tap course registration
- Mock payment processing
- Instant confirmation
- Automatic enrollment count update

### 3. Progress Tracking
- Interactive slider to adjust progress (0-100%)
- Visual progress bars with color coding:
  - Red: < 30%
  - Orange: 30-60%
  - Blue: 60-80%
  - Green: > 80%
- Milestone tracking (0%, 25%, 50%, 75%, 100%)

### 4. Learning Streaks
- Track consecutive days of learning
- Daily attendance marking
- Current streak vs. longest streak
- Fire icon visual indicator

### 5. Timetable
- Color-coded weekly view
- All class schedules organized by day
- Shows instructor, time, and credits
- Easy-to-read layout

### 6. Admin Panel
- View all registrations
- Sort by date, student name, or course
- Detailed registration information
- Progress and streak monitoring

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **UI Components**: React Native core components
- **Icons**: @expo/vector-icons (Ionicons)
- **State Management**: React Hooks (useState, useEffect)
- **Data**: Mock in-memory data service

## 📝 Mock Data Structure

### Users
- Student and Admin accounts
- ID, name, email, role, department, roll number

### Courses
- 6 pre-configured courses
- Computer Science and AI categories
- Full details (instructor, schedule, price, etc.)

### Registrations
- Student-course mappings
- Progress tracking
- Streak information
- Payment status

## ⚙️ Customization

### Add More Courses
Edit `src/data/mockData.js`:
```javascript
this.courses.push({
  id: '7',
  name: 'Your Course Name',
  code: 'CS307',
  // ... add other details
});
```

### Add More Users
Edit `src/data/mockData.js`:
```javascript
this.users.push({
  id: '3',
  name: 'New User',
  email: 'user@college.edu',
  password: 'password123',
  role: 'student',
  // ... add other details
});
```

### Change Theme Colors
Edit screen styles in individual screen files:
- Primary Color: `#1976D2` (Blue)
- Admin Color: `#9C27B0` (Purple)
- Success Color: `#4CAF50` (Green)

## 🎨 UI/UX Highlights

- **Gradient Backgrounds** on login screen
- **Bottom Sheet Modals** for details
- **Smooth Animations** on navigation
- **Interactive Sliders** for progress
- **Color-Coded Visuals** for better UX
- **Responsive Cards** with shadows
- **Icon Integration** throughout

## 📱 Platform Support

- ✅ Android
- ✅ iOS
- ✅ Web (via Expo)

## ⚠️ Important Notes

- **No Backend Required**: All data is mock/in-memory
- **Data Resets**: Data clears when app restarts
- **Demo Only**: Perfect for project presentations
- **No Real Payments**: Payment processing is simulated
- **Educational Purpose**: Designed for college mini projects

## 🐛 Troubleshooting

### Issue: Metro Bundler won't start
```bash
npx expo start --clear
```

### Issue: Dependencies not installing
```bash
rm -rf node_modules
npm install
```

### Issue: App crashes on startup
- Check Node.js version (should be v14+)
- Ensure all dependencies are installed
- Clear Metro cache: `npx expo start --clear`

### Issue: Can't connect to Expo Go
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

## 📞 Support

For issues or questions:
1. Check this README thoroughly
2. Verify all dependencies are installed
3. Ensure Node.js is up to date
4. Clear cache and restart Metro bundler

## 🎓 Academic Use

This project fulfills requirements for:
- ✅ Mobile Application Development course
- ✅ Course Registration System
- ✅ User Authentication implementation
- ✅ Payment Processing (Mock)
- ✅ Progress Tracking features
- ✅ Admin Dashboard

Perfect for college mini-project demonstrations! 🎉

## 📜 License

This project is for educational purposes only.

---

**Developed by**: NIRANJAN V – 7376232AD203  
**Project Type**: College Mini Project  
**Year**: 2024

ER DIAGRAM (Text Format)

        USERS
     ----------------
     user_id (PK)
     name
     email
     password
     role
     department
     roll_number
            |
            | 1
            |
            |<--------------------|
            |                     |
        REGISTRATIONS            |
     -------------------         |
     registration_id (PK)        |
     user_id (FK) ---------------|
     course_id (FK) ------------------> 1
     registration_date                |
     payment_status                   |
     progress                         |
     current_streak                   |
     longest_streak                   |
                                      |
                                      |
                                   COURSES
                                ----------------
                                course_id (PK)
                                course_name
                                course_code
                                instructor
                                category
                                credits
                                price
                                schedule_day
                                schedule_time


DATA SCHEMA 

1.TABLE: user

| Column Name | Data Type    | Constraints      | Description         |
| ----------- | ------------ | ---------------- | ------------------- |
| user_id     | VARCHAR(10)  | PRIMARY KEY      | Unique user ID      |
| name        | VARCHAR(100) | NOT NULL         | User full name      |
| email       | VARCHAR(100) | UNIQUE, NOT NULL | Login email         |
| password    | VARCHAR(100) | NOT NULL         | User password       |
| role        | VARCHAR(20)  | NOT NULL         | student / admin     |
| department  | VARCHAR(100) | NULL             | Department name     |
| roll_number | VARCHAR(20)  | NULL             | Student roll number |

2.course

| Column Name   | Data Type     | Constraints      | Description         |
| ------------- | ------------- | ---------------- | ------------------- |
| course_id     | VARCHAR(10)   | PRIMARY KEY      | Unique course ID    |
| course_name   | VARCHAR(100)  | NOT NULL         | Course title        |
| course_code   | VARCHAR(20)   | UNIQUE, NOT NULL | Course code (CS301) |
| instructor    | VARCHAR(100)  | NOT NULL         | Faculty name        |
| category      | VARCHAR(50)   | NOT NULL         | Course category     |
| credits       | INT           | NOT NULL         | Credit value        |
| price         | DECIMAL(10,2) | NOT NULL         | Course fee          |
| schedule_day  | VARCHAR(20)   | NOT NULL         | Class day           |
| schedule_time | VARCHAR(20)   | NOT NULL         | Class timing        |

                