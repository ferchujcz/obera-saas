import api from "./axios";

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
}

export interface Property {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  price: number;
  neighborhood: string;
  bedrooms: number;
  property_type?: string | null;
  contract_requirements?: string | null;
  status: "AVAILABLE" | "RENTED" | "PAUSED" | "EXPIRED";
  images: PropertyImage[];
}

export interface PropertyFilters {
  property_type?: string;
  type?: string;
  neighborhood?: string;
  min_bedrooms?: number;
  bedrooms?: number | string;
  max_price?: number | string;
  maxPrice?: number | string;
  skip?: number;
  limit?: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN" | string;
  is_active: boolean;
}

/**
 * Inicia sesión utilizando OAuth2 Password Request Form (esperado por FastAPI).
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const response = await api.post<LoginResponse>("/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
}

/**
 * Registra un nuevo usuario con rol (TENANT para estudiantes/inquilinos u OWNER para propietarios).
 */
export async function register(
  email: string,
  password: string,
  role: "TENANT" | "OWNER" = "TENANT"
): Promise<User> {
  const response = await api.post<User>("/register", {
    email,
    password,
    role,
    is_active: true,
  });
  return response.data;
}

/**
 * Obtiene la lista de propiedades públicas con filtros opcionales.
 * Envía los parámetros seleccionados (property_type, neighborhood, min_bedrooms, max_price)
 * mediante el objeto params de Axios hacia el endpoint /properties/.
 */
export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  const queryParams: Record<string, any> = {};

  if (filters) {
    // Tipo de propiedad (ej. 'Casa', 'Departamento', 'Monoambiente')
    const propertyType = filters.property_type || filters.type;
    if (propertyType && propertyType !== "all" && propertyType.trim()) {
      queryParams.property_type = propertyType.trim();
    }

    // Barrio o Localidad (ej. 'Barrio Schuster', 'Centro')
    if (filters.neighborhood && filters.neighborhood.trim()) {
      queryParams.neighborhood = filters.neighborhood.trim();
    }

    // Cantidad de dormitorios (mínimo)
    const bedrooms = filters.min_bedrooms ?? filters.bedrooms;
    if (bedrooms !== undefined && bedrooms !== null && bedrooms !== "" && bedrooms !== "all") {
      const parsedBedrooms = Number(bedrooms);
      if (!isNaN(parsedBedrooms)) {
        queryParams.min_bedrooms = parsedBedrooms;
      }
    }

    // Precio máximo mensual
    const maxPrice = filters.max_price ?? filters.maxPrice;
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
      const parsedMaxPrice = Number(maxPrice);
      if (!isNaN(parsedMaxPrice) && parsedMaxPrice > 0) {
        queryParams.max_price = parsedMaxPrice;
      }
    }

    if (filters.skip !== undefined) queryParams.skip = filters.skip;
    if (filters.limit !== undefined) queryParams.limit = filters.limit;
  }

  const response = await api.get<Property[]>("/properties/", {
    params: queryParams,
  });
  return response.data;
}

/**
 * Obtiene el detalle de una propiedad individual por su ID.
 */
export async function getPropertyById(propertyId: number): Promise<Property> {
  const response = await api.get<Property>(`/properties/${propertyId}`);
  return response.data;
}

export interface PublicReviewItem {
  id: number;
  reviewer_id: number;
  reviewer_email?: string | null;
  property_id?: number | null;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface PublicUserProfile {
  id: number;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN" | string;
  created_at: string;
  rating_average: number;
  reviews_count: number;
  reviews: PublicReviewItem[];
  properties: Property[];
}

/**
 * Obtiene el perfil público de un usuario (Dueño o Inquilino), incluyendo sus calificaciones
 * y su catálogo de propiedades activas.
 */
export async function getProfile(userId: number): Promise<PublicUserProfile> {
  const response = await api.get<PublicUserProfile>(`/profile/${userId}`);
  return response.data;
}

export interface CreateReviewData {
  reviewed_id: number;
  property_id?: number | null;
  rating: number;
  comment?: string | null;
}

/**
 * Publica una calificación/reseña hacia otro usuario.
 */
export async function createReview(data: CreateReviewData): Promise<PublicReviewItem> {
  const response = await api.post<PublicReviewItem>("/reviews/", data);
  return response.data;
}

/**
 * Obtiene los datos del usuario autenticado actualmente (incluyendo su rol real).
 */
export async function getMe(): Promise<User> {
  const response = await api.get<User>("/me");
  return response.data;
}

export interface CreatePropertyData {
  title: string;
  description?: string | null;
  price: number;
  neighborhood: string;
  bedrooms: number;
  property_type?: string | null;
  contract_requirements?: string | null;
  status?: "AVAILABLE" | "RENTED" | "PAUSED" | "EXPIRED";
}

/**
 * Crea una nueva propiedad para el propietario autenticado.
 * Si se incluye imageUrl, se asocia automáticamente como fotografía de la propiedad.
 */
export async function createProperty(
  data: CreatePropertyData,
  imageUrl?: string
): Promise<Property> {
  const response = await api.post<Property>("/properties/", data);
  const createdProp = response.data;

  if (imageUrl && imageUrl.trim()) {
    try {
      const imgRes = await api.post<PropertyImage>(`/properties/${createdProp.id}/images`, {
        image_url: imageUrl.trim(),
      });
      createdProp.images = [imgRes.data];
    } catch (imgErr) {
      console.warn("No se pudo asociar la imagen inicial a la propiedad:", imgErr);
    }
  }

  return createdProp;
}

export interface Alert {
  id: number;
  tenant_id: number;
  neighborhood: string;
  max_price: number;
  min_bedrooms: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateAlertData {
  neighborhood: string;
  max_price: number;
  min_bedrooms: number;
  is_active?: boolean;
}

/**
 * Registra una nueva alerta de búsqueda de alquiler para un inquilino.
 */
export async function createAlert(data: CreateAlertData): Promise<Alert> {
  const response = await api.post<Alert>("/alerts/", data);
  return response.data;
}

/**
 * Obtiene las alertas activas registradas por el inquilino autenticado.
 */
export async function getAlertsMe(): Promise<Alert[]> {
  const response = await api.get<Alert[]>("/alerts/me");
  return response.data;
}

/**
 * Activa la suscripción de prueba gratuita de 30 días para propietarios.
 */
export async function startTrialSubscription(): Promise<any> {
  const response = await api.post("/subscriptions/trial");
  return response.data;
}


