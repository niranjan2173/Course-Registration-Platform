import apiClient from './apiClient';

const registrationService = {
  async registerCourse(courseId, amount) {
    const response = await apiClient.post('/registrations', { courseId, amount });
    return response.data;
  },

  async getMyRegistrations() {
    const response = await apiClient.get('/registrations/me');
    return response.data.registrations || [];
  },

  async getAllRegistrations() {
    const response = await apiClient.get('/admin/registrations');
    return response.data.registrations || [];
  },

  async updateProgress(courseId, progress) {
    const response = await apiClient.patch(`/registrations/${courseId}/progress`, { progress });
    return response.data;
  },

  async getContentProgress(courseId) {
    const response = await apiClient.get(`/registrations/${courseId}/content-progress`);
    return response.data.items || [];
  },

  async updateContentProgress(courseId, itemId, progress, overallProgress) {
    const payload = { itemId, progress };
    if (overallProgress !== undefined) {
      payload.overallProgress = overallProgress;
    }
    const response = await apiClient.patch(`/registrations/${courseId}/content-progress`, payload);
    return response.data;
  },

  async getAssessmentStatus(courseId) {
    const response = await apiClient.get(`/registrations/${courseId}/assessments`);
    return response.data;
  },

  async submitAssessment(courseId, milestone, score) {
    const response = await apiClient.post(`/registrations/${courseId}/assessments`, { milestone, score });
    return response.data;
  },

  async markAttendance(courseId) {
    const response = await apiClient.post(`/registrations/${courseId}/attendance`);
    return response.data;
  },

  async markAttendanceForRegistration(registrationId) {
    const response = await apiClient.post(`/admin/registrations/${registrationId}/attendance`);
    return response.data;
  },

  getTimetable(courses, registrations) {
    const courseMap = new Map((courses || []).map(course => [course.id, course]));
    return (registrations || [])
      .map(registration => {
        const course = courseMap.get(registration.courseId);
        if (!course) {
          return null;
        }
        return {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          instructor: course.instructor,
          schedule: course.schedule,
          credits: course.credits,
          duration: course.duration,
          category: course.category,
        };
      })
      .filter(Boolean);
  },
};

export default registrationService;
