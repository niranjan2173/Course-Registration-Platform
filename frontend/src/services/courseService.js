import apiClient from './apiClient';

const courseService = {
  async getCourses() {
    const response = await apiClient.get('/courses');
    return response.data.courses || [];
  },

  getCategories(courses) {
    const categories = new Set((courses || []).map(course => course.category));
    return ['All', ...Array.from(categories)];
  },

  searchCourses(courses, query, category) {
    const normalizedQuery = (query || '').trim().toLowerCase();

    let filtered = [...(courses || [])];

    if (normalizedQuery) {
      filtered = filtered.filter(course =>
        [course.name, course.code, course.instructor, course.category]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(course => course.category === category);
    }

    return filtered;
  },
};

export default courseService;
