const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
    department: string;
    avatar?: string;
    managerId?: string;
    managerName?: string;
  };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getMe(): Promise<any> {
    return this.request('/users/me');
  }

  async getAllUsers(): Promise<any[]> {
    return this.request('/users');
  }

  async getUserById(id: string): Promise<any> {
    return this.request(`/users/${id}`);
  }

  // Goal Sheets
  async getGoalSheets(): Promise<any[]> {
    return this.request('/goalsheets');
  }

  async getGoalSheetById(id: string): Promise<any> {
    return this.request(`/goalsheets/${id}`);
  }

  async createGoalSheet(cycleId: string): Promise<any> {
    return this.request('/goalsheets', {
      method: 'POST',
      body: JSON.stringify({ cycleId }),
    });
  }

  async submitGoalSheet(id: string): Promise<any> {
    return this.request(`/goalsheets/${id}/submit`, {
      method: 'POST',
    });
  }

  async approveGoalSheet(id: string): Promise<any> {
    return this.request(`/goalsheets/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectGoalSheet(id: string, comment: string): Promise<any> {
    return this.request(`/goalsheets/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async unlockGoalSheet(id: string): Promise<any> {
    return this.request(`/goalsheets/${id}/unlock`, {
      method: 'POST',
    });
  }

  // Goals
  async addGoal(data: any): Promise<any> {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: any): Promise<any> {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string): Promise<any> {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Achievements
  async updateAchievement(data: any): Promise<any> {
    return this.request('/achievements', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Comments
  async addComment(data: any): Promise<any> {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  // Cycles
  async getCycles(): Promise<any[]> {
    return this.request('/cycles');
  }

  async getActiveCycle(): Promise<any> {
    return this.request('/cycles/active');
  }

  // Audit Logs
  async getAuditLogs(params?: any): Promise<any[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/audit${queryString}`);
  }

  // Escalations
  async getEscalations(): Promise<any[]> {
    return this.request('/escalations');
  }

  async resolveEscalation(id: string): Promise<any> {
    return this.request(`/escalations/${id}/resolve`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient();
