const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  getModalPart2() {
    return new ModalBuilder()
      .setCustomId('modal_casier_2')
      .setTitle('📝 Casier Judiciaire - Partie 2')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('nationalite')
            .setLabel('Nationalité')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('inculpation')
            .setLabel("Chef(s) d'inculpation(s)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('amende')
            .setLabel('Amende (€)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('prison')
            .setLabel('Prison (années)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );
  }
};
