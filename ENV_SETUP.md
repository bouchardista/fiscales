# Configuración de Variables de Entorno

## 📁 Archivos de Configuración

### 1. `env.example` (Plantilla)
Este archivo contiene todas las variables necesarias como plantilla.

### 2. `.env` (Local - No se commitea)
Copia `env.example` a `.env` y llena los valores reales.

### 3. Variables en Vercel
Configura las mismas variables en tu proyecto de Vercel.

## 🔧 Variables Requeridas

### **Frontend (Vercel)**
```bash
# API Backend
VITE_API_BASE_URL=https://formregistrofiscales2025.onrender.com

# reCAPTCHA (Pública)
VITE_RECAPTCHA_SITE_KEY=6Ld-hborAAAAAMsK8JU8VVtUiSQeiZHYtP1KkS-S
```

### **Backend (NO en Vercel)**
```bash
# reCAPTCHA (Privada - Solo en tu servidor)
RECAPTCHA_SECRET_KEY=6Ld-hborAAAAAPAno4hzQFTk9YqoKgfVdIMWIR1a
```

## 🚀 Cómo Configurar

### **Localmente**
1. Copia `env.example` a `.env`
2. Llena los valores reales
3. Reinicia el servidor de desarrollo

### **En Vercel**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada variable:
   - `VITE_API_BASE_URL`
   - `VITE_RECAPTCHA_SITE_KEY`
4. Selecciona entornos: Production, Preview, Development
5. Save y redeploy

## 🔒 Seguridad

- ✅ **Frontend**: Solo claves públicas (VITE_*)
- ❌ **Backend**: Solo claves secretas
- ✅ **Separación**: Clara de responsabilidades
- ✅ **Protección**: Información sensible resguardada

## 📝 Notas

- Las variables que empiezan con `VITE_` son accesibles en el frontend
- Las variables sin `VITE_` solo están disponibles en el servidor
- El archivo `.env` NO se commitea por seguridad
- Usa `env.example` como plantilla para otros desarrolladores
