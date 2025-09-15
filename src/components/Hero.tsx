import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const Hero = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Recargar iframe con el parámetro mute correcto
    const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      const newSrc = !isMuted 
        ? currentSrc.replace(/mute=\d/, 'mute=1')
        : currentSrc.replace(/mute=\d/, 'mute=0');
      iframe.src = newSrc;
    }
  };

  return (
    <>
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
        {/* Audio Control Button */}
        <div className="absolute top-6 right-6 z-20">
          {/* Hand-drawn arrow pointing to button */}
          <div className="absolute bottom-0 -left-16 text-white opacity-90">
            <img 
              src="/white-arrow.png" 
              alt="Flecha apuntando al botón de sonido" 
              className="w-16 h-12 drop-shadow-lg"
            />
          </div>
          
          <div className="group relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#832B99] to-[#59275A] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
            
            {/* Button container */}
            <div className="relative bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-1 shadow-2xl">
              {/* Button */}
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
        </div>

        {/* Video Background */}
        <div className="absolute inset-0 z-0">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/jlhJjJ6Qiuo?autoplay=1&mute=1&loop=1&playlist=jlhJjJ6Qiuo&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0&enablejsapi=1&origin=https://fiscales-landing.vercel.app&vq=hd1080"
          title="Video de fondo"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.4)',
            width: '177.77777778vh',
            height: '56.25vw',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: 'none',
            maxHeight: 'none',
          }}
        />
        <div className={`absolute inset-0 transition-all duration-1000 ease-out ${
          showContent ? 'bg-black/40' : 'bg-black/5'
        }`}></div>
      </div>

      {/* Minimal Content */}
      <div className={`relative z-10 text-center text-white px-4 max-w-2xl mx-auto transition-all duration-1000 ease-out ${
        showContent 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <h1 className={`text-4xl md:text-6xl font-bold mb-6 transition-all duration-1000 delay-300 ease-out ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
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
        
        <p className={`text-lg md:text-xl mb-8 transition-all duration-1000 delay-400 ease-out ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
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
          className={`text-xl px-12 py-4 transition-opacity transition-transform duration-1000 delay-500 ease-out hover:scale-105 hover:transition-transform hover:duration-400 hover:delay-0 transition-transform duration-400 delay-0 ${
            showContent 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
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
