import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
// import { Volume2, VolumeX } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

const Hero = () => {
  // const [isMuted, setIsMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Imágenes del carrusel en orden
  const carouselImages = [
    '/Carrusel/1.jpeg',
    '/Carrusel/2.jpeg',
    '/Carrusel/3.jpeg',
    '/Carrusel/4.jpeg',
    '/Carrusel/5.jpeg',
    '/Carrusel/6.jpeg',
    '/Carrusel/7.jpeg',
    '/Carrusel/9.jpg',
    '/Carrusel/10.webp'
  ];

  useEffect(() => {
    // Mostrar el contenido inmediatamente al cargar
    setShowContent(true);
  }, []);

  // const toggleMute = () => {
  //   setIsMuted(!isMuted);
  //   // Recargar iframe con el parámetro mute correcto
  //   const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
  //   if (iframe) {
  //     const currentSrc = iframe.src;
  //     const newSrc = !isMuted 
  //       ? currentSrc.replace(/mute=\d/, 'mute=1')
  //       : currentSrc.replace(/mute=\d/, 'mute=0');
  //     iframe.src = newSrc;
  //   }
  // };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
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

            {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Audio Control Button - COMENTADO */}
        {/* <div className="absolute top-6 right-6 z-20">
          <div className="absolute bottom-0 -left-16 text-white opacity-90">
            <img 
              src="/white-arrow.png" 
              alt="Flecha apuntando al botón de sonido" 
              className="w-16 h-12 drop-shadow-lg"
            />
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#832B99] to-[#59275A] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
            
            <div className="relative bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-1 shadow-2xl">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="relative bg-gradient-to-r from-[#832B99] to-[#59275A] hover:from-[#832B99]/90 hover:to-[#59275A]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl w-20 h-24 p-0 flex flex-col items-center justify-center space-y-2 group"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:text-gray-300" />
                    <div className="text-center">
                      <div className="text-xs font-bold leading-tight transition-all duration-300 group-hover:text-gray-300 group-hover:drop-shadow-lg">Activar</div>
                      <div className="text-xs font-bold leading-tight transition-all duration-300 group-hover:text-gray-300 group-hover:drop-shadow-lg">Sonido</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:text-gray-300" />
                    <div className="text-center">
                      <div className="text-xs font-bold leading-tight transition-all duration-300 group-hover:text-gray-300 group-hover:drop-shadow-lg">Silenciar</div>
                      <div className="text-xs font-bold leading-tight transition-all duration-300 group-hover:text-gray-300 group-hover:drop-shadow-lg">Sonido</div>
                    </div>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div> */}

        {/* Image Carousel Background */}
        <div className="absolute inset-0 z-0">
          <ImageCarousel 
            images={carouselImages}
            autoPlayInterval={4000}
            className="w-full h-full"
            imagePositions={{
              4: '60%', // Imagen 5 (índice 4) posicionada más arriba
              5: '60%', // Imagen 6 (índice 5) posicionada más arriba
              8: '60%'  // Imagen 10 (índice 8) posicionada más arriba para ver mejor la cabeza
            }}
            mobileImagePositions={{
              1: { left: '0%' }, // Imagen 2 (índice 1) más hacia la izquierda en mobile
              2: { left: '100%' }, // Imagen 3 (índice 2) más hacia la derecha en mobile
              5: { left: '0%' }, // Imagen 6 (índice 5) más hacia la izquierda en mobile
              6: { left: '100%' }, // Imagen 7 (índice 6) más hacia la derecha en mobile
              8: { left: '0%' }  // Imagen 9 (índice 8) más hacia la izquierda en mobile
            }}
          />
          <div className={`absolute inset-0 transition-all duration-1000 ease-out ${
            showContent ? 'bg-black/40' : 'bg-black/5'
          }`}></div>
        </div>

      {/* Minimal Content */}
      <div className={`relative z-10 text-center text-white px-4 max-w-2xl mx-auto transition-all duration-800 ease-out ${
        showContent 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <h1 className={`text-4xl md:text-6xl font-bold mb-6 transition-all duration-800 delay-100 ease-out ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`} style={{
          animation: showContent ? 'fadeInUp 0.8s ease-out 0.1s both' : 'none'
        }}>
          <span className="block md:hidden">
            SUMATE
          </span>
          <span className="block md:hidden">
            A LA LEGIÓN DE
          </span>
          <span className="block md:hidden text-yellow-400">
            DIEZ MIL HÉROES
          </span>
          <span className="hidden md:block">
            SUMATE A LA LEGIÓN DE
          </span>
          <span className="hidden md:block text-yellow-400">
            DIEZ MIL HÉROES
          </span>
        </h1>
        
        <p className={`text-lg md:text-xl mb-8 transition-all duration-800 delay-200 ease-out ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`} style={{
          animation: showContent ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}>
          <span className="block md:hidden">
            Registrate como fiscal de
          </span>
          <span className="block md:hidden">
            La Libertad Avanza.
          </span>
          <span className="hidden md:block">
            Registrate como fiscal de La Libertad Avanza.
          </span>
        </p>
        
        <Button 
          variant="hero" 
          size="lg" 
          className={`text-xl px-12 py-4 transition-all duration-800 delay-300 ease-out hover:scale-105 hover:transition-transform hover:duration-400 hover:delay-0 ${
            showContent 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            animation: showContent ? 'fadeInUp 0.8s ease-out 0.3s both' : 'none'
          }}
          onClick={() => {
            const formSection = document.getElementById('registration-form');
            if (formSection) {
              formSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Sumate a fiscalizar
        </Button>
      </div>
      </section>
    </>
  );
};

export default Hero;
