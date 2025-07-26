client.on(Events.InteractionCreate, async interaction => {
  const userId = interaction.user.id;

  // Commandes slash
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'casier') {
      await interaction.reply({ content: 'Veuillez uploader une image (répondez ici).', ephemeral: true });

      const filter = m => m.author.id === userId && m.attachments.size > 0;
      const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

      collector.on('collect', async msg => {
        const image = msg.attachments.first();
        const bouton = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('continuer_officier').setLabel('Continuer').setStyle(ButtonStyle.Primary)
        );
        await interaction.followUp({ content: 'Image reçue. Cliquez sur "Continuer".', components: [bouton], ephemeral: true });
      });
    }

    else if (commandName === 'rapport_inter') {
      const modal = new ModalBuilder().setCustomId('modal_rapport').setTitle('Rapport Intervention').addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom_mat').setLabel('Nom Prénom | Matricule').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date_rap').setLabel('Date').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rapport').setLabel('Rapport d intervention').setStyle(TextInputStyle.Paragraph).setMaxLength(10000))
      );
      await interaction.showModal(modal);
    }

    else if (commandName === 'renforts') {
      const modal = new ModalBuilder().setCustomId('modal_renfort').setTitle('Demande de Renfort').addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom_mat').setLabel('Nom Prénom | Matricule').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('raison').setLabel('Raison de la demande').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('lieu').setLabel('Lieu de l intervention').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description rapide').setStyle(TextInputStyle.Paragraph).setMaxLength(4000))
      );
      await interaction.showModal(modal);
    }

    else if (commandName === 'setup_heures') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Tu n’as pas la permission.', ephemeral: true });
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('debut_service').setLabel('Début de service').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('fin_service').setLabel('Fin de service').setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ content: 'Clique sur un bouton ci-dessous pour gérer ton temps de service.', components: [row] });
    }
  }

  // Soumission de modal
  else if (interaction.isModalSubmit()) {
    const id = interaction.customId;

    if (id === 'modal_officier') {
      const nom = interaction.fields.getTextInputValue('nom_off');
      const mat = interaction.fields.getTextInputValue('matricule');
      const date = interaction.fields.getTextInputValue('datetime');

      const bouton2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('continuer_suspect').setLabel('Continuer').setStyle(ButtonStyle.Primary)
      );
      await interaction.reply({ content: 'Infos officier enregistrées. Continuer.', components: [bouton2], ephemeral: true });
    }

    else if (id === 'modal_suspect') {
      const bouton3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('continuer_dossier').setLabel('Continuer').setStyle(ButtonStyle.Primary)
      );
      await interaction.reply({ content: 'Infos suspect enregistrées. Continuer.', components: [bouton3], ephemeral: true });
    }
  }

  // Boutons
  else if (interaction.isButton()) {
    if (interaction.customId === 'continuer_officier') {
      const modal1 = new ModalBuilder().setCustomId('modal_officier').setTitle('Infos Officier').addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom_off').setLabel('Nom Prénom Officier').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('matricule').setLabel('Matricule').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datetime').setLabel('Date et heure').setStyle(TextInputStyle.Short))
      );
      await interaction.showModal(modal1);
    }

    else if (interaction.customId === 'continuer_suspect') {
      const modal2 = new ModalBuilder().setCustomId('modal_suspect').setTitle('Infos Suspect').addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom_sus').setLabel('Prénom & Nom Suspect').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('naissance').setLabel('Date de naissance').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('lieu_naissance').setLabel('Lieu de naissance').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('residence').setLabel('Lieu de résidence').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nationalite').setLabel('Nationalité').setStyle(TextInputStyle.Short))
      );
      await interaction.showModal(modal2);
    }

    else if (interaction.customId === 'debut_service') {
      timers.set(userId, Date.now());
      await interaction.reply({ content: 'Prise de service enregistrée.', ephemeral: true });
    }

    else if (interaction.customId === 'fin_service') {
      const start = timers.get(userId);
      if (!start) return interaction.reply({ content: 'Aucune prise de service détectée.', ephemeral: true });

      const end = Date.now();
      const duration = end - start;
      const h = Math.floor(duration / 3600000);
      const m = Math.floor((duration % 3600000) / 60000);
      const s = Math.floor((duration % 60000) / 1000);

      await interaction.reply({ content: `Durée du service : ${h} heures, ${m} minutes et ${s} secondes.`, ephemeral: true });
      timers.delete(userId);
    }
  }
});
