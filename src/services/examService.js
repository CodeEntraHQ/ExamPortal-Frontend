import apiService from './api.js';

class ExamService {
  async getExams() {
    return apiService.request('/v1/exams', {
      method: 'GET',
    });
  }

  async getExamById(id) {
    return apiService.request(`/v1/exams/${id}`, {
      method: 'GET',
    });
  }

  async createExam(examData) {
    return apiService.request('/v1/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(id, examData) {
    return apiService.request(`/v1/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(id) {
    return apiService.request(`/v1/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuestions(examId) {
    return apiService.request(`/v1/exams/${examId}/questions`, {
      method: 'GET',
    });
  }

  async createQuestion(examId, questionData) {
    return apiService.request(`/v1/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async inviteStudents(examId, studentData) {
    return apiService.request(`/v1/exams/${examId}/invite`, {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }
}

export default new ExamService();
