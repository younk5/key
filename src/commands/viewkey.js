const { createStatusEmbed, createButtons } = require('../utils/embedCreator');
const Key = require('../database/models/key.js');

module.exports = {
    name: 'viewkey',
    description: 'View your current keys',
    options: [
        {
            name: 'key',
            type: 3,
            description: 'Specific key to view (optional)',
            required: false
        }
    ],

    async execute(interaction) {
        const userId = interaction.user.id;
        const specificKey = interaction.options.getString('key');

        try {
            let keys;
            if (specificKey) {
                keys = await Key.find({ 
                    userId,
                    $or: [
                        { key: specificKey },
                        { description: { $regex: specificKey, $options: 'i' } }
                    ]
                }).sort({ createdAt: -1 });
            } else {
                keys = await Key.find({ userId }).sort({ createdAt: -1 });
            }

            if (!keys || keys.length === 0) {
                return await interaction.reply({
                    content: specificKey
                        ? "❌ No matching key found. Check the key ID or description you provided."
                        : "❌ You don't have any registered keys yet! Use `/addkey` to register one.",
                    ephemeral: true
                });
            }

            if (specificKey && keys.length === 1) {
                return await interaction.reply({
                    embeds: [createStatusEmbed(keys[0])],
                    components: [createButtons(keys[0])],
                    ephemeral: true
                });
            }

            const embeds = keys.map(key => createStatusEmbed(key));
            
            return await interaction.reply({
                content: `📋 Found ${keys.length} key(s):`,
                embeds: embeds.slice(0, 10), 
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in viewkey command:', error);
            return await interaction.reply({
                content: '❌ An error occurred while processing your request. Please try again later.',
                ephemeral: true
            });
        }
    }
};