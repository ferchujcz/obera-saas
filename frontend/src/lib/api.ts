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
