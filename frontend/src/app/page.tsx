"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  Zap,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { getProperties, Property, PropertyFilters } from "@/lib/api";

function HomeContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilters | null>(null);
  const lastQueryRef = React.useRef<string>("");

  const fetchPropertiesWithFilters = async (customFilters?: PropertyFilters, force = false) => {
    const filters: PropertyFilters = customFilters || {
      type: searchParams?.get("type") || undefined,
      property_type: searchParams?.get("property_type") || searchParams?.get("type") || undefined,
      bedrooms: searchParams?.get("bedrooms") || searchParams?.get("min_bedrooms") || undefined,
      max_price: searchParams?.get("max_price") || searchParams?.get("maxPrice") || undefined,
      maxPrice: searchParams?.get("maxPrice") || searchParams?.get("max_price") || undefined,
      neighborhood: searchParams?.get("neighborhood") || undefined,
    };

    const queryKey = JSON.stringify({
      t: filters.property_type || filters.type || "",
      b: filters.min_bedrooms || filters.bedrooms || "",
      p: filters.max_price || filters.maxPrice || "",
      n: filters.neighborhood || "",
    });

    if (!force && queryKey === lastQueryRef.current) {
      return;
    }
    lastQueryRef.current = queryKey;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getProperties(filters);
      setProperties(data);
    } catch (err) {
      console.error("Error al obtener propiedades del backend:", err);
      setError("No se pudieron cargar las propiedades. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtersFromUrl: PropertyFilters = {
      type: searchParams?.get("type") || undefined,
      property_type: searchParams?.get("property_type") || searchParams?.get("type") || undefined,
      bedrooms: searchParams?.get("bedrooms") || searchParams?.get("min_bedrooms") || undefined,
      max_price: searchParams?.get("max_price") || searchParams?.get("maxPrice") || undefined,
      maxPrice: searchParams?.get("maxPrice") || searchParams?.get("max_price") || undefined,
      neighborhood: searchParams?.get("neighborhood") || undefined,
    };
    setAppliedFilters(filtersFromUrl);
    fetchPropertiesWithFilters(filtersFromUrl);
  }, [searchParams]);

  const handleSearch = (filters: PropertyFilters) => {
    setAppliedFilters(filters);
    fetchPropertiesWithFilters(filters, true);
  };

  const currentType = appliedFilters?.property_type || appliedFilters?.type || searchParams?.get("type") || searchParams?.get("property_type");
  const currentNeighborhood = appliedFilters?.neighborhood || searchParams?.get("neighborhood");
  const currentMaxPrice = appliedFilters?.max_price || appliedFilters?.maxPrice || searchParams?.get("max_price") || searchParams?.get("maxPrice");
  const currentBedrooms = appliedFilters?.bedrooms || appliedFilters?.min_bedrooms || searchParams?.get("bedrooms") || searchParams?.get("min_bedrooms");

  const isFiltering = Boolean(currentType || currentNeighborhood || currentMaxPrice || currentBedrooms);

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <div className="min-h-[70vh] flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Foto de Fondo Panorámica */}
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Inmuebles en Oberá Misiones"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Overlay Oscuro para Legibilidad */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

        {/* Contenido Central */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
          
          {/* Badge Corporativo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-white mb-4 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Red Inmobiliaria de Oberá y Zona Centro</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md max-w-4xl leading-tight">
            El portal inmobiliario de Oberá
          </h1>

          {/* Subtítulo Profesional */}
          <p className="mt-3 mb-8 text-base sm:text-lg text-slate-200 max-w-2xl font-normal drop-shadow">
            Encontrá casas, departamentos y locales. Conectá directamente con dueños e inmobiliarias.
          </p>

          {/* Súper Buscador Central Flexible */}
          <div className="w-full">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Accesos Rápidos de Tipologías y Barrios */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/90">
            <span className="font-semibold text-slate-300">Explorar por tipología:</span>
            {["Casas", "Departamentos", "Monoambientes", "Locales", "Centro"].map((item) => {
              const paramKey = item === "Centro" ? "neighborhood" : "type";
              const paramVal = item === "Locales" ? "Local" : item === "Casas" ? "Casa" : item === "Departamentos" ? "Departamento" : item;
              return (
                <Link
                  key={item}
                  href={`/?${paramKey}=${encodeURIComponent(paramVal)}`}
                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 transition-colors font-medium"
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN DE PROPIEDADES EN TIEMPO REAL                                     */}
      {/* ========================================================================= */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado de Sección */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFiltering ? "Resultados de Búsqueda" : "Publicaciones Recientes"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isFiltering ? "Inmuebles que coinciden con tu criterio" : "Últimos alquileres publicados"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {isFiltering
                  ? "Mostrando resultados filtrados en tiempo real según los parámetros seleccionados."
                  : "Explorá todas las propiedades disponibles directamente de dueños e inmobiliarias en Oberá."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchPropertiesWithFilters(appliedFilters || undefined, true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
                title="Actualizar listado"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publicar Inmueble</span>
              </Link>
            </div>
          </div>

          {/* Estado de Carga (Skeletons) */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                >
                  <div className="h-56 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-full pt-4 border-t border-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estado de Error */}
          {!isLoading && error && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => fetchPropertiesWithFilters(appliedFilters || undefined, true)}
                className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Reintentar conexión
              </button>
            </div>
          )}

          {/* Estado Vacío (Empty State) */}
          {!isLoading && !error && properties.length === 0 && (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isFiltering
                  ? "No se encontraron inmuebles con estos criterios"
                  : "Sé el primero en publicar un alquiler en Oberá"}
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                {isFiltering
                  ? "Prueba eliminando algunos filtros en el buscador para ver un rango más amplio de propiedades."
                  : "Aún no hay propiedades listadas en este momento. Si sos propietario o inmobiliaria, publicá tu inmueble hoy y recibí consultas de inmediato."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {isFiltering ? (
                  <Link
                    href="/"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Ver Todas las Propiedades
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Mi Inmueble</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Grilla de Propiedades Reales */}
          {!isLoading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BENTO GRID: SERVICIOS Y VENTAJAS PARA INMOBILIARIAS Y DUEÑOS              */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Plataforma Integral
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Diseñado para Inmobiliarias y Propietarios de Oberá
            </p>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Un entorno confiable y dinámico con herramientas modernas para comercializar inmuebles en la zona centro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: Filtro y Búsqueda Dinámica */}
            <div className="md:col-span-2 rounded-2xl p-8 bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Búsqueda Multidimensional en Tiempo Real
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                  Encontrá rápidamente por tipo de inmueble (departamentos, casas, locales comerciales o terrenos), dormitorios, presupuesto y barrio.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Filtro por Barrio</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Filtro por Tipo</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Tope de Precio</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Requisitos de Contrato</span>
              </div>
            </div>

            {/* Bento 2: Claridad Contractual */}
            <div className="rounded-2xl p-8 bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Transparencia en Condiciones
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Detalles claros sobre meses de depósito, garantes, recibos de sueldo y plazo contractual desde la primera vista.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Sin costos ocultos ni intermediaciones</span>
              </div>
            </div>

            {/* Bento 3: Gestión Directa Propietarios */}
            <div className="rounded-2xl p-8 bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Subí tu propiedad con fotografías en alta definición y comenzá a recibir interesados calificados en menos de 24 horas.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Publicar Ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento 4: Cobertura de Barrios */}
            <div className="md:col-span-2 rounded-2xl p-8 bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Presencia en los Principales Puntos de Oberá
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                  Encontrá opciones en Barrio Centro, Barrio Schuster, Villa Svea, Villa Stemberg, Loma Porá, Villa Falk, Villa Barreyro y zonas comerciales.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Centro",
                  "Barrio Schuster",
                  "Villa Svea",
                  "Villa Stemberg",
                  "Loma Porá",
                  "Villa Falk",
                  "Villa Barreyro",
                  "Km 8",
                  "Ruta 14",
                ].map((barrio) => (
                  <Link
                    key={barrio}
                    href={`/?neighborhood=${encodeURIComponent(barrio)}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs"
                  >
                    {barrio}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BANNER CTA INFERIOR                                                      */}
      {/* ========================================================================= */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              ¿Tenés un inmueble disponible en Oberá?
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Sumate al portal oficial de clasificados inmobiliarios de la zona centro y conectá con inquilinos verificados.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-xl text-sm shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Comenzar a Publicar</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
          Cargando portal inmobiliario...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
