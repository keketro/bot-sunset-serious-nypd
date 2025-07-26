const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  getModalPart3() {
    return new ModalBuilder()
      .setCustomId('modal_casier_3')
      .setTitle('📝 Casier Judiciaire - Partie 3')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('agent')
            .setLabel("Nom Prénom | Matricule de l'officier")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );
  }
};
