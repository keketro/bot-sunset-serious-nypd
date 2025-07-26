const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rapport_inter')
    .setDescription("Créer un rapport d'intervention"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_rapport')
      .setTitle('Rapport Intervention')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('nom_mat').setLabel('Nom Prénom | Matricule').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('date_rap').setLabel('Date').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('rapport').setLabel("Rapport d'intervention").setStyle(TextInputStyle.Paragraph)
        )
      );

    await interaction.showModal(modal);
  }
};
