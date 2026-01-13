# 🎮 Sala de Juegos (NoliGames)

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Plataforma interactiva de minijuegos desarrollada con **Angular (Standalone Components)** y **Supabase**. Este proyecto demuestra la integración de autenticación robusta, manejo de bases de datos en tiempo real y lógica de juegos interactiva, con un enfoque en la escalabilidad y buenas prácticas de seguridad.

🔗 **[VER DEMO ONLINE AQUÍ](https://sala-de-juegos-seven.vercel.app)**

## 🚀 Características Principales

Esta aplicación no es solo una colección de juegos; es una implementación completa de una SPA (Single Page Application) moderna:

* **🔐 Autenticación Segura:** Registro y Login persistente utilizando *Supabase Auth*.
* **📡 Base de Datos en Tiempo Real:** Los puntajes y el Chat se actualizan instantáneamente (WebSockets).
* **🛡️ Route Guards:** Protección de rutas para usuarios no autenticados (AuthGuard) y control de acceso basado en edad o roles (AgeGuard).
* **🎨 UI/UX Responsiva:** Diseño adaptable a diferentes dispositivos.

## 🕹️ Catálogo de Juegos

1.  **Ahorcado:** Clásico juego de palabras con lógica de control de intentos e imágenes dinámicas.
2.  **Mayor o Menor:** Juego de cartas probabilístico.
3.  **Preguntados:** Trivia de cultura general consumiendo API externa / base de datos local.
4.  **Adivina el Número:** Desafío de lógica matemática y rapidez.

## 🛠️ Stack Tecnológico

* **Frontend:** Angular 17+ (Diseño basado en Componentes Standalone, Servicios inyectables, Signals/Observables).
* **Backend as a Service (BaaS):** Supabase (PostgreSQL).
* **Estilos:** CSS3 nativo (Grid/Flexbox) con diseño modular.
* **Control de Versiones:** Git & GitHub.
* **Despliegue (CI/CD):** Vercel.

## 🔐 Enfoque de Seguridad (Security by Design)

Como parte de mi formación profesional, este proyecto implementa medidas de seguridad básicas:

* **Gestión de Entornos:** Separación de credenciales de producción y desarrollo.
* **Validación de Inputs:** Servicios dedicados (`ValidateService`) para sanitizar y verificar entradas de usuario antes de enviarlas al backend.
* **Row Level Security (RLS):** Políticas de seguridad en la base de datos PostgreSQL para asegurar que los usuarios solo puedan modificar sus propios registros.

## 🏁 Instalación Local

Si deseas correr este proyecto en tu máquina:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/NoeStorg4to/sala-de-juegos.git](https://github.com/NoeStorg4to/sala-de-juegos.git)
    cd sala-de-juegos
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo de entorno o modifica `src/environments/environment.ts` con tus credenciales de Supabase.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`.

## 🧪 Credenciales de Prueba (Demo)

Para facilitar la revisión, puedes usar este usuario de prueba (o registrar uno nuevo):

* **Email:** `test@invitado.com` (o el que tú quieras poner)
* **Password:** `123456`

---
Desarrollado con 💙 por [Noelia] - Estudiante UTN
