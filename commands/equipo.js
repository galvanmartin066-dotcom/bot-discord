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
  data: new SlashCommandBuilder()
    .setName('equipo')
    .setDescription('Muestra el ultimo y proximo partido de un equipo')
    .addStringOption((option) =>
      option.setName('nombre').setDescription('Nombre del equipo, ej: Boca Juniors, River Plate').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const nombre = interaction.options.getString('nombre');

    try {
      const equipo = await api.buscarEquipo(nombre);

      if (!equipo) {
        await interaction.editReply(`No encontre ningun equipo llamado "${nombre}".`);
        return;
      }

      const { ultimo, proximo } = await api.getContextoEquipo(equipo.idTeam);
      const partes = [];

      if (ultimo) {
        partes.push(
          `**Ultimo partido:** ${ultimo.strHomeTeam} ${ultimo.intHomeScore ?? '-'} - ${ultimo.intAwayScore ?? '-'} ${ultimo.strAwayTeam} (${formatFecha(ultimo.dateEvent)})`
        );
      } else {
        partes.push('**Ultimo partido:** no encontrado.');
      }

      if (proximo) {
        partes.push(
          `**Proximo partido:** ${proximo.strHomeTeam} vs ${proximo.strAwayTeam} — ${formatFecha(proximo.dateEvent, proximo.strTime)}`
        );
      } else {
        partes.push('**Proximo partido:** no hay fecha confirmada todavia.');
      }

      const embed = new EmbedBuilder()
        .setTitle(equipo.strTeam)
        .setThumbnail(equipo.strTeamBadge || null)
        .setDescription(partes.join('\n\n'))
        .setColor(0x9b59b6);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando el equipo. Intenta de nuevo en un rato.');
    }
  },
};
