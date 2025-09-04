// Archivo de ejemplo para configuración de reCAPTCHA
// NOTA: La SECRET_KEY solo debe estar en el backend, NO en el frontend

export const RECAPTCHA_CONFIG = {
  // Site Key (clave pública para el frontend)
  SITE_KEY: "6Ld-hborAAAAAMsK8JU8VVtUiSQeiZHYtP1KkS-S",
  
  // NOTA: SECRET_KEY se maneja en el backend
  // NO incluir aquí por seguridad
  
  // Configuración adicional
  THEME: "light" as const, // "light" | "dark"
  SIZE: "normal" as const, // "normal" | "compact" | "invisible"
  BADGE: "bottomright" as const, // "bottomright" | "bottomleft" | "inline"
};

// Tipos para TypeScript
export type RecaptchaTheme = typeof RECAPTCHA_CONFIG.THEME;
export type RecaptchaSize = typeof RECAPTCHA_CONFIG.SIZE;
export type RecaptchaBadge = typeof RECAPTCHA_CONFIG.BADGE;
