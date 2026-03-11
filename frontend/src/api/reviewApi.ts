import apiClient from './apiClient';

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  doctorId?: string;
  serviceId?: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    fullName: string;
    email?: string;
  };
  doctor?: {
    id: string;
    fullName: string;
  };
  service?: {
    id: string;
    name: string;
  };
  appointment?: {
    id: string;
    appointmentDate: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export const reviewApi = {
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
  },

  getDoctorReviews: async (doctorId: string, approvedOnly: boolean = true): Promise<{ reviews: Review[]; stats: ReviewStats }> => {
    const response = await apiClient.get(`/reviews/doctors/${doctorId}`, {
      params: { approvedOnly },
    });
    return response.data.data;
  },

  getServiceReviews: async (serviceId: string, approvedOnly: boolean = true): Promise<{ reviews: Review[]; stats: ReviewStats }> => {
    const response = await apiClient.get(`/reviews/services/${serviceId}`, {
      params: { approvedOnly },
    });
    return response.data.data;
  },

  getAll: async (approvedOnly: boolean = false): Promise<Review[]> => {
    const response = await apiClient.get('/reviews', {
      params: { approvedOnly },
    });
    return response.data.data;
  },

  updateApprovalStatus: async (reviewId: string, isApproved: boolean): Promise<Review> => {
    const response = await apiClient.patch(`/reviews/${reviewId}/approval`, { isApproved });
    return response.data.data;
  },
};
