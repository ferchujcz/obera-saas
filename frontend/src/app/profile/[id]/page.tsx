"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Building2,
  ShieldCheck,
  UserCheck,
  Calendar,
  MessageSquare,
  AlertCircle,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  getProfile,
  createReview,
  PublicUserProfile,
  PublicReviewItem,
} from "@/lib/api";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Componente para renderizar estrellitas de calificación visual
 */
function StarRatingDisplay({
  rating,
  size = "md",
  showNumber = false,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;
          return (
            <Star
              key={star}
              className={`${sizeClasses[size]} transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : half
                  ? "fill-amber-300/60 text-amber-400"
                  : "text-slate-200 fill-slate-100"
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="font-extrabold text-slate-900 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);
  const { isAuthenticated, user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el modal/formulario de dejar review
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const fetchProfile = async () => {
    if (!userId || isNaN(userId)) {
      setError("Identificador de usuario inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      console.error("Error al obtener perfil público:", err);
      setError(
        err.response?.status === 404
          ? "El perfil que buscas no existe o no se encuentra disponible."
          : "Ocurrió un error al cargar el perfil. Reintenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (currentUser?.id === userId) {
      setReviewError("No puedes calificarte a ti mismo.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      await createReview({
        reviewed_id: userId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      setReviewSuccess(true);
      setReviewComment("");
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
      }, 1500);

      // Recargar perfil para mostrar la nueva reseña y el nuevo promedio
      await fetchProfile();
    } catch (err: any) {
      console.error("Error al publicar review:", err);
      setReviewError(
        err.response?.data?.detail || "No se pudo registrar la calificación."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Formato amigable de fecha
  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      })
    : "";

  // Estado de Carga (Skeleton)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-36 bg-slate-200 rounded-lg" />
          <div className="h-64 w-full bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-96 bg-slate-200 rounded-3xl" />
            <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error || !profile) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Perfil no encontrado</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "No se encontró información para este usuario."}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navegación hacia atrás */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TARJETA SUPERIOR ESTILO GLASSMORPHISM                                      */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/70 p-6 sm:p-10 shadow-xl backdrop-blur-xl">
          
          {/* Elementos Decorativos de Fondo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Información del Usuario / Dueño */}
            <div className="flex items-center gap-5">
              {/* Avatar con Inicial */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-blue-500/20 border-2 border-white shrink-0">
                {profile.email.charAt(0).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Usuario Verificado">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </span>
              </div>

              {/* Datos Básicos */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.email}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" />
                    {profile.role === "OWNER" ? "Propietario / Inmobiliaria" : "Inquilino"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Miembro desde {formattedDate || "recientemente"}</span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Puntaje Promedio y Acción */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/60 gap-3">
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {profile.rating_average > 0 ? profile.rating_average.toFixed(1) : "Nuevo"}
                  </span>
                  <div className="flex flex-col items-start">
                    <StarRatingDisplay rating={profile.rating_average} size="md" />
                    <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {profile.reviews_count} {profile.reviews_count === 1 ? "opinión" : "opiniones de la comunidad"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para calificar */}
              {isAuthenticated && currentUser?.id !== profile.id && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Calificar a este usuario</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN PRINCIPAL: RESEÑAS Y CATÁLOGO DE PROPIEDADES                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: ÚLTIMAS RESEÑAS                             */}
          {/* ============================================================== */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Últimas Reseñas
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  ({profile.reviews.length})
                </span>
              </div>

              {/* Lista de Reseñas Recibidas */}
              {profile.reviews.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Aún sin calificaciones
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Este usuario aún no ha recibido reseñas de la comunidad de Oberá.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <StarRatingDisplay rating={rev.rating} size="sm" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rev.created_at).toLocaleDateString("es-AR")}
                        </span>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/50">
                        <span className="font-semibold text-slate-600">
                          {rev.reviewer_email || "Usuario de Oberá"}
                        </span>
                        <span className="text-[10px]">Opinión verificada</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: GRILLA DE PROPIEDADES DISPONIBLES             */}
          {/* ============================================================== */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Inmuebles Disponibles</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Propiedades activas publicadas por este anunciante en Oberá.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {profile.properties.length} {profile.properties.length === 1 ? "publicación" : "publicaciones"}
              </span>
            </div>

            {/* Listado de Tarjetas */}
            {profile.properties.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Sin inmuebles activos
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Este anunciante no tiene propiedades con estado disponible en este momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL PARA DEJAR RESEÑA (OPINIÓN Y ESTRELLAS)                              */}
      {/* ========================================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Calificar a {profile.email}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tu reseña ayuda a toda la comunidad de Oberá a tomar decisiones más seguras.
            </p>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">¡Muchas gracias!</h4>
                <p className="text-xs text-emerald-700">Tu calificación ha sido publicada con éxito.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                {reviewError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
                    {reviewError}
                  </div>
                )}

                {/* Selector de Estrellas Interactivo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tu Puntuación
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title={`${star} estrellas`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            reviewRating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-100"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-slate-700 ml-2">
                      {reviewRating} de 5
                    </span>
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Comentario u Observación
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Contá tu experiencia sobre la atención, el cumplimiento, el estado del inmueble..."
                    className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingReview ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publicar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
