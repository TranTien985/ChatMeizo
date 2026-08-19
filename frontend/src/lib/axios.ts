import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Quan trọng: Cookie sẽ được gửi kèm mặc định cho mọi request
});

// Request Interceptor: Gắn token vào header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Response Interceptor: Xử lý refresh token tự động
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi xảy ra ngay tại các route auth thì không cần refresh làm gì, reject luôn
    if (
      !originalRequest || // Kiểm tra null safety
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Nếu lỗi 401 (Hết hạn token) và chưa retry quá 3 lần
    if ((error.response?.status === 401 || error.response?.status === 403) && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      console.log(`Đang thử refresh token lần thứ ${originalRequest._retryCount}...`);

      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true });
        
        const newAccessToken = res.data.accessToken;
        
        // Lưu token mới vào store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Cập nhật token mới vào header của request cũ đang bị pending
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Gọi lại request cũ với token mới
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng lỗi thì logout luôn
        console.error("Refresh token thất bại:", refreshError);
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;