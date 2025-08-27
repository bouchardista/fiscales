import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

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
  captcha: z.boolean().refine((val) => val === true, "Debe confirmar que no es un robot"),
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

const barrios = [
  "Centro",
  "Nueva Córdoba", 
  "Güemes",
  "General Paz",
  "Alberdi",
  "Barrio Norte",
  "Cerro de las Rosas"
];

export default function RegistrationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoPais: "+54",
      confirmarCodigoPais: "+54",
      captcha: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Formulario enviado exitosamente",
      description: "Sus datos han sido registrados correctamente.",
    });
    console.log(values);
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
                  <FormLabel className="text-foreground font-medium">Fecha de nacimiento</FormLabel>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border bg-input h-12">
                            <SelectValue placeholder="Selecciona tu ciudad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ciudades.map((ciudad) => (
                            <SelectItem key={ciudad} value={ciudad}>
                              {ciudad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barrio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Barrio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border bg-input h-12">
                            <SelectValue placeholder="Selecciona tu barrio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {barrios.map((barrio) => (
                            <SelectItem key={barrio} value={barrio}>
                              {barrio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
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

              {/* Captcha y botón enviar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="captcha"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label className="text-sm font-medium">
                          No soy un robot
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-xl h-12 min-w-[120px]"
                >
                  ENVIAR
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}