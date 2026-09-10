// Este archivo se encarga de toda la comunicacion con api-football.
// Usa el "fetch" que ya viene incluido en Node 18+, no hace falta instalar nada extra.

const BASE_URL = 'https://v3.football.api-sports.io';

function headers() {
  return {
    'x-apisports-key': process.env.API_FOOTBALL_KEY,
  };
}

async function apiGet(path, params = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, { headers: headers() });

  if (!response.ok) {
    throw new Error(`Error de la API (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`La API devolvio un error: ${JSON.stringify(data.errors)}`);
  }

  return data.response;
}

// Trae los partidos entre dos fechas (formato YYYY-MM-DD) del torneo configurado.
async function getFixturesBetween(from, to) {
  return apiGet('/fixtures', {
    league: process.env.LEAGUE_ID,
    season: process.env.SEASON,
    from,
    to,
  });
}

// Trae los ultimos "n" partidos ya finalizados del torneo.
async function getLastResults(n = 10) {
  return apiGet('/fixtures', {
    league: process.env.LEAGUE_ID,
    season: process.env.SEASON,
    last: n,
  });
}

// Trae la tabla de posiciones actual.
async function getStandings() {
  const response = await apiGet('/standings', {
    league: process.env.LEAGUE_ID,
    season: process.env.SEASON,
  });
  if (!response.length) return [];
  return response[0].league.standings[0];
}

// Busca un equipo por nombre dentro del torneo configurado.
async function findTeam(name) {
  const teams = await apiGet('/teams', {
    league: process.env.LEAGUE_ID,
    season: process.env.SEASON,
    search: name,
  });
  return teams[0] || null;
}

// Trae el ultimo partido jugado y el proximo partido de un equipo.
async function getTeamContext(teamId) {
  const [last, next] = await Promise.all([
    apiGet('/fixtures', {
      league: process.env.LEAGUE_ID,
      season: process.env.SEASON,
      team: teamId,
      last: 1,
    }),
    apiGet('/fixtures', {
      league: process.env.LEAGUE_ID,
      season: process.env.SEASON,
      team: teamId,
      next: 1,
    }),
  ]);
  return { last: last[0] || null, next: next[0] || null };
}

module.exports = {
  getFixturesBetween,
  getLastResults,
  getStandings,
  findTeam,
  getTeamContext,
};
