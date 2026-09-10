const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../api');

function formatFecha(dateStr) {
  return new Date(dateStr).toLocaleString('es-AR', {
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
      option.setName('nombre').setDescription('Nombre del equipo, ej: Boca, River, Racing').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const nombre = interaction.options.getString('nombre');

    try {
      const equipo = await api.findTeam(nombre);

      if (!equipo) {
        await interaction.editReply(`No encontre ningun equipo llamado "${nombre}" en el torneo.`);
        return;
      }

      const { last, next } = await api.getTeamContext(equipo.team.id);

      const partes = [];

      if (last) {
        partes.push(
          `**Ultimo partido:** ${last.teams.home.name} ${last.goals.home ?? '-'} - ${last.goals.away ?? '-'} ${last.teams.away.name} (${formatFecha(last.fixture.date)})`
        );
      } else {
        partes.push('**Ultimo partido:** no encontrado.');
      }

      if (next) {
        partes.push(
          `**Proximo partido:** ${next.teams.home.name} vs ${next.teams.away.name} — ${formatFecha(next.fixture.date)}`
        );
      } else {
        partes.push('**Proximo partido:** no hay fecha confirmada todavia.');
      }

      const embed = new EmbedBuilder()
        .setTitle(equipo.team.name)
        .setThumbnail(equipo.team.logo)
        .setDescription(partes.join('\n\n'))
        .setColor(0x9b59b6);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando el equipo. Intenta de nuevo en un rato.');
    }
  },
};
