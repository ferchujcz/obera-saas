"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Building2,
  FileText,
  MessageCircle,
  ShieldCheck,
  Star,
  Calendar,
  AlertCircle,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getPropertyById, getProfile, Property, PublicUserProfile } from "@/lib/api";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Number(params?.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<PublicUserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!propertyId || isNaN(propertyId)) {
      setError("ID de propiedad inválido.");
      setIsLoading(false);
      return;
    }

    const loadPropertyAndOwner = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const propData = await getPropertyById(propertyId);
        setProperty(propData);

        // Intentar obtener el perfil público del dueño para mostrar su reputación
        try {
          const ownerData = await getProfile(propData.owner_id);
          setOwner(ownerData);
        } catch (ownerErr) {
          console.warn("No se pudo cargar el perfil del propietario:", ownerErr);
        }
      } catch (err: any) {
        console.error("Error al cargar propiedad:", err);
        setError(
          err.response?.status === 404
            ? "La propiedad que estás buscando no existe o fue retirada."
            : "Error de conexión al cargar los detalles de la propiedad."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPropertyAndOwner();
  }, [propertyId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // URL dinámica de WhatsApp
  const whatsappText = property
    ? encodeURIComponent(
        `Hola! Me interesa la propiedad "${property.title}" que vi en el Portal de Oberá.`
      )
    : "";
  // Número de contacto temporal para la zona de Oberá (Código 3755)
  const whatsappUrl = `https://api.whatsapp.com/send?phone=5493755123456&text=${whatsappText}`;

  // Skeleton de Carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-96 w-full bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-3/4 bg-slate-200 rounded" />
              <div className="h-5 w-1/2 bg-slate-200 rounded" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-72 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error || !property) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Propiedad no encontrada</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "No pudimos cargar esta publicación."}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const currentImageUrl = images[selectedImage]?.image_url || null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Barra superior de navegación y acciones */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la búsqueda</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              title="Compartir enlace"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">¡Enlace copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Compartir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Layout Principal Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Galería y Detalles (2 Columnas) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contenedor de Galería Fotográfica */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm">
              <div className="relative h-[360px] sm:h-[460px] w-full bg-slate-900 overflow-hidden group">
                {currentImageUrl ? (
                  <Image
                    src={currentImageUrl}
                    alt={property.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-3 p-6">
                    <Building2 className="w-16 h-16 text-slate-300" />
                    <span className="text-sm font-medium text-slate-500">
                      Sin fotografía registrada para este inmueble
                    </span>
                  </div>
                )}

                {/* Badges superiores sobre la imagen */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="bg-blue-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                    {property.property_type || "Inmueble"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Disponible
                  </span>
                </div>

                {images.length > 0 && (
                  <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Foto {selectedImage + 1} de {images.length}
                  </span>
                )}
              </div>

              {/* Selector de Miniaturas si hay múltiples fotos */}
              {images.length > 1 && (
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImage === idx
                          ? "border-blue-600 ring-2 ring-blue-500/20 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cabecera del Inmueble y Ubicación */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Publicación Inmobiliaria Oberá</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                  {property.title}
                </h1>

                <p className="flex items-center gap-2 text-sm sm:text-base text-slate-600 mt-3 font-medium">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{property.neighborhood}, Oberá, Misiones</span>
                </p>
              </div>

              {/* Bento Grid de Especificaciones Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Dormitorios
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {property.bedrooms} {property.bedrooms === 1 ? "Habitación" : "Habitaciones"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Tipo
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {property.property_type || "Departamento"}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Garantía
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      Verificado
                    </span>
                  </div>
                </div>
              </div>

              {/* Requisitos de Contrato / Depósito */}
              {property.contract_requirements && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Condiciones y Requisitos de Alquiler</span>
                  </div>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    {property.contract_requirements}
                  </p>
                </div>
              )}

              {/* Descripción Detallada */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h3 className="text-lg font-bold text-slate-900">Descripción del Inmueble</h3>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {property.description || "El propietario no ha adjuntado una descripción adicional."}
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Precio, CTA Gigante WhatsApp y Perfil del Dueño */}
          <div className="space-y-6">
            
            {/* Tarjeta de Contacto y Precio (Sticky) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg lg:sticky lg:top-24 space-y-6">
              
              {/* Precio Mensual */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Precio de Alquiler
                </span>
                <div className="flex items-baseline gap-1 mt-1 text-slate-900">
                  <span className="text-lg font-bold text-slate-500">$</span>
                  <span className="text-4xl font-black tracking-tight text-slate-900">
                    {Number(property.price).toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm font-bold text-slate-500">/ mes</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Valores expresados en pesos argentinos (ARS).
                </p>
              </div>

              {/* ============================================================== */}
              {/* BOTÓN GIGANTE VERDE DE WHATSAPP                                */}
              {/* ============================================================== */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-3 group cursor-pointer transform hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-tight">Consultar por WhatsApp</span>
                  <span className="text-[11px] font-normal text-emerald-100">
                    Contacto directo con el anunciante
                  </span>
                </div>
              </a>

              {/* Garantía de Seguridad */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Trato directo sin comisiones abusivas. Verificá siempre el inmueble antes de señar.
                </span>
              </div>

              {/* ============================================================== */}
              {/* TARJETA DE REPUTACIÓN Y PERFIL PÚBLICO DEL DUEÑO               */}
              {/* ============================================================== */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Anunciante
                </span>

                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {owner?.email || "Propietario"}
                      </div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 mt-0.5">
                        {owner?.role || "OWNER"}
                      </span>
                    </div>

                    {/* Estrellitas del promedio de reputación */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-black text-slate-900">
                          {owner?.rating_average !== undefined ? owner.rating_average.toFixed(1) : "5.0"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        ({owner?.reviews_count || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Enlace al Perfil Público */}
                  <Link
                    href={`/profile/${property.owner_id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <span>Ver perfil público y reseñas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
