# Configuración de Google reCAPTCHA

## ⚠️ IMPORTANTE: Seguridad de Claves

**La SECRET_KEY de reCAPTCHA NUNCA debe estar en el frontend por seguridad.**

### 🔑 Claves y su Uso

#### **SITE_KEY (Frontend - Pública)**
- **Ubicación**: `src/config/recaptcha.ts`
- **Propósito**: Clave pública para mostrar el widget de reCAPTCHA
- **Seguridad**: Es segura de exponer públicamente

#### **SECRET_KEY (Backend - Privada)**
- **Ubicación**: Solo en el servidor backend
- **Propósito**: Verificar tokens de reCAPTCHA
- **Seguridad**: NUNCA incluir en el frontend

## 📁 Archivos de Configuración

### 1. `src/config/recaptcha.ts` (Frontend)
```typescript
export const RECAPTCHA_CONFIG = {
  SITE_KEY: "6LeahLorAAAAAD8QRpqn948XmeeOLpo6yulS6T6_",
  THEME: "light",
  SIZE: "normal",
  BADGE: "bottomright"
};
```

### 2. Backend (Variables de Entorno)
```bash
# .env del backend
RECAPTCHA_SECRET_KEY=6LeahLorAAAAAEptZdDAbwR6Gc-6LRJiPTLSS2Wv
```

## 🚀 Implementación

### Frontend (React)
```typescript
import { RECAPTCHA_CONFIG } from "../config/recaptcha";

<ReCAPTCHA
  sitekey={RECAPTCHA_CONFIG.SITE_KEY}
  onChange={handleCaptchaChange}
  theme={RECAPTCHA_CONFIG.THEME}
  size={RECAPTCHA_CONFIG.SIZE}
/>
```

### Backend (Node.js/Express)
```typescript
import { verify } from 'recaptcha2';

const recaptcha = new Recaptcha2({
  secretKey: process.env.RECAPTCHA_SECRET_KEY
});

// Verificar token
const isValid = await recaptcha.validate(token);
```

## 🔒 Seguridad

- ✅ **SITE_KEY**: Segura en el frontend
- ❌ **SECRET_KEY**: NUNCA en el frontend
- ✅ **Verificación**: Solo en el backend
- ✅ **Tokens**: Se envían al backend para validación

## 📝 Notas

- El frontend solo maneja la SITE_KEY para mostrar el widget
- La verificación del reCAPTCHA se hace en el backend
- Los tokens se envían desde el frontend al backend
- El backend valida con Google usando la SECRET_KEY
