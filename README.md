# Bot en desarrollo de la UTN Facultad Regional Mendoza

Bot desarrollado por y para estudiantes de la facultad, facilitando horarios de cursado por comisión, por materia, mesas de una materia, respondiendo en lenguaje natural gracias a la integración con IA.


---

## Tecnologías Utilizadas

- **TypeScript** → Código tipado para mayor seguridad y mantenimiento.
- **Node.js** → Backend ligero y escalable.
- **NestJS** → Framework modular para la API.
- **Next.js** → Interfaz web opcional para administración.
- **OpenAI** → Integración con IA para responder dudas académicas.
- **Baileys** → Comunicación con WhatsApp.
- **SQLite / MySQL / PostgreSQL / Firebase** → Base de datos para almacenar horarios.


---

## Requisitos Previos

- Node.js ≥ 14
- npm o pnpm instalados a nivel global

---

## Instalación y Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/tu_usuario/whatsapp-bot.git
   cd whatsapp-bot
   ```

2. **Instalar dependencias**:

   - Con **npm**:
     ```bash
     npm install
     ```
   - Con **pnpm**:
     ```bash
     pnpm install
     ```

3. **Configurar variables de entorno**:

   Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

   ```bash
   WHATSAPP_SESSION=tu_sesion
   DATABASE_URL=sqlite://horarios.db # O la conexión a MySQL/PostgreSQL
   OPENAI_API_KEY=tu_api_key
   ```

4. **Ejecutar el bot**:

   - Con **npm**:
     ```bash
     npm run start
     ```
   - Con **pnpm**:
     ```bash
     pnpm run start
     ```

---


## Futuras Mejoras

- **Mejora de respuestas con OpenAI** para un mayor soporte académico.

---

## Cómo Contribuir

1. Hacer un **fork** del repositorio.
2. Crear una nueva rama:
   ```bash
   git checkout -b mi-feature
   ```
3. Realizar los cambios y hacer commit:
   ```bash
   git commit -m "Descripción de la mejora"
   ```
4. Subir la rama:
   ```bash
   git push origin mi-feature
   ```
5. Crear un **Pull Request** en GitHub.

---
