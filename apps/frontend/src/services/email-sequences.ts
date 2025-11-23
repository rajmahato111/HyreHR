import api from './api';
import {
  EmailSequence,
  CreateEmailSequenceDto,
  UpdateEmailSequenceDto,
  EnrollCandidatesDto,
  SequenceEnrollment,
  SequencePerformance,
} from '../types/email-sequence';

export const emailSequencesService = {
  // Get all email sequences
  async getSequences(): Promise<EmailSequence[]> {
    const response = await api.get('/talent-pools/sequences');
    return response.data;
  },

  // Get single email sequence
  async getSequence(id: string): Promise<EmailSequence> {
    const response = await api.get(`/talent-pools/sequences/${id}`);
    return response.data;
  },

  // Create email sequence
  async createSequence(data: CreateEmailSequenceDto): Promise<EmailSequence> {
    const response = await api.post('/talent-pools/sequences', data);
    return response.data;
  },

  // Update email sequence
  async updateSequence(id: string, data: UpdateEmailSequenceDto): Promise<EmailSequence> {
    const response = await api.put(`/talent-pools/sequences/${id}`, data);
    return response.data;
  },

  // Delete email sequence
  async deleteSequence(id: string): Promise<void> {
    await api.delete(`/talent-pools/sequences/${id}`);
  },

  // Enroll candidates in sequence
  async enrollCandidates(id: string, data: EnrollCandidatesDto): Promise<SequenceEnrollment[]> {
    const response = await api.post(`/talent-pools/sequences/${id}/enroll`, data);
    return response.data;
  },

  // Get sequence enrollments
  async getEnrollments(id: string): Promise<SequenceEnrollment[]> {
    const response = await api.get(`/talent-pools/sequences/${id}/enrollments`);
    return response.data;
  },

  // Unenroll candidate from sequence
  async unenrollCandidate(id: string, candidateId: string): Promise<void> {
    await api.delete(`/talent-pools/sequences/${id}/enrollments/${candidateId}`);
  },

  // Get sequence performance (calculated from enrollments)
  async getSequencePerformance(id: string): Promise<SequencePerformance> {
    const enrollments = await this.getEnrollments(id);
    
    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter(e => e.completedAt).length;
    const totalReplied = enrollments.filter(e => e.repliedAt).length;
    
    const totalSent = enrollments.reduce((sum, e) => sum + e.emailsSent, 0);
    const totalOpened = enrollments.reduce((sum, e) => sum + e.emailsOpened, 0);
    
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;
    const completionRate = totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0;
    
    const sentimentBreakdown = {
      interested: enrollments.filter(e => e.responseSentiment === 'interested').length,
      notInterested: enrollments.filter(e => e.responseSentiment === 'not_interested').length,
      neutral: enrollments.filter(e => e.responseSentiment === 'neutral').length,
    };
    
    // Calculate average response time
    const responseTimes = enrollments
      .filter(e => e.enrolledAt && e.repliedAt)
      .map(e => {
        const enrolled = new Date(e.enrolledAt).getTime();
        const replied = new Date(e.repliedAt!).getTime();
        return (replied - enrolled) / (1000 * 60 * 60 * 24); // days
      });
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    return {
      totalEnrolled,
      totalCompleted,
      totalReplied,
      openRate,
      replyRate,
      completionRate,
      averageResponseTime,
      sentimentBreakdown,
    };
  },
};

export default emailSequencesService;
