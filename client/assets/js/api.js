/* =============================================
   api.js – Centralised API helper
   ============================================= */
const API_BASE = '/api';

const api = {
  // ── Token helpers ───────────────────────────
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t),
  clearToken: () => { localStorage.removeItem('token'); localStorage.removeItem('parlour_user'); },
  getUser: () => { try { return JSON.parse(localStorage.getItem('parlour_user')); } catch { return null; } },
  setUser: (u) => localStorage.setItem('parlour_user', JSON.stringify(u)),
  isLoggedIn: () => !!localStorage.getItem('token'),

  // ── Base request method ─────────────────────
  async request(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = api.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  // ── Auth ────────────────────────────────────
  auth: {
    login:    (payload) => api.request('/auth/login',    'POST', payload),
    register: (payload) => api.request('/auth/register', 'POST', payload),
    profile:  ()        => api.request('/auth/profile'),
  },

  // ── Services ────────────────────────────────
  services: {
    getAll:       (params = '') => api.request(`/services?${params}`),
    getById:      (id)          => api.request(`/services/${id}`),
    getCategories:()            => api.request('/services/categories'),
    create:       (data)        => api.request('/services',     'POST', data),
    update:       (id, data)    => api.request(`/services/${id}`, 'PUT',  data),
    delete:       (id)          => api.request(`/services/${id}`, 'DELETE'),
  },

  // ── Appointments ────────────────────────────
  appointments: {
    getAll:       (params = '') => api.request(`/appointments?${params}${params ? '&' : ''}_t=${Date.now()}`),
    getAvailable: (date, staffId, serviceId) => api.request(`/appointments/available?date=${date}&staff_id=${staffId}&service_id=${serviceId}&_t=${Date.now()}`),
    getMine:      ()            => api.request(`/appointments/my?_t=${Date.now()}`),
    getById:      (id)          => api.request(`/appointments/${id}?_t=${Date.now()}`),
    create:       (data)        => api.request('/appointments',          'POST',  data),
    updateStatus: (id, status)  => api.request(`/appointments/${id}/status`, 'PATCH', { status }),
    reschedule:   (id, data)    => api.request(`/appointments/${id}/reschedule`, 'PUT', data),
    rescheduleMy: (id, data)    => api.request(`/appointments/my/${id}/reschedule`, 'PUT', data),
    cancelMy:     (id)          => api.request(`/appointments/my/${id}/cancel`, 'PATCH'),
    delete:       (id)          => api.request(`/appointments/${id}`, 'DELETE'),
  },

  // ── Payments ────────────────────────────────
  payments: {
    createIntent: (data) => api.request('/payments/create-intent', 'POST', data),
  },


  // ── Staff ────────────────────────────────────
  staff: {
    getAll:  (params = '') => api.request(`/staff?${params}`),
    getByService: (serviceId) => api.request(`/staff/by-service?service_id=${serviceId}`),
    getById: (id)         => api.request(`/staff/${id}`),
    getSchedule: (id)     => api.request(`/staff/${id}/schedule`),
    updateSchedule: (id, data) => api.request(`/staff/${id}/schedule`, 'PUT', { schedule: data }),
    create:  (data)       => api.request('/staff',     'POST', data),
    update:  (id, data)   => api.request(`/staff/${id}`, 'PUT', data),
    delete:  (id)         => api.request(`/staff/${id}`, 'DELETE'),
  },

  // ── Analytics ───────────────────────────────
  analytics: {
    dashboard:     () => api.request('/analytics/dashboard'),
    dashboardFull: () => api.request(`/analytics/dashboard-full?_t=${Date.now()}`),
    revenue:       (period = 'monthly') => api.request(`/analytics/revenue?period=${period}`),
    services:      () => api.request('/analytics/services'),
    status:        () => api.request('/analytics/status'),
    topStaff:      () => api.request('/analytics/top-staff'),
    peakHours:     () => api.request('/analytics/peak-hours'),
  },

  // ── Reviews ─────────────────────────────────
  reviews: {
    submit:   (data)      => api.request('/reviews',          'POST', data),
    getApproved:()        => api.request('/reviews/approved'),
    getAll:   ()          => api.request('/reviews'),
    update:   (id, status)=> api.request(`/reviews/${id}`,    'PATCH', { is_approved: status }),
    delete:   (id)        => api.request(`/reviews/${id}`,    'DELETE'),
  },
};

window.api = api;
