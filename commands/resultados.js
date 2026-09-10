const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resultados')
    .setDescription('Muestra los ultimos resultados del torneo')
    .addIntegerOption((option) =>
      option
        .setName('cantidad')
        .setDescription('Cuantos partidos mostrar (por defecto 10)')
        .setMinValue(1)
        .setMaxValue(30)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const cantidad = interaction.options.getInteger('cantidad') || 10;

    try {
      const fixtures = await api.getLastResults(cantidad);

      if (!fixtures.length) {
        await interaction.editReply('No encontre resultados recientes.');
        return;
      }

      const lineas = fixtures.map((f) => {
        const local = f.teams.home.name;
        const visitante = f.teams.away.name;
        const golesLocal = f.goals.home ?? '-';
        const golesVisitante = f.goals.away ?? '-';
        return `**${local}** ${golesLocal} - ${golesVisitante} **${visitante}**`;
      });

      const embed = new EmbedBuilder()
        .setTitle('Ultimos resultados')
        .setDescription(lineas.join('\n'))
        .setColor(0x3498db);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando los resultados. Intenta de nuevo en un rato.');
    }
  },
};
