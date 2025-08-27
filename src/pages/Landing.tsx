import RegistrationForm from "@/components/RegistrationForm";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">L</span>
            </div>
            <span className="font-semibold">La Libertad Avanza</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Registration Form */}
          <div className="order-2 lg:order-1">
            <RegistrationForm />
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
                SUMATE A FISCALIZAR
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ¡Tu compromiso hace la diferencia! Sumate como fiscal de mesa de La Libertad Avanza en la provincia 
                de Córdoba y ayudanos a defender el voto de todos los cordobeses. Completá este formulario para 
                unirte a nuestro equipo y ser parte activa del cambio que estamos construyendo.
              </p>
            </div>

            {/* Candidate Image */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="aspect-video bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="font-medium">Imagen del candidato</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200">
              <h3 className="font-bold text-primary mb-3">¿Por qué ser fiscal?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Garantizar la transparencia electoral</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Defender cada voto de los cordobeses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Ser parte del cambio que necesita Argentina</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm opacity-80">
            © 2024 La Libertad Avanza - Córdoba. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}