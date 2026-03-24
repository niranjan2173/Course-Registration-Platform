import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import AssessmentScreen from './src/screens/AssessmentScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyCoursesScreen from './src/screens/MyCoursesScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import TimetableScreen from './src/screens/TimetableScreen';
import AdminScreen from './src/screens/AdminScreen';
import AdminModuleScreen from './src/screens/AdminModuleScreen';
import AdminStudentEditScreen from './src/screens/AdminStudentEditScreen';
import authService from './src/services/authService';
import theme from './src/theme';
import { ToastProvider } from './src/components';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs({ navigation }) {
  const handleLogout = () => {
    authService.logout();
    navigation.replace('Login');
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'My Courses') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Timetable') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#5F6368',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E0E0E0' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerTitleStyle: { fontWeight: theme.typography.weights.bold },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            style={styles.headerAction}
          >
            <Ionicons name="log-out-outline" size={24} color="#000000" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Explore" component={CoursesScreen} />
      <Tab.Screen name="My Courses" component={MyCoursesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs({ navigation }) {
  const handleLogout = () => {
    authService.logout();
    navigation.replace('Login');
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#5F6368',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E0E0E0' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerTitleStyle: { fontWeight: theme.typography.weights.bold },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            style={styles.headerAction}
          >
            <Ionicons name="log-out-outline" size={24} color="#000000" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen
        name="AdminModule"
        component={AdminModuleScreen}
        options={{ tabBarButton: () => null, tabBarStyle: { display: 'none' }, headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator({ navigation }) {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return isAdmin ? <AdminTabs navigation={navigation} /> : <StudentTabs navigation={navigation} />;
}

export default function App() {
  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegistrationScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Assessment" component={AssessmentScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="AdminStudentEdit" component={AdminStudentEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}

const styles = {
  headerAction: {
    marginRight: theme.spacing.md,
    minWidth: theme.touchTarget.minHeight,
    minHeight: theme.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
