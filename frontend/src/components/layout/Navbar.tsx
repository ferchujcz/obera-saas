"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Bell, PlusCircle, LogIn, LogOut, User, Menu, X, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo y Nombre */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Oberá<span className="text-blue-400">Inmuebles</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MVP
                </span>
              </span>
              <span className="text-[11px] text-slate-400">Matching & Alertas Inteligentes</span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Explorar
            </Link>
            <Link
              href="/#alertas"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              Alertas Activas
            </Link>
            <Link
              href="/#como-funciona"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cómo Funciona
            </Link>
          </nav>

          {/* Botones de Acción Derecha */}
          <div className="hidden md:flex items-center gap-3">
            {isMounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-300">{user?.email || "Usuario"}</span>
                  {user?.role && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {user.role}
                    </span>
                  )}
                </div>

                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                    Mi Panel
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Salir
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                    Iniciar Sesión
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle className="w-4 h-4" />}
                  >
                    Publicar Propiedad
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Botón Menú Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2"
            >
              Explorar Propiedades
            </Link>
            <Link
              href="/#alertas"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-blue-400" />
              Alertas Activas
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2"
            >
              Cómo Funciona
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            {isMounted && isAuthenticated ? (
              <>
                <div className="text-xs text-slate-400 pb-1">
                  Conectado como: <span className="text-white font-medium">{user?.email}</span>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Mi Panel
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-red-400"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Publicar Propiedad
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
