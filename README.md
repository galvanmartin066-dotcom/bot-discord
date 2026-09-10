# Bot de futbol argentino para Discord

## Que hace
- `/proximos [dias]` — partidos desde hoy hasta X dias (por defecto 7)
- `/resultados [cantidad]` — ultimos resultados
- `/tabla` — tabla de posiciones
- `/equipo <nombre>` — ultimo y proximo partido de un equipo
- Si configuras `CHANNEL_ID`, todos los dias a las 10:00 (hora Argentina) manda automaticamente los partidos del dia a ese canal.

## Datos que necesitas antes de subirlo (los vamos completando juntos)
- `DISCORD_TOKEN`: token del bot (Developer Portal > tu app > Bot)
- `CLIENT_ID`: Developer Portal > tu app > General Information > "Application ID"
- `GUILD_ID`: ID de tu servidor de Discord (con "Modo desarrollador" activado en Discord: Ajustes > Avanzado, despues click derecho sobre el icono del server > "Copiar ID de servidor")
- `API_FOOTBALL_KEY`: tu clave de dashboard.api-football.com
- `LEAGUE_ID`: 128 = Liga Profesional Argentina (dejalo asi salvo que quieras otro torneo)
- `SEASON`: el anio de la temporada, ej 2026
- `CHANNEL_ID` (opcional): ID del canal para el resumen diario

## Pasos para subirlo (con Railway)
1. Subi esta carpeta a un repositorio nuevo en GitHub.
2. Entra a railway.app, iniciar sesion con GitHub, "New Project" > "Deploy from GitHub repo" > elegi el repositorio.
3. En la pestaña "Variables" del proyecto en Railway, cargá todas las variables de arriba (las mismas que estan en `.env.example`, pero con los valores reales).
4. Una sola vez, hay que "avisarle" a Discord que existen los comandos. Esto se hace corriendo `npm run deploy-commands`. En Railway podes hacerlo desde la pestaña de la terminal del servicio, o lo corremos juntos localmente si preferis.
5. Railway va a instalar las dependencias solo y correr `npm start` automaticamente. Si el token y las variables estan bien cargadas, el bot va a aparecer "En linea" en tu servidor de Discord.

No hace falta tocar nada del codigo para que funcione — solo completar las variables de entorno.
