"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Home,
  BedDouble,
  MapPin,
  DollarSign,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyFilters } from "@/lib/api";

interface SearchBarProps {
  onSearch?: (filters: PropertyFilters) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados independientes para cada filtro dinámico
  const [type, setType] = useState<string>(
    searchParams?.get("type") || searchParams?.get("property_type") || "all"
  );
  const [bedrooms, setBedrooms] = useState<string>(
    searchParams?.get("bedrooms") || searchParams?.get("min_bedrooms") || "all"
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    searchParams?.get("max_price") || searchParams?.get("maxPrice") || ""
  );
  const [neighborhood, setNeighborhood] = useState<string>(
    searchParams?.get("neighborhood") || ""
  );

  // Sincronizar estados si los query params de la URL cambian
  useEffect(() => {
    if (searchParams) {
      setType(searchParams.get("type") || searchParams.get("property_type") || "all");
      setBedrooms(searchParams.get("bedrooms") || searchParams.get("min_bedrooms") || "all");
      setMaxPrice(searchParams.get("max_price") || searchParams.get("maxPrice") || "");
      setNeighborhood(searchParams.get("neighborhood") || "");
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    const activeFilters: PropertyFilters = {};

    // 1. Tipo de propiedad
    if (type && type !== "all") {
      params.set("type", type);
      activeFilters.type = type;
      activeFilters.property_type = type;
    }

    // 2. Dormitorios
    if (bedrooms && bedrooms !== "all") {
      params.set("bedrooms", bedrooms);
      activeFilters.bedrooms = bedrooms;
      activeFilters.min_bedrooms = Number(bedrooms);
    }

    // 3. Precio Máximo
    if (maxPrice.trim() && Number(maxPrice) > 0) {
      params.set("max_price", maxPrice.trim());
      activeFilters.max_price = Number(maxPrice.trim());
      activeFilters.maxPrice = Number(maxPrice.trim());
    }

    // 4. Barrio / Localidad
    if (neighborhood.trim()) {
      params.set("neighborhood", neighborhood.trim());
      activeFilters.neighborhood = neighborhood.trim();
    }

    // Actualiza la URL para navegación y filtros bookmarkables
    const queryString = params.toString();
    const targetUrl = queryString ? `/?${queryString}` : "/";
    router.push(targetUrl, { scroll: false });

    // Notifica al componente padre para actualización en tiempo real
    if (onSearch) {
      onSearch(activeFilters);
    }
  };

  const handleReset = () => {
    setType("all");
    setBedrooms("all");
    setMaxPrice("");
    setNeighborhood("");
    router.push("/", { scroll: false });
    if (onSearch) {
      onSearch({});
    }
  };

  const hasActiveFilters =
    (type && type !== "all") ||
    (bedrooms && bedrooms !== "all") ||
    Boolean(maxPrice.trim()) ||
    Boolean(neighborhood.trim());

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-2xl p-3 md:p-4 max-w-5xl w-full mx-auto border border-slate-200/90 text-slate-800 transition-all ${className}`}
    >
      {/* Grilla flexible y responsiva de campos de búsqueda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* 1. Selector de Tipo de Propiedad */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Home className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                Tipo
              </span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer appearance-none pr-5 truncate"
                aria-label="Tipo de inmueble"
              >
                <option value="all">Todos los tipos</option>
                <option value="Departamento">Departamento</option>
                <option value="Casa">Casa</option>
                <option value="Monoambiente">Monoambiente</option>
                <option value="Local">Local Comercial</option>
                <option value="Duplex">Dúplex</option>
                <option value="Terreno">Terreno / Lote</option>
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3" />
          </div>
        </div>

        {/* 2. Selector de Dormitorios */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <BedDouble className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                Dormitorios
              </span>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer appearance-none pr-5 truncate"
                aria-label="Cantidad de dormitorios"
              >
                <option value="all">Cualquier cant.</option>
                <option value="1">1 o más</option>
                <option value="2">2 o más</option>
                <option value="3">3 o más</option>
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3" />
          </div>
        </div>

        {/* 3. Input de Precio Máximo */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                Precio Máximo
              </span>
              <input
                type="number"
                min="0"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none truncate"
                aria-label="Precio máximo mensual"
              />
            </div>
          </div>
        </div>

        {/* 4. Input de Barrio / Localidad */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                Barrio o Zona
              </span>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ej: Centro, Schuster..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none truncate"
                aria-label="Barrio o zona en Oberá"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acciones: Botón de Búsqueda y Limpiar Filtros */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {hasActiveFilters ? (
            <span className="font-medium text-blue-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Filtros activos aplicados
            </span>
          ) : (
            <span>Filtrá por un campo aislado o combiná varios según tus criterios.</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}

          <button
            type="submit"
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-7 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-150 text-sm shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Search className="w-4 h-4 text-white" />
            <span>Buscar Propiedades</span>
          </button>
        </div>
      </div>
    </form>
  );
}
