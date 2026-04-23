/**
 * Centralized API utility for TN Recruitment App.
 * Optimized for Static Export on S3.
 */

const getApiUrl = () => {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
};

const BASE_URL = getApiUrl();

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  let data: any = {};
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    // If not JSON, it might be a CloudFront/WAF error page (HTML)
    if (!response.ok) {
      return Promise.reject({
        message: `Hệ thống bận hoặc bị chặn (Status: ${response.status})`,
        details: 'Vui lòng kiểm tra lại kết nối hoặc kích thước file đính kèm.',
        status: response.status
      });
    }
    data = { message: 'Unexpected non-JSON response' };
  }

  if (!response.ok) {
    // Auto-logout only for AUTH-related errors (401/403 on protected routes)
    // We avoid redirecting if it's a 403 from WAF/CloudFront on public routes like /apply
    if (response.status === 401) {
      console.warn('[API] Phiên làm việc hết hạn. Đang chuyển hướng...');
      localStorage.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject({
      message: data.error || 'API Request failed',
      details: data.details,
      status: response.status
    });
  }
  return data;
}

export const api = {
  get: async (endpoint: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return handleResponse(res);
  },

  post: async (endpoint: string, body: any, isFormData = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Authorization': token ? `Bearer ${token}` : '',
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint: string, body: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return handleResponse(res);
  },
};
