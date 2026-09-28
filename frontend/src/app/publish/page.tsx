"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  MapPin,
  BedDouble,
  DollarSign,
  FileText,
  ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  createProperty,
  getMe,
  startTrialSubscription,
  CreatePropertyData,
} from "@/lib/api";

const OBERA_NEIGHBORHOODS = [
  "Centro",
  "Barrio Schuster",
  "Villa Svea",
  "Villa Stemberg",
  "Loma Porá",
  "Villa Falk",
  "Villa Barreyro",
  "Km 8",
  "Ruta 14",
  "Barrio Krause",
  "Cien Hectáreas",
  "Barrio Norte",
  "Otro",
];

const PROPERTY_TYPES = [
  "Departamento",
  "Casa",
  "Monoambiente",
  "Local Comercial",
  "Dúplex",
  "Quinta / Cabaña",
  "Oficina",
];

export default function PublishPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, token, setUser } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Departamento");
  const [neighborhood, setNeighborhood] = useState("Centro");
  const [customNeighborhood, setCustomNeighborhood] = useState("");
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [price, setPrice] = useState<string>("");
  const [contractRequirements, setContractRequirements] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Protección de ruta para rol OWNER
  useEffect(() => {
    let mounted = true;

    const verifyOwnerAccess = async () => {
      const storedToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (!storedToken) {
        router.replace("/login");
        return;
      }

      // Si no tenemos el usuario en el store o no es OWNER, consultar /me
      if (!user || !user.role) {
        try {
          const freshUser = await getMe();
          if (mounted) {
            setUser(freshUser);
            if (freshUser.role !== "OWNER" && freshUser.role !== "ADMIN") {
              router.replace("/");
              return;
            }
          }
        } catch (err) {
          console.error("Error al validar sesión de propietario:", err);
          router.replace("/login");
          return;
        }
      } else if (user.role !== "OWNER" && user.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      if (mounted) {
        setIsCheckingAuth(false);
      }
    };

    verifyOwnerAccess();

    return () => {
      mounted = false;
    };
  }, [user, token, router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const selectedNeighborhood =
      neighborhood === "Otro" ? customNeighborhood.trim() : neighborhood;

    if (!title.trim()) {
      setErrorMessage("Por favor ingresa un título descriptivo.");
      return;
    }

    if (!selectedNeighborhood) {
      setErrorMessage("Por favor selecciona o especifica el barrio en Oberá.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Por favor ingresa un precio mensual válido.");
      return;
    }

    setIsSubmitting(true);

    const propertyPayload: CreatePropertyData = {
      title: title.trim(),
      description: description.trim() || null,
      property_type: propertyType,
      neighborhood: selectedNeighborhood,
      bedrooms: Number(bedrooms),
      price: parsedPrice,
      contract_requirements: contractRequirements.trim() || null,
      status: "AVAILABLE",
    };

    try {
      const createdProp = await createProperty(propertyPayload, imageUrl.trim() || undefined);

      setSuccessMessage("¡Propiedad publicada con éxito! Redirigiendo a la vista pública...");

      setTimeout(() => {
        router.push(`/property/${createdProp.id}`);
      }, 1200);
    } catch (err: any) {
      console.error("Error al crear propiedad:", err);

      // Si el error es por falta de suscripción activa, intentar activar el trial automáticamente
      const errorDetail = err.response?.data?.detail;
      if (
        err.response?.status === 403 &&
        typeof errorDetail === "string" &&
        errorDetail.includes("subscription")
      ) {
        try {
          await startTrialSubscription();
          // Reintentar creación de la propiedad
          const createdProp = await createProperty(propertyPayload, imageUrl.trim() || undefined);
          setSuccessMessage(
            "¡Activamos tus 30 días de prueba gratuita y publicamos tu inmueble con éxito!"
          );
          setTimeout(() => {
            router.push(`/property/${createdProp.id}`);
          }, 1200);
          return;
        } catch (subErr: any) {
          console.error("Error al activar suscripción de prueba:", subErr);
          setErrorMessage(
            "Para publicar propiedades se requiere una suscripción activa o período de prueba."
          );
        }
      } else {
        setErrorMessage(
          typeof errorDetail === "string"
            ? errorDetail
            : "No se pudo registrar la publicación. Revisa los datos ingresados."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verificando permisos de propietario...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera y Navegación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600 shrink-0" />
              <span>Publicar Nuevo Alquiler</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Completa la información de tu inmueble para publicarlo en la red inmobiliaria de Oberá.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cuenta Propietario Verificada</span>
          </div>
        </div>

        {/* Notificaciones de Feedback Visual */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold">Error en la publicación</h4>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold">¡Publicación Exitosa!</h4>
              <p className="text-xs mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Formulario Estilo Tarjeta Grande Glassmorphism & Bento Grid */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-8">
            
            {/* Sección 1: Título y Descripción */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Sparkles className="w-4 h-4" />
                <span>Información Principal</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Título de la Publicación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Departamento 2 ambientes luminoso en zona Centro"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la distribución, iluminación, cercanía a facultades (UNaM), paradas de colectivos, expensas..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Sección 2: Especificaciones y Ubicación (Bento Grid) */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Building2 className="w-4 h-4" />
                <span>Características del Inmueble</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Tipo de Inmueble */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tipo de Inmueble
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Barrio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Barrio en Oberá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    >
                      {OBERA_NEIGHBORHOODS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Habitaciones / Dormitorios */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Habitaciones
                  </label>
                  <div className="relative">
                    <BedDouble className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      max={20}
                      required
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

              </div>

              {/* Barrio personalizado si elige 'Otro' */}
              {neighborhood === "Otro" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Especificar Nombre del Barrio / Zona
                  </label>
                  <input
                    type="text"
                    required
                    value={customNeighborhood}
                    onChange={(e) => setCustomNeighborhood(e.target.value)}
                    placeholder="Ej: Barrio Copisa, Tres Esquinas, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Sección 3: Precio y Requisitos del Contrato */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <FileText className="w-4 h-4" />
                <span>Condiciones Comerciales y Contrato</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Precio Mensual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Precio Mensual (ARS) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={1}
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="180000"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Precio final por mes (no incluye expensas o servicios a convenir).
                  </span>
                </div>

                {/* Requisitos de Contrato */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Requisitos del Contrato
                  </label>
                  <input
                    type="text"
                    value={contractRequirements}
                    onChange={(e) => setContractRequirements(e.target.value)}
                    placeholder="Ej: Mes de adelanto, garantía propietaria o recibo de sueldo"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Aclaraciones sobre depósitos, garantes o condiciones de ingreso.
                  </span>
                </div>

              </div>
            </div>

            {/* Sección 4: Imagen de la Propiedad (Campo Temporal con Vista Previa) */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <ImageIcon className="w-4 h-4" />
                <span>Fotografía de la Propiedad</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  URL de la Fotografía (Temporal)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreviewError(false);
                  }}
                  placeholder="https://images.unsplash.com/... o enlace directo a imagen"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pega un enlace web directo a la fotografía del inmueble.
                </span>
              </div>

              {/* Vista Previa de la Imagen */}
              {imageUrl && !imagePreviewError && (
                <div className="mt-3 relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <Image
                    src={imageUrl}
                    alt="Vista previa del inmueble"
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    Vista previa de imagen
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Botón de Envío */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publicando Inmueble...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Ahora</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
