import { baseApiService } from './BaseApiService';

class AuthService {
  static getInstance(): AuthService {
    return new AuthService();
  }

  async login(data: { username: string; password: string }) {
    return baseApiService.post(
      '/api/v1/portal/auth/login',
      'api.learner.auth.login',
      data,
      {
        extras: { useAuth: false },
      }
    );
  }

  async fetchMe() {
    return baseApiService.get('/api/v1/portal/learner/read');
  }

  async fetchCSRFToken(): Promise<{ token: string }> {
    return baseApiService.get('/api/v1/portal/auth/csrf-token');
  }

  async logout() {
    return baseApiService.post(
      '/api/v1/portal/auth/logout',
      'api.learner.auth.logout'
    );
  }
}

export const authService = AuthService.getInstance();
