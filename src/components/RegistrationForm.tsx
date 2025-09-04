import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_CONFIG } from "../config/recaptcha";
import { apiService } from "../services/api";
import { localidades } from "@/data/localidades";
import { barriosPorCiudad } from "@/data/barrios";

const formSchema = z.object({
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  dni: z.string().min(7, "DNI debe tener al menos 7 dígitos").max(8, "DNI debe tener máximo 8 dígitos"),
  confirmarDni: z.string(),
  codigoPais: z.string().default("+54"),
  areaCelular: z.string().min(2, "Código de área requerido"),
  numeroCelular: z.string().min(6, "Número de celular requerido"),
  confirmarCodigoPais: z.string().default("+54"),
  confirmarAreaCelular: z.string(),
  confirmarNumeroCelular: z.string(),
  email: z.string().email("Email inválido"),
  diaNacimiento: z.string().min(1, "Día requerido"),
  mesNacimiento: z.string().min(1, "Mes requerido"),
  anoNacimiento: z.string().min(4, "Año requerido"),
  ciudad: z.string().min(1, "Localidad requerida"),
  barrio: z.string().optional(),
  sexo: z.string().min(1, "Sexo requerido"),
  captcha: z.string().min(1, "Debe completar el captcha"),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar los términos y condiciones",
  }),
}).refine((data) => data.dni === data.confirmarDni, {
  message: "Los DNI no coinciden",
  path: ["confirmarDni"],
}).refine((data) => 
  data.areaCelular === data.confirmarAreaCelular && 
  data.numeroCelular === data.confirmarNumeroCelular, {
  message: "Los números de celular no coinciden",
  path: ["confirmarNumeroCelular"],
}).refine((data) => {
  // Barrio es requerido solo si la localidad es CORDOBA CAPITAL o OTROS
  if (data.ciudad === "CORDOBA CAPITAL" || data.ciudad === "OTROS") {
    return data.barrio && data.barrio.length > 0;
  }
  return true;
}, {
  message: "Barrio requerido para Córdoba Capital y OTROS",
  path: ["barrio"],
});



// Configuración de reCAPTCHA importada desde config/recaptcha.ts

