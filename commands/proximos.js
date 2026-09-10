const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../api');

function formatFecha(fecha, hora) {
  if (!fecha) return 'Fecha a confirmar';
  const texto = hora ? `${fecha} ${hora}` : fecha;
  return new Date(texto).toLocaleString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

module.exports = {
  data: new SlashCommandBuilder().setName('proximos').setDescription('Muestra los proximos partidos del torneo'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const partidos = await api.getProximosPartidos();

      if (!partidos.length) {
        await interaction.editReply('No encontre proximos partidos programados por ahora.');
        return;
      }

      const lineas = partidos.map((p) => {
        return `**${p.strHomeTeam}** vs **${p.strAwayTeam}** — ${formatFecha(p.dateEvent, p.strTime)}`;
      });

      let descripcion = lineas.join('\n');
      if (descripcion.length > 4000) {
        descripcion = descripcion.slice(0, 4000) + '\n... (hay mas partidos de los que entran aca)';
      }

      const embed = new EmbedBuilder().setTitle('Proximos partidos').setDescription(descripcion).setColor(0x2ecc71);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando los partidos. Intenta de nuevo en un rato.');
    }
  },
};
