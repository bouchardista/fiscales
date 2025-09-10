import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Hls from 'hls.js';

const Hero = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  // Configurar HLS para el video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error('Video ref no disponible');
      return;
    }

    // URLs a probar en orden de prioridad
    const urlsToTry = [
      // REEMPLAZA ESTA URL CON LA URL CORRECTA DE TU VIDEO EN BUNNYCDN
      "https://TU_URL_CORRECTA_AQUI.m3u8",
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8" // Fallback temporal
    ];

    let currentUrlIndex = 0;
    let hlsInstance: Hls | null = null;

    const tryNextUrl = () => {
      if (currentUrlIndex >= urlsToTry.length) {
        console.error('❌ Todas las URLs fallaron');
        return;
      }

      const src = urlsToTry[currentUrlIndex];
      console.log(`🔧 Probando URL ${currentUrlIndex + 1}/${urlsToTry.length}:`, src);

      // Verificar soporte de HLS
      const canPlayHLS = video.canPlayType("application/vnd.apple.mpegurl");
      const hlsSupported = Hls.isSupported();
      
      console.log('Soporte HLS nativo:', canPlayHLS);
      console.log('hls.js soportado:', hlsSupported);
      
      if (canPlayHLS) {
        // Safari soporta HLS nativamente
        console.log('✅ Usando soporte nativo de HLS');
        video.src = src;
      } else if (hlsSupported) {
        // Otros navegadores necesitan hls.js
        console.log('✅ Usando hls.js para reproducir video');
        hlsInstance = new Hls({
          debug: false, // Reducir logs para producción
          enableWorker: true,
          lowLatencyMode: true
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.error(`❌ Error HLS con URL ${currentUrlIndex + 1}:`, data);
          if (data.fatal) {
            console.log(`🔄 Intentando siguiente URL...`);
            currentUrlIndex++;
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            setTimeout(tryNextUrl, 1000); // Esperar 1 segundo antes de probar la siguiente URL
          }
        });
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Manifest HLS parseado correctamente con URL:', src);
        });
        
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        console.error('❌ HLS no soportado en este navegador');
      }
    };

    // Iniciar con la primera URL
    tryNextUrl();

    return () => {
      console.log('🧹 Limpiando HLS...');
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Error al cargar el video:', e);
    const video = e.currentTarget;
    console.error('Error details:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.src
    });
  };

  const handleVideoLoad = () => {
    console.log('Video cargado exitosamente');
    if (videoRef.current) {
      console.log('Video ready state:', videoRef.current.readyState);
      console.log('Video network state:', videoRef.current.networkState);
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
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          controls={false}
          loop
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
          preload="auto"
        >
          {/* Fallback gradient */}
          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent"></div>
        </video>
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
        <h1 className={`text-5xl md:text-7xl font-bold mb-8 transition-all duration-1000 delay-300 ease-out ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          La Libertad
          <span className="block text-white">
            Avanza Córdoba
          </span>
        </h1>
        
        <Button 
          variant="hero" 
          size="lg" 
          className={`text-xl px-12 py-4 transition-all duration-1000 delay-500 ease-out ${
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
          Sumate a Fiscalizar
        </Button>
      </div>
      </section>
    </>
  );
};

export default Hero;
