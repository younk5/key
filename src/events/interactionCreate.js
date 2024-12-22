const Key = require('../database/models/key');
const { createStatusEmbed, createButtons } = require('../utils/embedCreator');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: '❌ Ocorreu um erro ao executar o comando!',
                    ephemeral: true 
                });
            }
        }

        if (interaction.isButton()) {
            const [action, userId] = interaction.customId.split('_');
            const key = await Key.findOne({ userId });

            switch (action) {
                case 'pause':
                    if (key.isPaused) {
                        const pausedTime = Date.now() - key.pausedAt;
                        key.expiresAt = new Date(key.expiresAt.getTime() + pausedTime);
                        key.isPaused = false;
                        key.pausedAt = null;
                    } else {
                        key.isPaused = true;
                        key.pausedAt = new Date();
                        key.remainingTime = key.expiresAt - Date.now();
                    }
                    break;
                case 'addDay':
                    key.expiresAt = new Date(key.expiresAt.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case 'removeDay':
                    key.expiresAt = new Date(key.expiresAt.getTime() - 24 * 60 * 60 * 1000);
                    break;
            }

            await key.save();
            await interaction.update({ 
                embeds: [createStatusEmbed(key)],
                components: [createButtons(key)]
            });
        }
    }
};