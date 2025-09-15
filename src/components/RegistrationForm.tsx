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
import { Check, ChevronsUpDown, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_CONFIG } from "../config/recaptcha";
import { apiService } from "../services/api";
import localidades from "@/data/localidades";
import barriosPorCiudad from "@/data/barrios";

// Función para normalizar texto (quitar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
};

const formSchema = z.object({
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  dni: z.string()
    .min(7, "DNI debe tener al menos 7 dígitos")
    .max(8, "DNI debe tener máximo 8 dígitos")
    .regex(/^\d+$/, "DNI debe contener solo números"),
  confirmarDni: z.string().min(1, "Debe confirmar el DNI"),
  codigoPais: z.string().default("+54"),
  areaCelular: z.string().min(2, "Código de área requerido"),
  numeroCelular: z.string().min(6, "Número de celular requerido"),
  confirmarCodigoPais: z.string().default("+54"),
  confirmarAreaCelular: z.string(),
  confirmarNumeroCelular: z.string(),
  email: z.string()
    .min(1, "Email requerido")
    .email("Email inválido - debe contener @ y formato válido"),
  diaNacimiento: z.string()
    .min(1, "Día requerido")
    .regex(/^(0?[1-9]|[12][0-9]|3[01])$/, "Día inválido (1-31)"),
  mesNacimiento: z.string()
    .min(1, "Mes requerido")
    .regex(/^(0?[1-9]|1[0-2])$/, "Mes inválido (1-12)"),
  anoNacimiento: z.string()
    .min(4, "Año requerido")
    .regex(/^(19|20)\d{2}$/, "Año inválido (1900-2099)"),
  ciudad: z.string().min(1, "Localidad requerida"),
  ciudadOtros: z.string().optional(),
  barrio: z.string().optional(),
  barrioOtros: z.string().optional(),
  sexo: z.string().min(1, "Sexo requerido"),
  captcha: z.string().min(1, "Debe completar el captcha"),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar los términos y condiciones",
  }),
}).refine((data) => data.dni === data.confirmarDni, {
  message: "Los DNI no coinciden",
  path: ["dni"],
}).refine((data) => 
  data.areaCelular === data.confirmarAreaCelular && 
  data.numeroCelular === data.confirmarNumeroCelular, {
  message: "Los números de celular no coinciden",
  path: ["areaCelular"],
}).refine((data) => 
  data.codigoPais === data.confirmarCodigoPais, {
  message: "Los códigos de país deben ser iguales",
  path: ["codigoPais"],
}).refine((data) => {
  // Barrio es requerido solo si la localidad es CORDOBA CAPITAL o OTROS
  if (data.ciudad === "CORDOBA CAPITAL" || data.ciudad === "OTROS") {
    return data.barrio && data.barrio.length > 0;
  }
  return true;
}, {
  message: "Barrio requerido para Córdoba Capital y OTROS",
  path: ["barrio"],
}).refine((data) => {
  // Validar que la fecha de nacimiento no sea futura y que sea mayor de 14 años
  if (data.diaNacimiento && data.mesNacimiento && data.anoNacimiento) {
    const dia = parseInt(data.diaNacimiento);
    const mes = parseInt(data.mesNacimiento);
    const ano = parseInt(data.anoNacimiento);
    
    // Verificar que sea una fecha válida
    const fechaNacimiento = new Date(ano, mes - 1, dia);
    if (fechaNacimiento.getDate() !== dia || fechaNacimiento.getMonth() !== mes - 1 || fechaNacimiento.getFullYear() !== ano) {
      return false;
    }
    
    // Verificar que no sea una fecha futura
    const hoy = new Date();
    if (fechaNacimiento > hoy) {
      return false;
    }
    
    // Verificar que tenga 18 años cumplidos al 26 de octubre de 2025 (igual que el backend)
    const fechaReferencia = new Date('2025-10-26'); // Fecha límite para tener 18 años
    let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiferencia = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
    
    if (mesDiferencia < 0 || (mesDiferencia === 0 && fechaReferencia.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    if (edad < 18) {
      return false;
    }
    
    return true;
  }
  return true;
}, {
  message: "Debes tener 18 años cumplidos al 26 de octubre de 2025 para ser fiscal", 
  path: ["diaNacimiento"],
}).refine((data) => {
  // Si la ciudad es "999" (OTROS), entonces ciudadOtros es requerido
  if (data.ciudad === "999") {
    return data.ciudadOtros && data.ciudadOtros.trim().length > 0;
  }
  return true;
}, {
  message: "Debe especificar el nombre de la localidad",
  path: ["ciudadOtros"],
}).refine((data) => {
  // Si el barrio es "999" (OTROS), entonces barrioOtros es requerido
  if (data.barrio === "999") {
    return data.barrioOtros && data.barrioOtros.trim().length > 0;
  }
  return true;
}, {
  message: "Debe especificar el nombre del barrio",
  path: ["barrioOtros"],
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
    mode: "onBlur", // Cambiar a onBlur para evitar conflictos
    reValidateMode: "onChange", // Re-validar en cada cambio
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
      if (barrioActual && !barriosDisponibles.some(barrio => barrio.id.toString() === barrioActual)) {
        form.setValue("barrio", "");
      }
    } else {
      // Si no hay ciudad seleccionada, limpiar el barrio
      form.setValue("barrio", "");
    }
  }, [ciudadSeleccionada, form]);

  // Validar códigos de país (sin sincronización automática)
  const codigoPais = form.watch("codigoPais");
  const confirmarCodigoPais = form.watch("confirmarCodigoPais");
  
  useEffect(() => {
    // Validar coincidencia de códigos de país en tiempo real
    if (confirmarCodigoPais && confirmarCodigoPais.length > 0) {
      if (codigoPais && codigoPais !== confirmarCodigoPais) {
        // Mostrar error en el campo codigoPais para que aparezca en el mensaje personalizado
        form.setError("codigoPais", {
          type: "manual",
          message: "Los códigos de país deben ser iguales"
        });
      } else if (codigoPais && codigoPais === confirmarCodigoPais) {
        form.clearErrors("confirmarCodigoPais");
        form.clearErrors("codigoPais");
      }
    }
  }, [codigoPais, confirmarCodigoPais, form]);

  // Validaciones instantáneas para DNI
  const dni = form.watch("dni");
  const confirmarDni = form.watch("confirmarDni");
  
  useEffect(() => {
    // Validar coincidencia de DNI en tiempo real
    if (confirmarDni && confirmarDni.length > 0) {
      if (dni && dni !== confirmarDni) {
        form.setError("dni", {
          type: "manual",
          message: "Los DNI no coinciden"
        });
      } else if (dni && dni === confirmarDni) {
        form.clearErrors("confirmarDni");
        form.clearErrors("dni");
      }
    }
  }, [dni, confirmarDni, form]);

  // Validaciones instantáneas para celular
  const areaCelular = form.watch("areaCelular");
  const numeroCelular = form.watch("numeroCelular");
  const confirmarAreaCelular = form.watch("confirmarAreaCelular");
  const confirmarNumeroCelular = form.watch("confirmarNumeroCelular");
  
  useEffect(() => {
    // Validar coincidencia de celular en tiempo real
    if (confirmarAreaCelular && confirmarNumeroCelular && 
        confirmarAreaCelular.length > 0 && confirmarNumeroCelular.length > 0) {
      if (areaCelular !== confirmarAreaCelular || numeroCelular !== confirmarNumeroCelular) {
        // Mostrar error en el campo areaCelular para que aparezca en el mensaje personalizado
        form.setError("areaCelular", {
          type: "manual",
          message: "Los números de celular no coinciden"
        });
      } else {
        form.clearErrors("confirmarNumeroCelular");
        form.clearErrors("confirmarAreaCelular");
        form.clearErrors("numeroCelular");
        form.clearErrors("areaCelular");
      }
    }
  }, [areaCelular, numeroCelular, confirmarAreaCelular, confirmarNumeroCelular, form]);

  // Validación instantánea para email
  const email = form.watch("email");
  
  useEffect(() => {
    // Validar formato de email en tiempo real
    if (email && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        form.setError("email", {
          type: "manual",
          message: "Email inválido - debe contener @ y formato válido"
        });
      } else {
        form.clearErrors("email");
      }
    }
  }, [email, form]);

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
      setSubmitMessage(null);
      setIsSubmitting(true);
      
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
      const recaptchaValido = await apiService.verificarRecaptcha(values.captcha);
      
      if (!recaptchaValido) {
        form.setError("captcha", {
          type: "manual",
          message: "Verificación falló. Inténtalo de nuevo."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Preparar datos para la API en el formato correcto
      const fechaNacimiento = `${values.anoNacimiento}-${values.mesNacimiento.padStart(2, '0')}-${values.diaNacimiento.padStart(2, '0')}`;
      
      // Construir número de celular - para Argentina usar 54 + código de área (que ya incluye el 9)
      let celular;
      if (values.codigoPais === "+54") {
        // Para Argentina, usar 54 + código de área + número (el código de área ya incluye el 9)
        celular = `54${values.areaCelular}${values.numeroCelular}`;
      } else {
        // Para otros países, usar el código de país normal
        celular = `${values.codigoPais}${values.areaCelular}${values.numeroCelular}`;
      }
      
      // Determinar si se seleccionó "OTROS" para localidad o barrio
      const esLocalidadOtros = values.ciudad === "999";
      const esBarrioOtros = values.barrio === "999";
      
      // Preparar otros_descripcion
      let otrosDescripcion = null;
      if (esLocalidadOtros && values.ciudadOtros) {
        otrosDescripcion = values.ciudadOtros;
      } else if (esBarrioOtros && values.barrioOtros) {
        otrosDescripcion = values.barrioOtros;
      }
      
      const datosParaAPI = {
        apellido: values.apellido,
        nombre: values.nombre,
        dni: values.dni,
        celular: celular,
        email: values.email,
        fecha_nacimiento: fechaNacimiento,
        idLocalidad: esLocalidadOtros ? 999 : parseInt(values.ciudad),
        idBarrio: esBarrioOtros ? 999 : (values.barrio ? parseInt(values.barrio) : null),
        sexo: values.sexo === "masculino" ? "M" : "F",
        tyc: values.aceptarTerminos,
        otros_descripcion: otrosDescripcion
      };

      // Enviar datos del formulario al backend
      const response = await apiService.registrarFiscal(datosParaAPI);
      
      if (response && response.success) {
        // Resetear reCAPTCHA después del envío exitoso
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir a la página de éxito con el nombre del fiscal
        const nombreFiscal = values.nombre;
        const urlExito = `/registro-exitoso?nombre=${encodeURIComponent(nombreFiscal)}`;
        navigate(urlExito);
        
        return;
      } else {
        const errorMsg = response?.message || 'Error desconocido al registrar fiscal';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      // Verificar si es un error de registro duplicado
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Si es un registro duplicado, mostrar mensaje de éxito pero no enviar a BD
        if (errorMessage.includes('duplicado') || 
            errorMessage.includes('ya existe') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('dni ya registrado') ||
            errorMessage.includes('email ya registrado')) {
          
          // Resetear reCAPTCHA
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
          }
          
          // Limpiar formulario
          form.reset();
          
          // Redirigir a la página de éxito con el nombre del fiscal
          const nombreFiscal = values.nombre;
          const urlExito = `/registro-exitoso?nombre=${encodeURIComponent(nombreFiscal)}`;
          navigate(urlExito);
          
          return; // Salir sin mostrar error
        }
      }
      
      let errorMessage = "Error al enviar el formulario. Por favor, inténtalo de nuevo.";
      
      // Mostrar error específico del reCAPTCHA si es necesario
      if (error instanceof Error) {
        if (error.message.includes('captcha')) {
          form.setError("captcha", {
            type: "manual",
            message: "Error en la verificación. Inténtalo de nuevo."
          });
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu internet.";
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
              {/* Primera fila: Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          onKeyDown={(e) => {
                            // No permitir números
                            if (/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          onKeyDown={(e) => {
                            // No permitir números
                            if (/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
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
                          onKeyDown={(e) => {
                            // Solo permitir números, backspace, delete, tab, escape, enter
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
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
                          onKeyDown={(e) => {
                            // Solo permitir números, backspace, delete, tab, escape, enter
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            // Validación instantánea
                            const dni = form.getValues("dni");
                            const confirmarDni = e.target.value;
                            if (confirmarDni && dni && dni !== confirmarDni) {
                              form.setError("dni", {
                                type: "manual",
                                message: "Los DNI no coinciden"
                              });
                            } else if (confirmarDni && dni && dni === confirmarDni) {
                              form.clearErrors("dni");
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Mensaje de error personalizado para DNI que ocupa todo el ancho */}
              {form.formState.errors.dni && (
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.dni.message}
                  </p>
                </div>
              )}

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
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            // Validación instantánea de código de país
                            const confirmarCodigoPais = form.getValues("confirmarCodigoPais");
                            if (confirmarCodigoPais && confirmarCodigoPais !== value) {
                              form.setError("codigoPais", {
                                type: "manual",
                                message: "Los códigos de país deben ser iguales"
                              });
                            } else if (confirmarCodigoPais && confirmarCodigoPais === value) {
                              form.clearErrors("codigoPais");
                              form.clearErrors("confirmarCodigoPais");
                            }
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-12 rounded-xl border-border bg-input h-12 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:ml-1">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="+54">🇦🇷 +54</SelectItem>
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+56">🇨🇱 +56</SelectItem>
                              <SelectItem value="+57">🇨🇴 +57</SelectItem>
                              <SelectItem value="+58">🇻🇪 +58</SelectItem>
                              <SelectItem value="+51">🇵🇪 +51</SelectItem>
                              <SelectItem value="+52">🇲🇽 +52</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+34">🇪🇸 +34</SelectItem>
                              <SelectItem value="+39">🇮🇹 +39</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                              <SelectItem value="+49">🇩🇪 +49</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+7">🇷🇺 +7</SelectItem>
                              <SelectItem value="+86">🇨🇳 +86</SelectItem>
                              <SelectItem value="+81">🇯🇵 +81</SelectItem>
                              <SelectItem value="+82">🇰🇷 +82</SelectItem>
                              <SelectItem value="+91">🇮🇳 +91</SelectItem>
                              <SelectItem value="+61">🇦🇺 +61</SelectItem>
                              <SelectItem value="+1">🇨🇦 +1</SelectItem>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </FormControl>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </FormControl>
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
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            // Validación instantánea de código de país
                            const codigoPais = form.getValues("codigoPais");
                            if (codigoPais && codigoPais !== value) {
                              form.setError("codigoPais", {
                                type: "manual",
                                message: "Los códigos de país deben ser iguales"
                              });
                            } else if (codigoPais && codigoPais === value) {
                              form.clearErrors("confirmarCodigoPais");
                              form.clearErrors("codigoPais");
                            }
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-12 rounded-xl border-border bg-input h-12 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:ml-1">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="+54">🇦🇷 +54</SelectItem>
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+56">🇨🇱 +56</SelectItem>
                              <SelectItem value="+57">🇨🇴 +57</SelectItem>
                              <SelectItem value="+58">🇻🇪 +58</SelectItem>
                              <SelectItem value="+51">🇵🇪 +51</SelectItem>
                              <SelectItem value="+52">🇲🇽 +52</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+34">🇪🇸 +34</SelectItem>
                              <SelectItem value="+39">🇮🇹 +39</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                              <SelectItem value="+49">🇩🇪 +49</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+7">🇷🇺 +7</SelectItem>
                              <SelectItem value="+86">🇨🇳 +86</SelectItem>
                              <SelectItem value="+81">🇯🇵 +81</SelectItem>
                              <SelectItem value="+82">🇰🇷 +82</SelectItem>
                              <SelectItem value="+91">🇮🇳 +91</SelectItem>
                              <SelectItem value="+61">🇦🇺 +61</SelectItem>
                              <SelectItem value="+1">🇨🇦 +1</SelectItem>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                // Validación instantánea de área celular
                                const areaCelular = form.getValues("areaCelular");
                                const numeroCelular = form.getValues("numeroCelular");
                                const confirmarAreaCelular = e.target.value;
                                const confirmarNumeroCelular = form.getValues("confirmarNumeroCelular");
                                
                                // Validar si hay suficiente contenido para comparar
                                if (confirmarAreaCelular && confirmarAreaCelular.length > 0 && 
                                    areaCelular && areaCelular.length > 0) {
                                  if (areaCelular !== confirmarAreaCelular) {
                                    form.setError("areaCelular", {
                                      type: "manual",
                                      message: "Los números de celular no coinciden"
                                    });
                                  } else {
                                    // Solo limpiar error si también coinciden los números
                                    if (confirmarNumeroCelular && numeroCelular && 
                                        confirmarNumeroCelular.length > 0 && numeroCelular.length > 0) {
                                      if (numeroCelular === confirmarNumeroCelular) {
                                        form.clearErrors("areaCelular");
                                      }
                                    } else {
                                      form.clearErrors("areaCelular");
                                    }
                                  }
                                }
                              }}
                            />
                          </FormControl>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                // Validación instantánea de celular
                                const areaCelular = form.getValues("areaCelular");
                                const numeroCelular = form.getValues("numeroCelular");
                                const confirmarAreaCelular = form.getValues("confirmarAreaCelular");
                                const confirmarNumeroCelular = e.target.value;
                                
                                // Validar si hay suficiente contenido para comparar
                                if (confirmarNumeroCelular && confirmarNumeroCelular.length > 0 && 
                                    numeroCelular && numeroCelular.length > 0) {
                                  if (numeroCelular !== confirmarNumeroCelular) {
                                    form.setError("areaCelular", {
                                      type: "manual",
                                      message: "Los números de celular no coinciden"
                                    });
                                  } else {
                                    // Solo limpiar error si también coinciden las áreas
                                    if (confirmarAreaCelular && areaCelular && 
                                        confirmarAreaCelular.length > 0 && areaCelular.length > 0) {
                                      if (areaCelular === confirmarAreaCelular) {
                                        form.clearErrors("areaCelular");
                                      }
                                    } else {
                                      form.clearErrors("areaCelular");
                                    }
                                  }
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mensaje de error personalizado para celular que ocupa todo el ancho */}
              {form.formState.errors.areaCelular && (
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.areaCelular.message}
                  </p>
                </div>
              )}
              
              {/* Mensaje de error personalizado para códigos de país que ocupa todo el ancho */}
              {form.formState.errors.codigoPais && (
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.codigoPais.message}
                  </p>
                </div>
              )}

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
                          onChange={(e) => {
                            field.onChange(e);
                            // Validación instantánea de email
                            const email = e.target.value;
                            if (email && email.length > 0) {
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              if (!emailRegex.test(email)) {
                                form.setError("email", {
                                  type: "manual",
                                  message: "Email inválido - debe contener @ y formato válido"
                                });
                              } else {
                                form.clearErrors("email");
                              }
                            }
                          }}
                        />
                      </FormControl>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                // Validación instantánea de fecha de nacimiento
                                const diaNacimiento = e.target.value;
                                const mesNacimiento = form.getValues("mesNacimiento");
                                const anoNacimiento = form.getValues("anoNacimiento");
                                
                                if (diaNacimiento && mesNacimiento && anoNacimiento && 
                                    diaNacimiento.length > 0 && mesNacimiento.length > 0 && anoNacimiento.length === 4) {
                                  
                                  const dia = parseInt(diaNacimiento);
                                  const mesNac = parseInt(mesNacimiento);
                                  const ano = parseInt(anoNacimiento);
                                  
                                  // Verificar que sea una fecha válida
                                  const fechaNacimiento = new Date(ano, mesNac - 1, dia);
                                  if (fechaNacimiento.getDate() !== dia || fechaNacimiento.getMonth() !== mesNac - 1 || fechaNacimiento.getFullYear() !== ano) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Fecha de nacimiento inválida"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que no sea una fecha futura
                                  const hoy = new Date();
                                  if (fechaNacimiento > hoy) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "La fecha de nacimiento no puede ser futura"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que tenga 18 años cumplidos al 26 de octubre de 2025 (igual que el backend)
                                  const fechaReferencia = new Date('2025-10-26');
                                  let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
                                  const mes = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
                                  
                                  if (mes < 0 || (mes === 0 && fechaReferencia.getDate() < fechaNacimiento.getDate())) {
                                    edad--;
                                  }
                                  
                                  if (edad < 18) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Debes tener 18 años cumplidos al 26 de octubre de 2025 para ser fiscal"
                                    });
                                    return;
                                  }
                                  
                                  // Si todo está bien, limpiar errores
                                  form.clearErrors("diaNacimiento");
                                }
                              }}
                            />
                          </FormControl>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                // Validación instantánea de fecha de nacimiento
                                const diaNacimiento = form.getValues("diaNacimiento");
                                const mesNacimiento = e.target.value;
                                const anoNacimiento = form.getValues("anoNacimiento");
                                
                                if (diaNacimiento && mesNacimiento && anoNacimiento && 
                                    diaNacimiento.length > 0 && mesNacimiento.length > 0 && anoNacimiento.length === 4) {
                                  
                                  const dia = parseInt(diaNacimiento);
                                  const mesNac = parseInt(mesNacimiento);
                                  const ano = parseInt(anoNacimiento);
                                  
                                  // Verificar que sea una fecha válida
                                  const fechaNacimiento = new Date(ano, mesNac - 1, dia);
                                  if (fechaNacimiento.getDate() !== dia || fechaNacimiento.getMonth() !== mesNac - 1 || fechaNacimiento.getFullYear() !== ano) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Fecha de nacimiento inválida"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que no sea una fecha futura
                                  const hoy = new Date();
                                  if (fechaNacimiento > hoy) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "La fecha de nacimiento no puede ser futura"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que tenga 18 años cumplidos al 26 de octubre de 2025 (igual que el backend)
                                  const fechaReferencia = new Date('2025-10-26');
                                  let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
                                  const mes = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
                                  
                                  if (mes < 0 || (mes === 0 && fechaReferencia.getDate() < fechaNacimiento.getDate())) {
                                    edad--;
                                  }
                                  
                                  if (edad < 18) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Debes tener 18 años cumplidos al 26 de octubre de 2025 para ser fiscal"
                                    });
                                    return;
                                  }
                                  
                                  // Si todo está bien, limpiar errores
                                  form.clearErrors("diaNacimiento");
                                }
                              }}
                            />
                          </FormControl>
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
                              onKeyDown={(e) => {
                                // Solo permitir números, backspace, delete, tab, escape, enter
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                // Validación instantánea de fecha de nacimiento
                                const diaNacimiento = form.getValues("diaNacimiento");
                                const mesNacimiento = form.getValues("mesNacimiento");
                                const anoNacimiento = e.target.value;
                                
                                if (diaNacimiento && mesNacimiento && anoNacimiento && 
                                    diaNacimiento.length > 0 && mesNacimiento.length > 0 && anoNacimiento.length === 4) {
                                  
                                  const dia = parseInt(diaNacimiento);
                                  const mesNac = parseInt(mesNacimiento);
                                  const ano = parseInt(anoNacimiento);
                                  
                                  // Verificar que sea una fecha válida
                                  const fechaNacimiento = new Date(ano, mesNac - 1, dia);
                                  if (fechaNacimiento.getDate() !== dia || fechaNacimiento.getMonth() !== mesNac - 1 || fechaNacimiento.getFullYear() !== ano) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Fecha de nacimiento inválida"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que no sea una fecha futura
                                  const hoy = new Date();
                                  if (fechaNacimiento > hoy) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "La fecha de nacimiento no puede ser futura"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar que tenga 18 años cumplidos al 26 de octubre de 2025 (igual que el backend)
                                  const fechaReferencia = new Date('2025-10-26');
                                  let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
                                  const mes = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
                                  
                                  if (mes < 0 || (mes === 0 && fechaReferencia.getDate() < fechaNacimiento.getDate())) {
                                    edad--;
                                  }
                                  
                                  if (edad < 18) {
                                    form.setError("diaNacimiento", {
                                      type: "manual",
                                      message: "Debes tener 18 años cumplidos al 26 de octubre de 2025 para ser fiscal"
                                    });
                                    return;
                                  }
                                  
                                  // Si todo está bien, limpiar errores
                                  form.clearErrors("diaNacimiento");
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mensaje de error personalizado para email que ocupa todo el ancho */}
              {form.formState.errors.email && (
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                </div>
              )}
              
              {/* Mensaje de error personalizado para edad que ocupa todo el ancho */}
              {form.formState.errors.diaNacimiento && (
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.diaNacimiento.message}
                  </p>
                </div>
              )}

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
                                  normalizeText(localidad.nombre).includes(normalizeText(busquedaLocalidad))
                                )
                                .map((localidad) => (
                                  <div
                                    key={localidad.id}
                                    className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                                    onClick={() => {
                                      form.setValue("ciudad", localidad.id.toString());
                                      form.setValue("barrio", ""); // Limpiar barrio al cambiar ciudad
                                      form.setValue("ciudadOtros", ""); // Limpiar campo de ciudad otros
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
                                normalizeText(localidad.nombre).includes(normalizeText(busquedaLocalidad))
                              ).length > 0 && (
                                <div className="border-t my-2"></div>
                              )}
                              
                              {/* Opción OTROS siempre visible */}
                              <div
                                className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm font-medium"
                                onClick={() => {
                                  form.setValue("ciudad", "999"); // ID especial para OTROS
                                  form.setValue("barrio", ""); // Limpiar barrio al cambiar ciudad
                                  form.setValue("barrioOtros", ""); // Limpiar campo de barrio otros
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
                
                {/* Campo para especificar localidad cuando se selecciona "Otros" */}
                {form.watch("ciudad") === "999" && (
                  <FormField
                    control={form.control}
                    name="ciudadOtros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Especificar localidad*
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingrese el nombre de su localidad"
                            maxLength={80}
                            className="rounded-xl border-border bg-input h-12"
                            onKeyDown={(e) => {
                              // Permitir letras, números, espacios, guiones y acentos
                              if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="barrio"
                  render={({ field }) => {
                    const ciudadSeleccionada = form.watch("ciudad");
                    const esOtros = ciudadSeleccionada === "999"; // ID especial para OTROS
                    const nombreLocalidad = esOtros ? "OTROS" : localidades.find((localidad) => localidad.id.toString() === ciudadSeleccionada)?.nombre;
                    const barriosDisponibles = nombreLocalidad && nombreLocalidad !== "OTROS" ? barriosPorCiudad[nombreLocalidad as keyof typeof barriosPorCiudad] || [] : [];
                    const esBarrioRequerido = nombreLocalidad === "CORDOBA CAPITAL";
                    
                    // Agregar la opción OTROS solo si no es la ciudad OTROS
                    const barriosFinales = esOtros ? [] : [...barriosDisponibles, { id: 999, nombre: "OTROS" }];
                    
                    
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
                                ? field.value === "999" 
                                  ? "OTROS"
                                  : barriosFinales.find((barrio) => barrio.id.toString() === field.value)?.nombre
                                : ciudadSeleccionada 
                                  ? esOtros
                                    ? "No hay barrios disponibles"
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
                              {/* Barrios filtrados (excluyendo OTROS) */}
                              {barriosFinales
                                .filter((barrio) => barrio.id !== 999)
                                .filter((barrio) =>
                                  normalizeText(barrio.nombre).includes(normalizeText(busquedaBarrio))
                                )
                                .map((barrio) => (
                                  <div
                                    key={barrio.id}
                                    className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                                    onClick={() => {
                                      form.setValue("barrio", barrio.id.toString());
                                      form.setValue("barrioOtros", ""); // Limpiar campo de barrio otros
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
                              
                              {/* Separador si hay barrios filtrados */}
                              {barriosFinales
                                .filter((barrio) => barrio.id !== 999)
                                .filter((barrio) =>
                                  normalizeText(barrio.nombre).includes(normalizeText(busquedaBarrio))
                                ).length > 0 && (
                                <div className="border-t my-2"></div>
                              )}
                              
                              {/* Opción OTROS siempre visible */}
                              <div
                                className="flex items-center px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm font-medium"
                                onClick={() => {
                                  form.setValue("barrio", "999");
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
                
                {/* Campo para especificar barrio cuando se selecciona "Otros" */}
                {form.watch("barrio") === "999" && (
                  <FormField
                    control={form.control}
                    name="barrioOtros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Especificar barrio*
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingrese el nombre de su barrio"
                            maxLength={80}
                            className="rounded-xl border-border bg-input h-12"
                            onKeyDown={(e) => {
                              // Permitir letras, números, espacios, guiones y acentos
                              if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                      <XCircle className="w-8 h-8 text-red-600 mr-4 mt-1 flex-shrink-0" />
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
