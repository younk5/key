const { createStatusEmbed, createButtons } = require('../utils/embedCreator');
const { validateKey } = require('../utils/keyValidator');
const Key = require('../database/models/key.js');

module.exports = {
    name: 'addkey',
    description: 'Register a new access key',
    options: [
        {
            name: 'key',
            type: 3,
            description: 'Your access key (e.g., MKEY-SR-30DAY-XXXXXX-XXXXX)',
            required: true
        },
        {
            name: 'description',
            type: 3,
            description: 'Optional description for your key (e.g., Main Account, Alt Account)',
            required: false
        }
    ],

    async execute(interaction) {
        const userId = interaction.user.id;
        const keyArgument = interaction.options.getString('key');
        const description = interaction.options.getString('description') || 'Default';

        try {
            const keyInfo = validateKey(keyArgument);
            if (!keyInfo) {
                return await interaction.reply({
                    content: '❌ Invalid key format. Please provide a valid key.',
                    ephemeral: true
                });
            }

            const keyExists = await Key.findOne({ key: keyArgument });
            if (keyExists) {
                return await interaction.reply({
                    content: '❌ This key is already in use.',
                    ephemeral: true
                });
            }

            const userKeysCount = await Key.countDocuments({ userId });
            
            const MAX_KEYS = 5; // You can adjust this number
            if (userKeysCount >= MAX_KEYS) {
                return await interaction.reply({
                    content: `❌ You've reached the maximum limit of ${MAX_KEYS} keys. Please remove an existing key before adding a new one.`,
                    ephemeral: true
                });
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + keyInfo.duration);

            const newKey = new Key({
                userId,
                key: keyArgument,
                description,
                gameType: keyInfo.gameType,
                duration: keyInfo.duration,
                expiresAt: expiresAt,
                createdAt: new Date(),
                isPaused: false,
                remainingTime: null
            });

            await newKey.save();
            console.log('Saved new key:', newKey);

            const userKeys = await Key.find({ userId }).sort({ createdAt: -1 });

            return await interaction.reply({
                content: `✅ Key registered successfully! You now have ${userKeys.length} key(s).`,
                embeds: [createStatusEmbed(newKey, userKeys)],
                components: [createButtons(newKey)],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in addkey command:', error);
            return await interaction.reply({
                content: '❌ An error occurred while processing your request. Please try again later.',
                ephemeral: true
            });
        }
    }
};