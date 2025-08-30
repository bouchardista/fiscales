import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ReCAPTCHA from "react-google-recaptcha";

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
  ciudad: z.string().min(1, "Ciudad requerida"),
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
});

const ciudades = [
  "Ciudad de Córdoba",
  "Villa Carlos Paz",
  "Río Cuarto",
  "San Francisco",
  "Villa María"
];

const barriosPorCiudad = {
  "Ciudad de Córdoba": [
    "Centro",
    "Nueva Córdoba", 
    "Güemes",
    "General Paz",
    "Alberdi",
    "Barrio Norte",
    "Cerro de las Rosas"
  ],
  "Villa Carlos Paz": [
    "Centro",
    "San Martín",
    "Los Troncos",
    "Sol y Río",
    "Villa del Lago"
  ],
  "Río Cuarto": [
    "Centro",
    "San Martín",
    "General Paz",
    "Villa Sarmiento"
  ],
  "San Francisco": [
    "Centro",
    "San Martín",
    "Villa del Rosario"
  ],
  "Villa María": [
    "Centro",
    "San Martín",
    "Villa Nueva"
  ]
};

// Constante para la site key de reCAPTCHA (esta es pública y se puede poner en el código)
const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Esta es una clave de prueba

export default function RegistrationForm() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
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
    form.setValue("captcha", value || "");
  };

  // Limpiar barrio cuando cambie la ciudad
  const ciudadSeleccionada = form.watch("ciudad");
  useEffect(() => {
    if (ciudadSeleccionada) {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    alert("Formulario enviado exitosamente");
    console.log(values);
  }

  return (
    <div className="w-full">
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
                          placeholder="Montenegro" 
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
                          placeholder="Matías" 
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
                          placeholder="41521820" 
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
                          placeholder="41521820" 
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <SelectTrigger className="w-20 rounded-xl border-border bg-input h-12">
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
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="351" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
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
                              placeholder="6896329" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <FormLabel className="text-foreground font-medium">Confirmar Celular*</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="confirmarCodigoPais"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-20 rounded-xl border-border bg-input h-12">
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
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="351" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
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
                              placeholder="6896329" 
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
                          placeholder="matiasdanielmontenegro@gmail.com" 
                          type="email"
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
                              placeholder="18" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
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
                              placeholder="08" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
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
                              placeholder="1998" 
                              {...field} 
                              className="rounded-xl border-border bg-input h-12"
                            />
                          </FormControl>
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
                      <FormLabel className="text-foreground font-medium">Ciudad*</FormLabel>
                      <Popover>
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
                                ? ciudades.find((ciudad) => ciudad === field.value)
                                : "Selecciona tu ciudad"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar ciudad..." />
                            <CommandList>
                              <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                              <CommandGroup>
                                {ciudades.map((ciudad) => (
                                  <CommandItem
                                    value={ciudad}
                                    key={ciudad}
                                    onSelect={() => {
                                      form.setValue("ciudad", ciudad);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        ciudad === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {ciudad}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
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
                    const barriosDisponibles = ciudadSeleccionada ? barriosPorCiudad[ciudadSeleccionada as keyof typeof barriosPorCiudad] || [] : [];
                    
                    return (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Barrio*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={!ciudadSeleccionada}
                                className={cn(
                                  "w-full justify-between rounded-xl border-border bg-input h-12",
                                  !field.value && "text-muted-foreground",
                                  !ciudadSeleccionada && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {field.value
                                  ? barriosDisponibles.find((barrio) => barrio === field.value)
                                  : ciudadSeleccionada ? "Selecciona tu barrio" : "Selecciona una ciudad primero"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar barrio..." />
                              <CommandList>
                                <CommandEmpty>No se encontró el barrio.</CommandEmpty>
                                <CommandGroup>
                                  {barriosDisponibles.map((barrio) => (
                                    <CommandItem
                                      value={barrio}
                                      key={barrio}
                                      onSelect={() => {
                                        form.setValue("barrio", barrio);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          barrio === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {barrio}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
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
                          className="text-primary hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            // Aquí puedes abrir un modal o navegar a los términos
                            alert("Aquí se abrirían los términos y condiciones");
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

              {/* Google reCAPTCHA y botón enviar */}
              <div className="pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-auto">
                        <FormControl>
                          <div className="h-[78px] flex items-center justify-center sm:justify-start">
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={RECAPTCHA_SITE_KEY}
                              onChange={handleCaptchaChange}
                              theme="light"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-gradient-to-b from-[#832B99] via-[#7A2A8A] via-[#6F297A] via-[#64286A] to-[#59275A] hover:from-[#7A2A8A] hover:to-[#64286A] text-white font-bold px-8 py-6 rounded-xl h-[78px] min-w-[120px] transition-all duration-300"
                  >
                    ENVIAR
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
