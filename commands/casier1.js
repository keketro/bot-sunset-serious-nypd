const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casier')
    .setDescription('Commencer le casier judiciaire (étape 1)'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_casier_1')
      .setTitle('📝 Casier Judiciaire - Partie 1')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('nom_prenom')
            .setLabel('Nom & Prénom Suspect')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('naissance')
            .setLabel('Date de naissance')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('lieu_naissance')
            .setLabel('Lieu de naissance')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('residence')
            .setLabel('Lieu de Résidence')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
  }
};
