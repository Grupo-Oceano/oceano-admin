import axios from "axios";
import { environment } from "~/environment";

const { API_URL } = environment;

export const ApiCall = {
  get: async (endpoint: string, params?: Record<string, any>) => {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  },

  post: async (endpoint: string, data?: Record<string, any>) => {
    try {
      const response = await axios.post(`${API_URL}/${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  },

  put: async (endpoint: string, data?: Record<string, any>) => {
    try {
      const response = await axios.put(`${API_URL}/${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error("API PUT Error:", error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await axios.delete(`${API_URL}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error("API DELETE Error:", error);
      throw error;
    }
  },
};
