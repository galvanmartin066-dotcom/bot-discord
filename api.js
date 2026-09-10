const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

let ligaIdCache = null;

async function apiGet(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error de la API (${response.status})`);
  }
  return response.json();
}

async function getLigaId() {
  if (ligaIdCache) return ligaIdCache;

  const data = await apiGet(`/search_all_leagues.php?c=Argentina&s=Soccer`);
  const ligas = data.countrys || [];
  const encontrada = ligas.find((l) => {
    const nombre = (l.strLeague || '').toLowerCase();
    return nombre.includes('primera') || nombre.includes('profesional');
  });

  if (!encontrada) {
    throw new Error('No se pudo encontrar el ID de la Liga Profesional Argentina en TheSportsDB.');
  }

  ligaIdCache = encontrada.idLeague;
  return ligaIdCache;
}

async function getProximosPartidos() {
  const id = await getLigaId();
  const data = await apiGet(`/eventsnextleague.php?id=${id}`);
  return data.events || [];
}

async function getUltimosResultados() {
  const id = await getLigaId();
  const data = await apiGet(`/eventspastleague.php?id=${id}`);
  return data.events || [];
}

async function getTabla(season) {
  const id = await getLigaId();
  const data = await apiGet(`/lookuptable.php?l=${id}&s=${season}`);
  return data.table || [];
}

async function buscarEquipo(nombre) {
  const data = await apiGet(`/searchteams.php?t=${encodeURIComponent(nombre)}`);
  const equipos = data.teams || [];
  return equipos.find((e) => e.strSport === 'Soccer') || null;
}

async function getContextoEquipo(teamId) {
  const [ultimos, proximos] = await Promise.all([
    apiGet(`/eventslast.php?id=${teamId}`),
    apiGet(`/eventsnext.php?id=${teamId}`),
  ]);
  return {
    ultimo: (ultimos.results || [])[0] || null,
    proximo: (proximos.events || [])[0] || null,
  };
}

module.exports = {
  getProximosPartidos,
  getUltimosResultados,
  getTabla,
  buscarEquipo,
  getContextoEquipo,
};
