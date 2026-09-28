import React from "react";
import Link from "next/link";
import { Building2, Heart, ShieldCheck, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Info Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Oberá<span className="text-blue-400">Inmuebles</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Plataforma inmobiliaria de próxima generación para Oberá y la zona centro de Misiones. Conexión directa entre propietarios e inquilinos con alertas automatizadas.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Oberá, Misiones, Argentina</span>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Plataforma
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Buscar Inmuebles
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-400 transition-colors">
                  Planes Propietarios
                </Link>
              </li>
              <li>
                <Link href="/#alertas" className="hover:text-blue-400 transition-colors">
                  Alertas Inquilinos
                </Link>
              </li>
            </ul>
          </div>

          {/* Seguridad y Confianza */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Seguridad
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs">Propietarios verificados y publicaciones moderadas.</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs">contacto@oberainmuebles.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OberáInmuebles SaaS. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para la comunidad de Oberá.
          </p>
        </div>
      </div>
    </footer>
  );
}
