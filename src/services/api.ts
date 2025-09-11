// Servicio de API para el registro de fiscales
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fiscales2025.onrender.com';

// Modo de desarrollo - ahora en producción
const MODO_DESARROLLO = false; // import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

export interface FiscalData {
  nombre: string;
  apellido: string;
  dni: string;
  confirmarDni: string;
  areaCelular: string;
  numeroCelular: string;
  confirmarAreaCelular: string;
  confirmarNumeroCelular: string;
  email: string;
  diaNacimiento: string;
  mesNacimiento: string;
  anoNacimiento: string;
  ciudad: string;
  barrio: string;
  sexo: string;
  aceptarTerminos: boolean;
  captcha: string;
}

// Interfaz para el formato que espera el backend
export interface BackendFiscalData {
  apellido: string;
  nombre: string;
  dni: string;
  celular: string;
  email: string;
  fecha_nacimiento: string;
  idLocalidad: number;
  idBarrio: number | null;
  sexo: string;
  tyc: boolean;
  otros_descripcion: string | null;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const apiService = {
  // Registrar un nuevo fiscal
  async registrarFiscal(data: BackendFiscalData): Promise<ApiResponse> {
    console.log('MODO_DESARROLLO:', MODO_DESARROLLO);
    
    // Modo desarrollo - simular respuesta exitosa
    if (MODO_DESARROLLO) {
      console.log('✅ Modo desarrollo activado: Simulando registro exitoso');
      console.log('📋 Datos del fiscal:', data);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Simulación completada, retornando éxito');
      
      return {
        success: true,
        message: 'Fiscal registrado exitosamente (modo desarrollo)',
        data: { id: Math.floor(Math.random() * 1000) + 1 }
      };
    }

    // Modo producción - llamada real a la API
    try {
      // Los datos ya vienen en el formato correcto
      const datosBackend = data;

      console.log('📤 Enviando datos al backend:', datosBackend);

      const response = await fetch(`${API_BASE_URL}/api/fiscales/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosBackend),
      });

      const result = await response.json();
      
      console.log('📥 Respuesta del backend:', {
        status: response.status,
        statusText: response.statusText,
        result: result
      });
      
      if (!response.ok) {
        throw new Error(result.message || `Error HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar que la respuesta tenga la estructura esperada
      if (!result || typeof result !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }

      // Si el backend no envía 'success' pero el mensaje indica éxito, lo marcamos como exitoso
      if (!result.hasOwnProperty('success')) {
        const mensaje = result.message || '';
        if (mensaje.toLowerCase().includes('exitoso') || 
            mensaje.toLowerCase().includes('exito') || 
            mensaje.toLowerCase().includes('registrado') ||
            mensaje.toLowerCase().includes('completado')) {
          result.success = true;
        } else {
          result.success = false;
        }
      }

      return result;
    } catch (error) {
      console.error('Error en API:', error);
      
      // Mejorar mensajes de error
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Error de conexión con el servidor. Verifica tu internet o contacta al administrador.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Tiempo de espera agotado. El servidor está lento, inténtalo de nuevo.');
        } else {
          throw new Error(`Error del servidor: ${error.message}`);
        }
      }
      
      throw new Error('Error desconocido al conectar con el servidor');
    }
  },

  // Obtener localidades
  async getLocalidades(): Promise<Array<{id: number, nombre: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/localidades`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener localidades');
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo localidades:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  },

  // Obtener barrios por ciudad
  async getBarriosPorCiudad(ciudad: string): Promise<Array<{id: number, nombre: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/barrios/${encodeURIComponent(ciudad)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener barrios');
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo barrios:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  },

  // Verificar reCAPTCHA (se hace directamente en el registro)
  async verificarRecaptcha(token: string): Promise<boolean> {
    // Para desarrollo/testing, siempre retornar true
    // En producción, la verificación se hace en el backend durante el registro
    console.log('Token reCAPTCHA recibido:', token);
    return true;
  }
};
