import { Platform } from 'react-native';
import Constants from 'expo-constants';

class ApiDataService {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.courses = [];
    this.myRegistrations = [];
    this.allRegistrations = [];
    this.apiBaseUrl = this.getApiBaseUrl();
  }

  getApiBaseUrl() {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
      return process.env.EXPO_PUBLIC_API_BASE_URL;
    }

    const hostUri = Constants.expoConfig?.hostUri || '';
    const host = hostUri.split(':')[0];

    if (host) {
      if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
        return 'http://10.0.2.2:4000/api';
      }
      return `http://${host}:4000/api`;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000/api';
    }
    return 'http://localhost:4000/api';
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    let data = {};

    try {
      response = await fetch(`${this.apiBaseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      data = await response.json().catch(() => ({}));
    } catch (error) {
      const message =
        error?.name === 'AbortError'
          ? 'Request timed out. Please check backend server and network.'
          : `Network error. Unable to reach backend at ${this.apiBaseUrl}.`;
      throw new Error(message);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async login(email, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      this.currentUser = data.user;
      this.token = data.token;
      await Promise.all([this.loadCourses(), this.loadMyRegistrations()]);
      return this.currentUser;
    } catch (error) {
      return null;
    }
  }

  async registerUser(name, email, password, department) {
    try {
      await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, department }),
      });
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    this.myRegistrations = [];
    this.allRegistrations = [];
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  async loadCourses() {
    const data = await this.request('/courses');
    this.courses = data.courses || [];
    return this.courses;
  }

  getAllCourses() {
    return [...this.courses];
  }

  searchCourses(query) {
    if (!query) return this.getAllCourses();
    const lowerQuery = query.toLowerCase();
    return this.courses.filter(
      course =>
        course.name.toLowerCase().includes(lowerQuery) ||
        course.code.toLowerCase().includes(lowerQuery) ||
        course.instructor.toLowerCase().includes(lowerQuery) ||
        course.category.toLowerCase().includes(lowerQuery)
    );
  }

  getCourseById(id) {
    return this.courses.find(course => course.id === id);
  }

  async registerCourse(courseId, amount) {
    try {
      await this.request('/registrations', {
        method: 'POST',
        body: JSON.stringify({ courseId, amount }),
      });
      await Promise.all([this.loadCourses(), this.loadMyRegistrations()]);
      return true;
    } catch (error) {
      return false;
    }
  }

  isRegisteredForCourse(courseId) {
    if (!this.currentUser) return false;
    return this.myRegistrations.some(reg => reg.courseId === courseId);
  }

  async loadMyRegistrations() {
    if (!this.currentUser) {
      this.myRegistrations = [];
      return this.myRegistrations;
    }
    const data = await this.request('/registrations/me');
    this.myRegistrations = data.registrations || [];
    return this.myRegistrations;
  }

  getMyRegistrations() {
    return [...this.myRegistrations];
  }

  async loadAllRegistrations() {
    if (!this.currentUser) {
      this.allRegistrations = [];
      return this.allRegistrations;
    }
    const data = await this.request('/registrations');
    this.allRegistrations = data.registrations || [];
    return this.allRegistrations;
  }

  getAllRegistrations() {
    return [...this.allRegistrations];
  }

  getRegistration(courseId) {
    return this.myRegistrations.find(reg => reg.courseId === courseId) || null;
  }

  async updateProgress(courseId, newProgress) {
    try {
      await this.request(`/registrations/${courseId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ progress: newProgress }),
      });
      await this.loadMyRegistrations();
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateStreak(courseId) {
    try {
      await this.request(`/registrations/${courseId}/attendance`, {
        method: 'POST',
      });
      await this.loadMyRegistrations();
      return true;
    } catch (error) {
      return false;
    }
  }

  getTimetable() {
    const timetable = [];
    this.myRegistrations.forEach(reg => {
      const course = this.getCourseById(reg.courseId);
      if (course) {
        timetable.push({
          courseName: course.name,
          courseCode: course.code,
          instructor: course.instructor,
          schedule: course.schedule,
          credits: course.credits,
        });
      }
    });
    return timetable;
  }

  getCategories() {
    const categories = new Set(this.courses.map(c => c.category));
    return ['All', ...Array.from(categories)];
  }
}

export default new ApiDataService();
