import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oberá Inmuebles | Portal Inmobiliario de Oberá",
  description:
    "Encontrá casas, departamentos y alquileres en Oberá, Misiones. Alertas inmediatas y contacto directo con propietarios e inmobiliarias.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className={`${montserrat.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
