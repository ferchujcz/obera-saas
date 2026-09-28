"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Radio,
  MapPin,
  DollarSign,
  BedDouble,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowLeft,
  Trash2,
  Zap,
  Target,
  Send,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createAlert, getAlertsMe, getMe, Alert, CreateAlertData } from "@/lib/api";

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
  "Cualquiera / Toda la ciudad",
];

export default function TenantAlertsPage() {
  const router = useRouter();
  const { user, isAuthenticated, token, setUser } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  // Formulario de nueva alerta
  const [neighborhood, setNeighborhood] = useState("Centro");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // 1. Verificación de permisos para rol TENANT
  useEffect(() => {
    let mounted = true;

    const verifyTenantAccess = async () => {
      const storedToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (!storedToken) {
        router.replace("/login");
        return;
      }

      if (!user || !user.role) {
        try {
          const freshUser = await getMe();
          if (mounted) {
            setUser(freshUser);
            if (freshUser.role !== "TENANT" && freshUser.role !== "ADMIN") {
              router.replace("/");
              return;
            }
          }
        } catch (err) {
          console.error("Error al verificar sesión de inquilino:", err);
          router.replace("/login");
          return;
        }
      } else if (user.role !== "TENANT" && user.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      if (mounted) {
        setIsCheckingAuth(false);
      }
    };

    verifyTenantAccess();

    return () => {
      mounted = false;
    };
  }, [user, token, router, setUser]);

  // 2. Cargar alertas del inquilino
  const fetchMyAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const data = await getAlertsMe();
      setAlerts(data);
    } catch (err) {
      console.error("Error al cargar alertas del usuario:", err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchMyAlerts();
    }
  }, [isCheckingAuth]);

  // 3. Crear Alerta
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);
    setSuccessToast(null);

    const parsedPrice = parseFloat(maxPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorToast("Por favor ingresa un presupuesto máximo mensual válido.");
      return;
    }

    setIsSubmitting(true);

    const alertData: CreateAlertData = {
      neighborhood,
      max_price: parsedPrice,
      min_bedrooms: Number(minBedrooms),
      is_active: true,
    };

    try {
      const newAlert = await createAlert(alertData);
      setSuccessToast(
        `¡Radar activado para ${neighborhood}! El motor de matching te avisará ante nuevos ingresos.`
      );
      setMaxPrice("");
      setMinBedrooms(1);
      await fetchMyAlerts();

      setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
    } catch (err: any) {
      console.error("Error al crear alerta:", err);
      const detail = err.response?.data?.detail;
      setErrorToast(
        typeof detail === "string"
          ? detail
          : "No se pudo activar la alerta. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sintonizando Radar de Inquilino...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Luces y Efectos de Fondo Radar */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Cabecera Tipo Centro de Control / Radar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al portal</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Radar de Alquileres Oberá</span>
              </h1>
            </div>

            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Configura tus preferencias. Nuestro algoritmo escanea publicaciones en tiempo real y te notifica apenas un propietario liste un inmueble que coincida con tu criterio.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-inner">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Estado del Radar
                </span>
                <span className="text-xs font-black text-emerald-400">
                  Vigilancia Activa 24/7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones Flotantes / Feedback Visual */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-start gap-3 backdrop-blur-xl shadow-xl shadow-emerald-950/50 animate-in fade-in slide-in-from-top-3 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">¡Radar de Búsqueda Configurado!</h4>
              <p className="text-xs mt-0.5 text-emerald-300">{successToast}</p>
            </div>
          </div>
        )}

        {errorToast && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 flex items-start gap-3 backdrop-blur-xl shadow-xl shadow-red-950/50 animate-in fade-in slide-in-from-top-3 duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">No se pudo activar la alerta</h4>
              <p className="text-xs mt-0.5 text-red-300">{errorToast}</p>
            </div>
          </div>
        )}

        {/* Layout Bento Grid Dividido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================== */}
          {/* SECCIÓN 1: FORMULARIO CREAR ALERTA (COLUMNA 5 DE 12)          */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            
            {/* Gradiente sutil interno */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-6">
              <Target className="w-4 h-4" />
              <span>Programar Nuevo Objetivo</span>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-5">
              
              {/* Barrio Deseado */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Barrio o Zona en Oberá
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-white/[0.06] text-sm text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                  >
                    {OBERA_NEIGHBORHOODS.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Presupuesto Máximo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Presupuesto Máximo Mensual (ARS)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1000}
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="150000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/15 bg-white/[0.06] text-sm text-white font-bold placeholder:text-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Solo recibirás alertas por debajo o igual a este monto.
                </span>
              </div>

              {/* Habitaciones Mínimas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Habitaciones Mínimas
                </label>
                <div className="relative">
                  <BedDouble className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-white/[0.06] text-sm text-white font-medium focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Botón de Activación con Animación Radar */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sintonizando alerta...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Activar Radar de Alerta</span>
                    </>
                  )}
                </button>
              </div>

              {/* Nota Informativa */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  El sistema cruzará automáticamente los datos de cada nueva propiedad que los dueños publiquen en Oberá.
                </span>
              </div>

            </form>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 2: LISTA DE ALERTAS ACTIVAS (COLUMNA 7 DE 12)          */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <span>Radares Activos en tu Cuenta</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Parámetros bajo escucha activa en la red de Oberá.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {alerts.length} {alerts.length === 1 ? "alerta activa" : "alertas activas"}
              </span>
            </div>

            {/* Listado de Alertas */}
            {isLoadingAlerts ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-32 rounded-3xl bg-white/[0.04] border border-white/10 animate-pulse p-6"
                  />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-3xl bg-white/[0.03] border border-dashed border-white/15">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] text-slate-400 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Aún no tienes radares configurados
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
                  Define tu presupuesto y barrio deseado en el panel izquierdo para que el portal comience a rastrear alquileres automáticamente para vos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white/[0.05] border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          Escuchando Inmuebles
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {new Date(al.created_at).toLocaleDateString("es-AR")}
                        </span>
                      </div>

                      <div className="text-lg font-black text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{al.neighborhood}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                        <span className="flex items-center gap-1 bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hasta ${Number(al.max_price).toLocaleString("es-AR")}/mes</span>
                        </span>

                        <span className="flex items-center gap-1 bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/5">
                          <BedDouble className="w-3.5 h-3.5 text-blue-400" />
                          <span>Mínimo {al.min_bedrooms} dorm.</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 shrink-0">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                        Activo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        ID Alerta #{al.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
