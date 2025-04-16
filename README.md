# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Qualiver Chat Interface

Una interfaz web moderna para visualizar y gestionar conversaciones de WhatsApp integrada con n8n y Supabase.

## Características

- 💬 Visualización de conversaciones en tiempo real
- 🤖 Control de bot por conversación
- 🌓 Modo claro/oscuro
- 🔍 Búsqueda de conversaciones
- 📱 Diseño responsive
- ⚡ Actualizaciones en tiempo real con Supabase
- 🎨 Interfaz moderna y atractiva

## Requisitos previos

- Node.js 16 o superior
- Una cuenta en Supabase con las tablas necesarias
- Un webhook de n8n configurado

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd qualiver-whatsapp-interface
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de variables de entorno y configúralo:
```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Construcción para producción

Para construir la aplicación para producción:

```bash
npm run build
```

## Despliegue en Render

1. Conecta tu repositorio a Render
2. Crea un nuevo Web Service
3. Configura las variables de entorno en Render
4. Usa los siguientes comandos:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

## Estructura del proyecto

```
src/
  ├── components/        # Componentes React
  ├── lib/              # Utilidades y configuraciones
  ├── types/            # Tipos TypeScript
  ├── App.tsx           # Componente principal
  └── main.tsx          # Punto de entrada
```

## Tecnologías utilizadas

- React + TypeScript
- Tailwind CSS
- Supabase
- Vite
- HeadlessUI
- Hero Icons
- date-fns
