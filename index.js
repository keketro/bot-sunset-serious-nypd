require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
  REST,
  Routes,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');

const { getModalPart2 } = require('./casier2');
const { getModalPart3 } = require('./casier3');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.commands = new Collection();
const pendingCasier = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
const commandsData = [];

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && typeof command.execute === 'function') {
    client.commands.set(command.data.name, command);
    commandsData.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log(`🔄 Déploiement de ${commandsData.length} commande(s) slash...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandsData }
    );
    console.log('✅ Commandes déployées.');
  } catch (err) {
    console.error('❌ Déploiement échoué :', err);
  }
})();

client.on(Events.InteractionCreate, async interaction => {
  const userId = interaction.user.id;

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
  }

  else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'modal_renfort') {
      const command = client.commands.get('renforts');
      if (command && typeof command.handleModal === 'function') {
        await command.handleModal(interaction);
      }
    }

    else if (interaction.customId === 'modal_casier_1') {
      pendingCasier.set(userId, {
        nom: interaction.fields.getTextInputValue('nom_prenom'),
        naissance: interaction.fields.getTextInputValue('naissance'),
        lieu_naissance: interaction.fields.getTextInputValue('lieu_naissance'),
        residence: interaction.fields.getTextInputValue('residence')
      });

      await interaction.reply({
        content: '✅ Étape 1 enregistrée. Clique pour continuer.',
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_partie2').setLabel('Étape 2').setStyle(ButtonStyle.Primary)
        )],
        flags: MessageFlags.Ephemeral
      });
    }

    else if (interaction.customId === 'modal_casier_2') {
      const part1 = pendingCasier.get(userId);
      if (!part1) return;

      pendingCasier.set(userId, {
        ...part1,
        nationalite: interaction.fields.getTextInputValue('nationalite'),
        inculpation: interaction.fields.getTextInputValue('inculpation'),
        amende: parseFloat(interaction.fields.getTextInputValue('amende')),
        prison: parseFloat(interaction.fields.getTextInputValue('prison'))
      });

      await interaction.reply({
        content: '✅ Étape 2 enregistrée. Clique pour continuer.',
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_partie3').setLabel('Étape 3').setStyle(ButtonStyle.Success)
        )],
        flags: MessageFlags.Ephemeral
      });
    }

    else if (interaction.customId === 'modal_casier_3') {
      const data = pendingCasier.get(userId);
      if (!data) return;

      data.agent = interaction.fields.getTextInputValue('agent');

      const coefRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_severite')
          .setPlaceholder('Choisis la sévérité')
          .addOptions([
            { label: 'Minimale', description: 'Coopératif — peines ÷ 2', value: 'minimale' },
            { label: 'Nominale', description: 'Standard', value: 'nominale' },
            { label: 'Maximale', description: 'Non-coopératif — peines × 2', value: 'maximale' }
          ])
      );

      pendingCasier.set(userId, data);

      await interaction.reply({
        content: '📊 Choisis la sévérité de la sanction.',
        components: [coefRow],
        flags: MessageFlags.Ephemeral
      });
    }

    else if (interaction.customId === 'modal_rapport') {
      const nomMat = interaction.fields.getTextInputValue('nom_mat');
      const date = interaction.fields.getTextInputValue('date_rap');
      const rapport = interaction.fields.getTextInputValue('rapport');

      const embed = new EmbedBuilder()
        .setTitle('📄 Rapport d’intervention')
        .setColor(0x1A1154)
        .addFields(
          { name: '👮 Agent', value: nomMat },
          { name: '📅 Date', value: date },
          { name: '📝 Rapport', value: rapport }
        )
        .setTimestamp();

      await interaction.reply({ content: '✅ Rapport envoyé avec succès !', flags: MessageFlags.Ephemeral });
      await interaction.channel.send({ embeds: [embed] });
    }
  }

  else if (interaction.isButton()) {
    if (interaction.customId === 'btn_partie2') {
      const modal = getModalPart2();
      await interaction.showModal(modal);
    }

    if (interaction.customId === 'btn_partie3') {
      const modal = getModalPart3();
      await interaction.showModal(modal);
    }
  }

  else if (interaction.isStringSelectMenu() && interaction.customId === 'select_severite') {
    const data = pendingCasier.get(userId);
    if (!data) return;

    const severite = interaction.values[0];
    const coef = severite === 'minimale' ? 0.5 : severite === 'maximale' ? 2 : 1;
    const label = severite === 'minimale' ? '🟢 Coopératif' :
                  severite === 'maximale' ? '🔴 Non-coopératif' : '🟡 Standard';

    const embed = new EmbedBuilder()
      .setTitle('📂 Nouveau Casier Judiciaire')
      .setColor(0x1A1154)
      .addFields(
        { name: '👤 Nom & Prénom Suspect', value: data.nom },
        { name: '🎂 Date de naissance', value: data.naissance },
        { name: '📍 Lieu de naissance', value: data.lieu_naissance },
        { name: '🏠 Résidence', value: data.residence },
        { name: '🌐 Nationalité', value: data.nationalite },
        { name: '⚖️ Chef(s) d’inculpation(s)', value: data.inculpation },
        { name: '💰 Amende', value: `${Math.round(data.amende * coef)} €`, inline: true },
        { name: '⏱️ Prison', value: `${Math.round(data.prison * coef)} années`, inline: true },
        { name: '👮 Officier', value: data.agent },
        { name: '📌 Sévérité', value: label }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    pendingCasier.delete(userId);
  }
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);
