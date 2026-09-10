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
    .setName('proximos')
    .setDescription('Muestra los proximos partidos del torneo')
    .addIntegerOption((option) =>
      option
        .setName('dias')
        .setDescription('Cuantos dias hacia adelante buscar (por defecto 7)')
        .setMinValue(1)
        .setMaxValue(60)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const dias = interaction.options.getInteger('dias') || 7;
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    const from = hoy.toISOString().slice(0, 10);
    const to = limite.toISOString().slice(0, 10);

    try {
      const fixtures = await api.getFixturesBetween(from, to);

      if (!fixtures.length) {
        await interaction.editReply(`No encontre partidos programados entre hoy y los proximos ${dias} dias.`);
        return;
      }

      const lineas = fixtures.map((f) => {
        const local = f.teams.home.name;
        const visitante = f.teams.away.name;
        return `**${local}** vs **${visitante}** — ${formatFecha(f.fixture.date)}`;
      });

      // Discord limita los embeds a 4096 caracteres en la descripcion, cortamos si hace falta.
      let descripcion = lineas.join('\n');
      if (descripcion.length > 4000) {
        descripcion = descripcion.slice(0, 4000) + '\n... (hay mas partidos de los que entran aca)';
      }

      const embed = new EmbedBuilder()
        .setTitle(`Proximos partidos (${dias} dias)`)
        .setDescription(descripcion)
        .setColor(0x2ecc71);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando los partidos. Intenta de nuevo en un rato.');
    }
  },
};
