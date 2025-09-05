// ==============================================
// CONFIGURAÇÃO BASE
// ==============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leprive.com.pl";

// ==============================================
// FUNÇÕES UTILITÁRIAS (mantendo as existentes)
// ==============================================

export async function fetchFromStrapi(endpoint: string) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // Revalida a cada 60 segundos (ISR)
    });

    if (!res.ok) throw new Error(`Erro ao buscar: ${endpoint}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchFromStrapiList(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error("Erro ao buscar " + endpoint);
  const json = await res.json();
  return json.data || [];
}

// Função genérica para chamadas com autenticação
async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==============================================
// TIPOS TYPESCRIPT
// ==============================================

export interface Companion {
  id: number;
  documentId: string;
  name: string;
  age: string | number;
  location: string;
  rating?: number;
  reviews?: number;
  price: string;
  specialty?: Array<{ label: string }>;
  statusInfo?: string;
  description?: string;
  event_type_id?: string;
  likes?: number;
  image?: any;
  availability?: 'Available' | 'Busy' | 'Unavailable' | 'Checking...';
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    userType?: string;
    role?: {
      id: number;
      name: string;
    };
  };
}

// ==============================================
// API DE COMPANIONS
// ==============================================

export const companionsApi = {
  // Buscar companions com filtros opcionais
  async getCompanions(params: {
    locale?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    withImage?: boolean;
  } = {}) {
    const { locale = 'pl', page = 1, pageSize = 99, sort = 'likes:desc', withImage = true } = params;
    
    const url = new URL(`${API_URL}/api/companions`);
    url.searchParams.set('locale', locale);
    url.searchParams.set('sort', sort);
    url.searchParams.set('pagination[page]', page.toString());
    url.searchParams.set('pagination[pageSize]', pageSize.toString());
    url.searchParams.set('populate', 'image');
    
    if (withImage) {
      url.searchParams.set('filters[image][id][$notNull]', 'true');
    }

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch companions');
    
    return response.json();
  },

  // Buscar availability de um companion específico
  async getCompanionAvailability(eventTypeId: string) {
    if (!eventTypeId || !String(eventTypeId).match(/^\d+$/)) {
      return { availability_slots: null };
    }
    
    try {
      const response = await fetch(`${API_URL}/api/companions/event-type/${eventTypeId}/availability`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch availability for event ${eventTypeId}:`, error);
      return { availability_slots: null };
    }
  },

  // Dar like em um companion
  async likeCompanion(documentId: string) {
    const response = await fetch(`${API_URL}/api/companions/document/${documentId}/like`, {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to like companion');
    return response.json();
  },

  // Buscar companion específico por documentId
  async getCompanionByDocumentId(documentId: string, locale: string = 'pl') {
    const url = `${API_URL}/api/companions/${documentId}?locale=${locale}&populate=*`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch companion');
    return response.json();
  },
};

// ==============================================
// API DE CONTEÚDO (CMS)
// ==============================================

export const contentApi = {
  // Hero Section
  async getHeroContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/hero-section-content?locale=${locale}`);
  },

  // Gallery Content
  async getGalleryContent(locale: string = 'pl') {
    const endpoint = `/api/gallery-content?populate[galleryButton]=true&populate[heroGalleryInfo]=true&populate[slides]=true&populate[facilities]=true&populate[facilitiesIntro]=true&populate[privateEnvironmentButton]=true&locale=${locale}`;
    return fetchFromStrapi(endpoint);
  },

  // Companions Gallery Content
  async getCompanionsGalleryContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/companions-gallery-content?locale=${locale}`);
  },

  // Footer Content
  async getFooterContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/footer-content?populate=*&locale=${locale}`);
  },

  // Header Content
  async getHeaderContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/header-content?locale=${locale}&populate=*`);
  },

  // Why Choose Us Content
  async getWhyChooseContent(locale: string = 'pl') {
    const endpoint = `/api/why-choose-content?populate[cards]=true&populate[bottomButton]=true&locale=${locale}`;
    return fetchFromStrapi(endpoint);
  },

  // Why Choose Section (bottom part)
  async getWhyChooseSection(locale: string = 'pl') {
    const endpoint = `/api/why-choose-section?populate[bottomCards]=true&locale=${locale}`;
    return fetchFromStrapi(endpoint);
  },

  // Services Content
  async getServicesContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/services-content?locale=${locale}`);
  },
};

// ==============================================
// API DE AUTENTICAÇÃO
// ==============================================

export const authApi = {
  // Login
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    return response.json();
  },

  // Forgot Password
  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Password reset failed');
    }

    return response.json();
  },

  // Get user profile
  async getProfile() {
    return authenticatedFetch('/api/users/me');
  },
};

// ==============================================
// API DE TEXTOS DINÂMICOS
// ==============================================

export const textsApi = {
  // Login Modal Content
  async getLoginContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/login-content?locale=${locale}`);
  },

  // Reset Password Content
  async getResetPasswordContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/reset-password-content?locale=${locale}`);
  },

  // Booking Modal Content
  async getBookingContent(locale: string = 'pl') {
    return fetchFromStrapi(`/api/booking-content?locale=${locale}`);
  },
};

// ==============================================
// FUNÇÕES DE CONVENIÊNCIA (para facilitar migração)
// ==============================================

// Wrapper para manter compatibilidade com código existente
export const apiHelpers = {
  // Para usar nos componentes que já chamam fetch diretamente
  async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Para construir URLs com parâmetros facilmente
  buildStrapiUrl(endpoint: string, params: Record<string, string | number | boolean> = {}) {
    const url = new URL(`${API_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  },
};
