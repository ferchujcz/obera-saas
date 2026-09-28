"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Building2, FileText, Home } from "lucide-react";
import { Property } from "@/lib/api";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const firstImage =
    property.images && property.images.length > 0
      ? property.images[0].image_url
      : null;

  return (
    <Link href={`/property/${property.id}`} className="block h-full group focus:outline-none">
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/90 transition-all duration-200 flex flex-col h-full">
      {/* Contenedor de Imagen o Placeholder */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2 p-4">
            <Building2 className="w-10 h-10 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-400">
              Sin fotografía disponible
            </span>
          </div>
        )}

        {/* Gradiente sutil para contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Tipo de Inmueble */}
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-md uppercase tracking-wide">
          {property.property_type || "Inmueble"}
        </span>

        {/* Badge de Disponibilidad */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Disponible
        </span>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Precio Destacado */}
          <div className="flex items-baseline gap-1 text-slate-900 mb-1.5">
            <span className="text-xs font-bold text-slate-500">$</span>
            <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {Number(property.price).toLocaleString("es-AR")}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ mes</span>
          </div>

          {/* Título de la Propiedad */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>

          {/* Barrio / Localidad */}
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{property.neighborhood}, Oberá</span>
          </p>

          {/* Requisitos de Contrato / Depósito */}
          {property.contract_requirements && (
            <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-tight">
                <strong>Requisitos:</strong> {property.contract_requirements}
              </span>
            </div>
          )}
        </div>

        {/* Fila de Características (Dormitorios y Verificación) */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-slate-400" />
            <span>
              {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "Dormitorio" : "Dormitorios"}
            </span>
          </span>

          <span className="text-slate-400 text-[11px]">
            Publicación Verificada
          </span>
        </div>
      </div>
    </article>
  </Link>
  );
}
