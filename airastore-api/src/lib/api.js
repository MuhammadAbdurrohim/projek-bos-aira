const API_BASE_URL = '/api';

/**
 * Generic API request handler with authentication
 */
async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle file uploads with authentication
 */
async function uploadFile(endpoint, formData, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
export const auth = {
  login: (credentials) => 
    fetchApi('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'X-Admin-Access': '1' }
    }),
  
  logout: () => 
    fetchApi('/logout', { method: 'POST' }),
  
  getProfile: () => 
    fetchApi('/profile'),
};

// Products API
export const products = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getOne: (id) => 
    fetchApi(`/products/${id}`),
  
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return uploadFile('/products', formData);
  },
  
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT'); // Laravel requires this for PUT requests with FormData
    return uploadFile(`/products/${id}`, formData);
  },
  
  delete: (id) => 
    fetchApi(`/products/${id}`, { method: 'DELETE' }),
  
  deleteImage: (id) => 
    fetchApi(`/products/${id}/image`, { method: 'DELETE' }),
};

// Categories API
export const categories = {
  getAll: () => 
    fetchApi('/categories'),
  
  getOne: (id) => 
    fetchApi(`/categories/${id}`),
  
  create: (data) => 
    fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) => 
    fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) => 
    fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// Orders API
export const orders = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getOne: (id) => 
    fetchApi(`/orders/${id}`),
  
  updateStatus: (id, status) => 
    fetchApi(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  updatePaymentStatus: (id, paymentStatus) => 
    fetchApi(`/orders/${id}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: paymentStatus }),
    }),
};

export default {
  auth,
  products,
  categories,
  orders,
};
