# Eco-chef Backend

Backend de la aplicación Eco-chef, construido con **Express.js**, **TypeScript** y **Prisma ORM**.

## 🚀 Características

- **API REST** con Express.js
- **Base de datos PostgreSQL** con Prisma ORM
- **Autenticación JWT** segura
- **Generación de recetas con IA** usando Groq

## 📋 Requisitos previos

- Node.js 18+
- npm o yarn
- PostgreSQL 12+ (o usar Prisma Postgres)
- API key de Groq

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env en la raíz del backend
DATABASE_URL=postgresql://user:password@localhost:5432/ecochefy
DIRECT_URL=postgresql://user:password@localhost:5432/ecochefy
GROQ_API_KEY=tu_api_key_aqui
JWT_SECRET=tu_secreto_jwt_aqui
PORT=3001
NODE_ENV=development
```

## 📦 Dependencias principales

- **express**: Framework web
- **prisma**: ORM para base de datos
- **typescript**: Tipado estático
- **jsonwebtoken**: Autenticación
- **groq-sdk**: Cliente de Groq para IA
- **dotenv**: Variables de entorno
- **cors**: Control de origen cruzado

## 🏃 Ejecutar en desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 🏗️ Build para producción

```bash
npm run build
npm run start
```

## 📁 Estructura del proyecto

```
back/
├── src/
│   ├── index.ts                 # Punto de entrada
│   ├── prisma.ts                # Cliente Prisma
│   ├── controllers/             # Controladores
│   │   ├── auth.controller.ts   # Autenticación
│   │   └── recipes.controller.ts # Gestión de recetas
│   ├── routes/                  # Rutas API
│   │   ├── auth.routes.ts       # Rutas de auth
│   │   └── recipes.routes.ts    # Rutas de recetas
│   ├── middlewares/             # Middlewares
│   │   └── auth.middleware.ts   # Middleware JWT
│   ├── services/                # Servicios
│   │   └── groqService.ts       # Integración con Groq
│   └── utils/                   # Utilidades
│       └── logger.ts            # Logging
├── prisma/
│   ├── schema.prisma            # Esquema de BD
│   └── migrations/              # Migraciones
├── dist/                        # Código compilado
├── package.json
├── tsconfig.json
└── .env                         # Variables de entorno
```

## 🗄️ Base de datos

### Modelos principales

#### User
```typescript
- id: String (PK)
- email: String (unique)
- password: String (hash)
- name: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Recipe
```typescript
- id: String (PK)
- spoonacularId: String (unique)
- title: String
- description: String
- ingredients: String[]
- ingredientMeasures: Json (medidas detalladas)
- instructions: String[]
- readyInMinutes: Int
- type: String
- image: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### SavedRecipe
```typescript
- id: String (PK)
- userId: String (FK)
- recipeId: String
- title: String
- image: String
- savedAt: DateTime
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Recetas
- `POST /api/recipes/buscar` - Buscar/generar recetas por ingredientes
- `POST /api/recipes/guardar` - Guardar receta
- `GET /api/recipes/:userId` - Obtener recetas guardadas del usuario
- `GET /api/recipes/detalle/:id` - Obtener detalles de receta
- `DELETE /api/recipes` - Eliminar receta guardada
- `GET /api/recipes/todas` - Obtener todas las recetas (admin)

## 🤖 Integración con Groq

El servicio de Groq genera recetas basadas en ingredientes:

```typescript
// Entrada
const ingredients = ["pollo", "tomate", "cebolla"];

// Salida
interface GeneratedRecipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[]; // Con cantidades
  ingredientMeasures: Array<{
    name: string;
    amount: number;
    unit: string; // piezas, gramos, tazas, etc.
  }>;
  instructions: string[]; // 5-7 pasos detallados
  readyInMinutes: number;
  type: string;
  image: string;
}
```

## 🔐 Autenticación

Usa **JWT (JSON Web Tokens)**:
- Token incluido en header: `Authorization: Bearer <token>`
- Expiración configurable
- Middleware de protección en rutas privadas

## 📝 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | postgresql://... |
| `DIRECT_URL` | URL directa a BD (Prisma Postgres) | postgresql://... |
| `GROQ_API_KEY` | API key de Groq | gsk_... |
| `JWT_SECRET` | Secreto para JWT | secreto_super_seguro |
| `PORT` | Puerto del servidor | 3001 |
| `NODE_ENV` | Entorno | development, production |

## 📄 Licencia

© 2026 Eco-chef.