export default function RegistrationForm() {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [localidadOpen, setLocalidadOpen] = useState(false);
  const [barrioOpen, setBarrioOpen] = useState(false);
  const [busquedaLocalidad, setBusquedaLocalidad] = useState("");
  const [busquedaBarrio, setBusquedaBarrio] = useState("");
  const [terminosOpen, setTerminosOpen] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [localidadesAPI, setLocalidadesAPI] = useState<Array<{id: number, nombre: string}>>([]);
  const [barriosAPI, setBarriosAPI] = useState<{[key: string]: Array<{id: number, nombre: string}>}>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoPais: "+54",
      confirmarCodigoPais: "+54",
      captcha: "",
      aceptarTerminos: false,
    },
  });

  const handleCaptchaChange = (value: string | null) => {
    if (value) {
      form.setValue("captcha", value);
      form.clearErrors("captcha");
      setRecaptchaError(false);
    } else {
      form.setValue("captcha", "");
      form.setError("captcha", {
        type: "manual",
        message: "Debe completar el captcha"
      });
      setRecaptchaError(true);
    }
  };

  // Limpiar barrio cuando cambie la ciudad
  const ciudadSeleccionada = form.watch("ciudad");
  useEffect(() => {
    if (ciudadSeleccionada) {
      if (ciudadSeleccionada === "OTROS") {
        // Si se selecciona "OTROS", no limpiar el barrio
        return;
      }
      // Si el barrio seleccionado no está disponible en la nueva ciudad, limpiarlo
      const barriosDisponibles = barriosPorCiudad[ciudadSeleccionada as keyof typeof barriosPorCiudad] || [];
      const barrioActual = form.getValues("barrio");
      if (barrioActual && !barriosDisponibles.includes(barrioActual)) {
        form.setValue("barrio", "");
      }
    } else {
      // Si no hay ciudad seleccionada, limpiar el barrio
      form.setValue("barrio", "");
    }
  }, [ciudadSeleccionada, form]);

  // Cargar localidades y barrios desde la API al montar el componente
  // COMENTADO: Usando datos hardcodeados por ahora
  /*
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoadingData(true);
        
        // Cargar localidades
        const localidadesData = await apiService.getLocalidades();
        if (localidadesData.length > 0) {
          setLocalidadesAPI(localidadesData);
        }
        
        // Cargar barrios para ciudades principales
        const ciudadesPrincipales = ['CORDOBA CAPITAL', 'VILLA CARLOS PAZ', 'RIO CUARTO'];
        const barriosData: {[key: string]: Array<{id: number, nombre: string}>} = {};
        
        for (const ciudad of ciudadesPrincipales) {
          try {
            const barrios = await apiService.getBarriosPorCiudad(ciudad);
            if (barrios.length > 0) {
              barriosData[ciudad] = barrios;
            }
          } catch (error) {
            console.warn(`No se pudieron cargar barrios para ${ciudad}:`, error);
          }
        }
        
        setBarriosAPI(barriosData);
        
      } catch (error) {
        console.error('Error cargando datos de la API:', error);
        setSubmitMessage({
          type: 'error',
          message: 'Error al cargar datos. Usando datos locales como respaldo.'
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    cargarDatos();
  }, []);
  */

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Limpiar mensajes anteriores
      setSubmitMessage(null);
      setIsSubmitting(true);
      
      console.log("Datos del formulario:", values);
      
      // Verificar que el reCAPTCHA esté completado
      if (!values.captcha) {
        form.setError("captcha", {
          type: "manual",
          message: "Debe completar el captcha"
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar reCAPTCHA con el backend
      console.log("Verificando reCAPTCHA...");
      const recaptchaValido = await apiService.verificarRecaptcha(values.captcha);
      
      if (!recaptchaValido) {
        form.setError("captcha", {
          type: "manual",
          message: "Verificación del captcha falló. Por favor, inténtalo de nuevo."
        });
        setIsSubmitting(false);
        return;
      }

      console.log("reCAPTCHA válido, enviando datos...");
      
      // Preparar datos para la API (excluir campos de confirmación)
      const datosParaAPI = {
        nombre: values.nombre,
        apellido: values.apellido,
        dni: values.dni,
        confirmarDni: values.confirmarDni,
        areaCelular: values.areaCelular,
        numeroCelular: values.numeroCelular,
        confirmarAreaCelular: values.confirmarAreaCelular,
        confirmarNumeroCelular: values.confirmarNumeroCelular,
        email: values.email,
        diaNacimiento: values.diaNacimiento,
        mesNacimiento: values.mesNacimiento,
        anoNacimiento: values.anoNacimiento,
        ciudad: values.ciudad,
        barrio: values.barrio,
        sexo: values.sexo,
        aceptarTerminos: values.aceptarTerminos,
        captcha: values.captcha
      };

      // Enviar datos del formulario al backend
      console.log("🚀 Enviando formulario al backend...");
      const response = await apiService.registrarFiscal(datosParaAPI);
      
      console.log("📥 Respuesta recibida:", response);
      
      if (response && response.success) {
        console.log("✅ Fiscal registrado exitosamente:", response);
        
        // Resetear reCAPTCHA después del envío exitoso
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir a la página de éxito con el nombre del fiscal
        const nombreFiscal = values.nombre;
        const urlExito = `/registro-exitoso?nombre=${encodeURIComponent(nombreFiscal)}`;
        console.log("🚀 Intentando redirigir a:", urlExito);
        navigate(urlExito);
        console.log("✅ Redirección ejecutada");
        
        // Retornar para evitar que continúe la ejecución
        return;
      } else {
        const errorMsg = response?.message || 'Error desconocido al registrar fiscal';
        console.error("❌ Error en respuesta:", errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      
      let errorMessage = "Error al enviar el formulario. Por favor, inténtalo de nuevo.";
      
      // Mostrar error específico del reCAPTCHA si es necesario
      if (error instanceof Error) {
        if (error.message.includes('captcha')) {
          form.setError("captcha", {
            type: "manual",
            message: "Error en la verificación del captcha. Por favor, inténtalo de nuevo."
          });
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitMessage({
        type: 'error',
        message: errorMessage
      });
      
      // Limpiar mensaje de error después de 8 segundos
      setTimeout(() => setSubmitMessage(null), 8000);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" id="registration-form">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 border-2 border-primary/20 rounded-3xl bg-card shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Primera fila: Apellido y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Apellido*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="González" 
                          maxLength={50}
                          {...field} 
                          className="rounded-xl border-border bg-input h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Nombre*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Carlos" 
                          maxLength={50}
                          {...field} 
                          className="rounded-xl border-border bg-input h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Segunda fila: DNI y Confirmar DNI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">DNI*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678" 
                          maxLength={8}
                          {...field} 
                          className="rounded-xl border-border bg-input h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmarDni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Confirmar DNI*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678" 
                          maxLength={8}
                          {...field} 
                          className="rounded-xl border-border bg-input h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tercera fila: Celular */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                                        <FormLabel className="text-foreground font-medium">Celular*</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="codigoPais"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-12 rounded-xl border-border bg-input h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="+54">🇦🇷 +54</SelectItem>
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+56">🇨🇱 +56</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="areaCelular"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="0351" 
                              maxLength={4}
                              {...field} 
                              className="w-20 rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numeroCelular"
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormControl>
                            <Input 
                              placeholder="1234567" 
                              maxLength={10}
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="md:pl-0">
                  <FormLabel className="text-foreground font-medium">Confirmar Celular*</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="confirmarCodigoPais"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-12 rounded-xl border-border bg-input h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="+54">🇦🇷 +54</SelectItem>
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+56">🇨🇱 +56</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmarAreaCelular"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="0351" 
                              maxLength={4}
                              {...field} 
                              className="w-20 rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmarNumeroCelular"
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormControl>
                            <Input 
                              placeholder="1234567" 
                              maxLength={10}
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </div>
              </div>

              {/* Cuarta fila: Email y Fecha de nacimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Email*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="carlos.gonzalez@mail.com" 
                          type="email"
                          maxLength={100}
                          {...field} 
                          className="rounded-xl border-border bg-input h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel className="text-foreground font-medium">Fecha de nacimiento*</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="diaNacimiento"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="25" 
                              maxLength={2}
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="flex items-center text-muted-foreground">/</span>
                    <FormField
                      control={form.control}
                      name="mesNacimiento"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="12" 
                              maxLength={2}
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="flex items-center text-muted-foreground">/</span>
                    <FormField
                      control={form.control}
                      name="anoNacimiento"
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormControl>
                            <Input 
                              placeholder="1985" 
                              maxLength={4}
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Quinta fila: Ciudad y Barrio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Localidad*</FormLabel>
                                              <Popover open={localidadOpen} onOpenChange={(open) => {
                          setLocalidadOpen(open);
                          if (!open) setBusquedaLocalidad("");
                        }}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between rounded-xl border-border bg-input h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? field.value === "999" 
                                  ? "OTROS"
                                  : localidades.find((localidad) => localidad.id.toString() === field.value)?.nombre
                                : "Selecciona tu localidad"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <div className="p-2">
                            <Input
                              placeholder="Buscar localidad..."
                              value={busquedaLocalidad}
                              onChange={(e) => setBusquedaLocalidad(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-60 overflow-y-auto">
                              {/* Localidades filtradas */}
                              {localidades
                                .filter((localidad) =>
                                  localidad.nombre.toLowerCase().includes(busquedaLocalidad.toLowerCase())
                                )
                                .map((localidad) => (
                                  <div
                                    key={localidad.id}
                                    className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                                    onClick={() => {
                                      form.setValue("ciudad", localidad.id.toString());
                                      setLocalidadOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        localidad.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {localidad.nombre}
                                  </div>
                                ))}
                              
                              {/* Separador */}
                              {localidades.filter((localidad) =>
                                localidad.nombre.toLowerCase().includes(busquedaLocalidad.toLowerCase())
                              ).length > 0 && (
                                <div className="border-t my-2"></div>
                              )}
                              
                              {/* Opción OTROS siempre visible */}
                              <div
                                className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm font-medium"
                                onClick={() => {
                                  form.setValue("ciudad", "999"); // ID especial para OTROS
                                  setLocalidadOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    "999" === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                OTROS
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barrio"
                  render={({ field }) => {
                    const ciudadSeleccionada = form.watch("ciudad");
                    const nombreLocalidad = localidades.find((localidad) => localidad.id.toString() === ciudadSeleccionada)?.nombre;
                    const barriosDisponibles = nombreLocalidad && nombreLocalidad !== "OTROS" ? barriosPorCiudad[nombreLocalidad as keyof typeof barriosPorCiudad] || [] : [];
                    const esBarrioRequerido = nombreLocalidad === "CORDOBA CAPITAL";
                    const esOtros = ciudadSeleccionada === "999"; // ID especial para OTROS
                    
                    return (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Barrio{esBarrioRequerido ? "*" : ""}
                        </FormLabel>
                                              <Popover open={barrioOpen} onOpenChange={(open) => {
                          setBarrioOpen(open);
                          if (!open) setBusquedaBarrio("");
                        }}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!ciudadSeleccionada || !esBarrioRequerido}
                              className={cn(
                                  "w-full justify-between rounded-xl border-border bg-input h-12",
                                  !field.value && "text-muted-foreground",
                                  (!ciudadSeleccionada || !esBarrioRequerido) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                              {field.value
                                ? barriosDisponibles.find((barrio) => barrio.id.toString() === field.value)?.nombre
                                : ciudadSeleccionada 
                                  ? esOtros
                                    ? "Selecciona tu barrio"
                                    : barriosDisponibles.length > 0 
                                      ? "Selecciona tu barrio" 
                                      : "No hay barrios disponibles"
                                  : "Selecciona localidad"}
                              {(!ciudadSeleccionada || !esBarrioRequerido) ? null : (
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <div className="p-2">
                            <Input
                              placeholder={esOtros ? "Escribir nombre del barrio..." : "Buscar barrio..."}
                              value={busquedaBarrio}
                              onChange={(e) => setBusquedaBarrio(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-60 overflow-y-auto">
                              {/* Barrios filtrados */}
                              {barriosDisponibles
                                .filter((barrio) =>
                                  barrio.nombre.toLowerCase().includes(busquedaBarrio.toLowerCase())
                                )
                                .map((barrio) => (
                                  <div
                                    key={barrio.id}
                                    className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                                    onClick={() => {
                                      form.setValue("barrio", barrio.id.toString());
                                      setBarrioOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        barrio.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {barrio.nombre}
                                  </div>
                                ))}
                              
                              {/* Separador */}
                              {barriosDisponibles.filter((barrio) =>
                                barrio.nombre.toLowerCase().includes(busquedaBarrio.toLowerCase())
                              ).length > 0 && (
                                <div className="border-t my-2"></div>
                              )}
                              
                              {/* Opción OTROS siempre visible */}
                              <div
                                className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm font-medium"
                                onClick={() => {
                                  form.setValue("barrio", "999"); // ID especial para OTROS
                                  setBarrioOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    "999" === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                OTROS
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Sexo */}
              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Sexo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="masculino" 
                            id="masculino" 
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor="masculino" className="text-foreground">Masculino</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="femenino" 
                            id="femenino"
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor="femenino" className="text-foreground">Femenino</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Términos y condiciones */}
              <FormField
                control={form.control}
                name="aceptarTerminos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Acepto los{" "}
                        <a 
                          href="#" 
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setTerminosOpen(true);
                          }}
                        >
                          términos y condiciones
                        </a>{" "}
                        del formulario
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Mensajes de estado del formulario */}
              {submitMessage && (
                <div className={`p-6 rounded-2xl border-2 shadow-lg ${
                  submitMessage.type === 'success' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900' 
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <div className="flex items-start">
                    {submitMessage.type === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-green-600 mr-4 mt-1 flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500 mr-4 mt-1 flex-shrink-0"></div>
                    )}
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${
                        submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {submitMessage.type === 'success' ? '¡Registro Completado!' : 'Error en el Registro'}
                      </h3>
                      <p className="text-base leading-relaxed">{submitMessage.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Google reCAPTCHA y botón enviar */}
              <div className="pt-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-end gap-4">
                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-auto">
                        <FormControl>
                          <div className="h-[78px] flex items-center justify-center sm:justify-start">
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={RECAPTCHA_CONFIG.SITE_KEY}
                              onChange={handleCaptchaChange}
                              theme={RECAPTCHA_CONFIG.THEME}
                              size={RECAPTCHA_CONFIG.SIZE}
                              onError={() => {
                                setRecaptchaError(true);
                                form.setError("captcha", {
                                  type: "manual",
                                  message: "Error al cargar el captcha. Por favor, recarga la página."
                                });
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {recaptchaError && (
                          <div className="text-sm text-red-600 mt-1">
                            Si ves un error en el captcha, por favor recarga la página o contacta al administrador.
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col items-center sm:items-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-b from-[#832B99] via-[#7A2A8A] via-[#6F297A] via-[#64286A] to-[#59275A] hover:from-[#7A2A8A] hover:to-[#64286A] text-white font-bold px-8 py-6 rounded-xl h-[78px] min-w-[120px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          ENVIANDO...
                        </div>
                      ) : (
                        "ENVIAR"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </Card>
      </div>
      
      {/* Modal de Términos y Condiciones */}
      {terminosOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Términos y Condiciones de Inscripción
                </h2>
                <button
                  onClick={() => setTerminosOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
                <p>
                  Al registrarte como fiscal de mesa o fiscal general de establecimiento para las próximas elecciones, aceptás los siguientes términos y condiciones:
                </p>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Finalidad de la inscripción</h3>
                  <p>
                    La inscripción tiene como objetivo conformar un equipo de fiscales voluntarios que colaboren en la fiscalización de las elecciones, contribuyendo a garantizar la transparencia y el normal desarrollo del proceso electoral.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Datos personales solicitados</h3>
                  <p className="mb-2">
                    Durante el registro se te solicitarán los siguientes datos:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Nombre y apellido</li>
                    <li>DNI (y confirmación de DNI)</li>
                    <li>Número de celular (y confirmación de celular)</li>
                    <li>Correo electrónico</li>
                    <li>Fecha de nacimiento</li>
                    <li>Localidad y barrio de residencia</li>
                    <li>Sexo</li>
                  </ul>
                  <p className="mt-2">
                    El aporte de esta información es obligatorio para validar la inscripción y permitir la comunicación con la organización.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Uso y resguardo de los datos</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Los datos recopilados serán utilizados únicamente con fines organizativos y de comunicación vinculados a la fiscalización electoral.</li>
                    <li>La información no será compartida con terceros ajenos a la organización.</li>
                    <li>Podrás solicitar en cualquier momento la rectificación o eliminación de tus datos personales, escribiendo a la dirección de contacto oficial.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">4. Compromisos del fiscal</h3>
                  <p className="mb-2">Al inscribirte, te comprometés a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Participar de las instancias de capacitación que se indiquen.</li>
                    <li>Presentarte puntualmente en el establecimiento o mesa que se te asigne.</li>
                    <li>Desempeñar las funciones de fiscal con responsabilidad, respeto y apego a la normativa vigente.</li>
                    <li>Seguir las instrucciones del equipo de coordinación durante la jornada electoral.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">5. Condiciones de participación</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>La inscripción no garantiza la asignación automática de un puesto, ya que dependerá de la disponibilidad de mesas y establecimientos.</li>
                    <li>La organización podrá reasignar lugares en función de las necesidades de cobertura.</li>
                    <li>La actividad es totalmente voluntaria y no remunerada.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6. Aceptación</h3>
                  <p>
                    Al completar el formulario de inscripción y marcar la casilla de aceptación, confirmás que leíste y aceptás estos términos y condiciones, autorizando el uso de tus datos conforme a lo aquí establecido.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setTerminosOpen(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Marcar el checkbox de términos y condiciones
                    form.setValue("aceptarTerminos", true);
                    // Cerrar el modal
                    setTerminosOpen(false);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <span className="hidden sm:inline">Aceptar Términos</span>
                  <span className="sm:hidden">Aceptar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
