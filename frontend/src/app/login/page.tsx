"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  GraduationCap,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { isAxiosError } from "axios";
import { login, register, getMe } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";

type AuthMode = "login" | "register";
type UserRole = "TENANT" | "OWNER";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("TENANT");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, completa todos los campos requeridos.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "register") {
        // 1. Registro en FastAPI
        const registeredUser = await register(email.trim(), password, role);
        setSuccessMessage("¡Cuenta creada exitosamente! Iniciando sesión...");

        // 2. Login inmediato para obtener el token
        const loginData = await login(email.trim(), password);
        setAuth(loginData.access_token, {
          id: registeredUser.id,
          email: registeredUser.email,
          role: registeredUser.role,
          is_active: registeredUser.is_active,
        });

        // 3. Redirección al inicio
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        // Modo Login
        const loginData = await login(email.trim(), password);
        let userProfile = {
          id: 0,
          email: email.trim(),
          role: "TENANT",
          is_active: true,
        };

        try {
          // Guardar token temporalmente en store para que el interceptor de axios lo envíe
          setAuth(loginData.access_token, userProfile);
          const me = await getMe();
          userProfile = {
            id: me.id,
            email: me.email,
            role: me.role,
            is_active: me.is_active,
          };
          setAuth(loginData.access_token, userProfile);
        } catch (meErr) {
          console.warn("No se pudo obtener información adicional de /me:", meErr);
        }

        setSuccessMessage("Sesión iniciada con éxito. Redirigiendo...");
        setTimeout(() => {
          if (userProfile.role === "OWNER") {
            router.push("/publish");
          } else {
            router.push("/");
          }
        }, 500);
      }
    } catch (err: unknown) {
      console.error("Error de autenticación:", err);
      let detail = "Ocurrió un error al procesar tu solicitud.";

      if (isAxiosError(err)) {
        const status = err.response?.status;
        const responseData = err.response?.data as { detail?: any } | undefined;
        const apiDetail = responseData?.detail;

        if (status === 422) {
          // Extrae el detalle de validación de FastAPI (Pydantic ValidationError)
          if (Array.isArray(apiDetail)) {
            detail = apiDetail
              .map((item: any) => {
                const field = Array.isArray(item.loc)
                  ? item.loc.filter((l: any) => l !== "body").join(".")
                  : "";
                const msg = item.msg || "Valor inválido";
                return field ? `${field}: ${msg}` : msg;
              })
              .join(". ");
          } else if (typeof apiDetail === "string") {
            detail = apiDetail;
          } else if (apiDetail) {
            detail = JSON.stringify(apiDetail);
          } else {
            detail = "Error de validación en los datos enviados (HTTP 422).";
          }
        } else if (status === 400) {
          if (apiDetail === "Incorrect email or password") {
            detail = "Credenciales incorrectas. Verifica tu email y contraseña.";
          } else if (apiDetail === "The user with this email already exists in the system") {
            detail = "Ya existe una cuenta registrada con este correo electrónico.";
          } else if (typeof apiDetail === "string") {
            detail = apiDetail;
          }
        } else if (typeof apiDetail === "string") {
          detail = apiDetail;
        }
      }

      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 bg-slate-50">
      <div className="max-w-md w-full">
        {/* Cabecera / Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              Oberá<span className="text-blue-600">Inmuebles</span>
            </span>
          </Link>
          <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta gratis"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {mode === "login"
              ? "Ingresa para gestionar tus alquileres o alertas de búsqueda"
              : "Conectamos estudiantes, inquilinos y propietarios en Oberá"}
          </p>
        </div>

        {/* Tarjeta de Autenticación */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
          
          {/* Switcher de Modos: Iniciar Sesión / Registrarse */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Alertas de Error o Éxito */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Selector de Rol (Solo visible en modo registro) */}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  ¿Cómo utilizarás la plataforma?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("TENANT")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      role === "TENANT"
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-600 mb-1.5" />
                    <div>
                      <span className="block text-xs font-bold">Inquilino / Estudiante</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Buscar alquileres y alertas
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("OWNER")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      role === "OWNER"
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <KeyRound className="w-5 h-5 text-blue-600 mb-1.5" />
                    <div>
                      <span className="block text-xs font-bold">Propietario / Dueño</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Publicar propiedades
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@estudiantes.unam.edu.ar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "login" ? "Ingresar a mi cuenta" : "Crear mi cuenta"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie de tarjeta con nota informativa para estudiantes */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  ¿No tienes una cuenta aún?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta creada?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Respaldo para estudiantes */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <span>Especialmente adaptado para estudiantes de UNaM y facultades de Oberá</span>
        </div>
      </div>
    </div>
  );
}
