// Configuración de Google reCAPTCHA
// NOTA: Solo incluir la SITE_KEY en el frontend
// La SECRET_KEY debe estar solo en el backend por seguridad

export const RECAPTCHA_CONFIG = {
  // Site Key (clave pública para el frontend)
  SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Ld-hborAAAAAMsK8JU8VVtUiSQeiZHYtP1KkS-S",
  
  // Configuración adicional
  THEME: "light" as const, // "light" | "dark"
  SIZE: "normal" as const, // "normal" | "compact" | "invisible"
  BADGE: "bottomright" as const, // "bottomright" | "bottomleft" | "inline"
};

// Tipos para TypeScript
export type RecaptchaTheme = typeof RECAPTCHA_CONFIG.THEME;
export type RecaptchaSize = typeof RECAPTCHA_CONFIG.SIZE;
export type RecaptchaBadge = typeof RECAPTCHA_CONFIG.BADGE;
