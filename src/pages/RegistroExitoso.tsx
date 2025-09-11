import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RegistroExitoso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nombre = searchParams.get('nombre') || 'Fiscal';

  const handleVolverInicio = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F1E6FF] via-[#EFE2FF] to-[#EBDBFF]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#832B99] via-[#631577] to-[#440055] text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <a 
            href="/" 
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/white-logo.png" alt="La Libertad Avanza" className="h-8" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="p-8 md:p-12 border-2 border-primary/20 rounded-3xl bg-card shadow-lg">
          {/* Contenido Principal */}
          <div className="text-center mb-6 md:mb-12">
            <div className="flex justify-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡BIENVENIDO, {nombre.toUpperCase()}!
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-600 mb-6">
              ¡GRACIAS POR SUMARTE A LA LEGIÓN DE DIEZ MIL HÉROES!
            </h2>
          </div>

          {/* Mensaje Principal e Inspirador */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
            <div className="text-center space-y-8">
              {/* Mensaje Principal */}
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                En los próximos días nos contactaremos para confirmarte los detalles de la fiscalización y futuras capacitaciones para fiscales de La Libertad Avanza.
                </p>
              </div>
              
              {/* Mensaje Final */}
              <div className="space-y-4 pt-6 border-t border-gray-300">
            <p className="text-xl font-bold text-[#6B237D]">
              ¡VIVA LA LIBERTAD, CARAJO!
            </p>
              </div>


            </div>
          </div>

          {/* Botón de Acción */}
          <div className="text-center">
            <Button 
              onClick={handleVolverInicio}
              className="bg-gradient-to-b from-[#832B99] via-[#7A2A8A] via-[#6F297A] via-[#64286A] to-[#59275A] hover:from-[#7A2A8A] hover:to-[#64286A] text-white font-bold px-12 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              VOLVER AL INICIO
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-[#371859] text-primary-foreground py-6 mt-1.5 mb-5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <div className="flex flex-col items-center space-y-2 pb-2">
            <p className="text-sm font-medium mb-1">Seguinos</p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/groups/301617434913309" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/lalibertadavanzacbacapital/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://x.com/LLA_Cba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
          <p className="text-sm opacity-80">
            <span className="block md:inline">© 2025 La Libertad Avanza Córdoba.</span>
            <span className="block md:inline md:ml-1">Todos los derechos reservados.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
