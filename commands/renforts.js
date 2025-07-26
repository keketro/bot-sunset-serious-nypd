const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup_heures')
    .setDescription("Permet de gérer le temps de service"),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('debut_service').setLabel('Début de service').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('fin_service').setLabel('Fin de service').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: '🕒 Gère ton temps de service :',
      components: [row],
      ephemeral: true // permet de l’afficher seulement pour l’utilisateur
    });
  }
};
