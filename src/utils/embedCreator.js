const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

function createRegisterEmbed() {
    return new EmbedBuilder()
        .setTitle('🔑 Key Registration')
        .setDescription('Please enter your key in the format below:')
        .addFields({
            name: 'Format', 
            value: '```MKEY-SR-XDAY-XXXXXX-XXXXXX```'
        })
        .setColor(config.embedColors.primary)
        .setFooter({ text: 'Enter your key in the chat' })
        .setTimestamp();
}

function createStatusEmbed(key) {
    if (!key || typeof key !== 'object') {
        console.error('Invalid key object:', key);
        return new EmbedBuilder()
            .setTitle('🔑 Key Status')
            .setDescription('❌ Error: Invalid key data')
            .setColor(config.embedColors.error)
            .setTimestamp();
    }

    const now = new Date();
    let timeRemainingMs;
    let status;

    if (key.isPaused) {
        timeRemainingMs = typeof key.remainingTime === 'number' ? key.remainingTime : 0;
        status = '⏸️ PAUSED';
    } else {
        const expiresAt = key.expiresAt instanceof Date ? key.expiresAt : new Date(key.expiresAt);
        
        timeRemainingMs = expiresAt.getTime() - now.getTime();
        status = timeRemainingMs > 0 ? '✅ ACTIVE' : '❌ EXPIRED';
    }

    timeRemainingMs = Math.max(0, timeRemainingMs);

    const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    const color = timeRemainingMs > 0 
        ? (key.isPaused ? config.embedColors.warning : config.embedColors.success)
        : config.embedColors.error;

    const timeRemainingString = timeRemainingMs > 0 
        ? `${days} days, ${hours} hours and ${minutes} minutes`
        : 'Expired';

    return new EmbedBuilder()
        .setTitle('🔑 Key Status')
        .addFields([
            { 
                name: '🎮 Game', 
                value: key.gameType || 'SR', 
                inline: true 
            },
            { 
                name: '📊 Status', 
                value: status, 
                inline: true 
            },
            { 
                name: '⏳ Remaining Time', 
                value: timeRemainingString,
                inline: true 
            },
            { 
                name: '🔑 Key', 
                value: `\`${key.key || 'Invalid Key'}\``, 
                inline: false 
            },
            {
                name: '📅 Expiration', 
                value: key.expiresAt ? `<t:${Math.floor(new Date(key.expiresAt).getTime() / 1000)}:F>` : 'Not set',
                inline: false
            }
        ])
        .setColor(color)
        .setFooter({ text: 'Last update' })
        .setTimestamp();
}

function createButtons(key) {
    if (!key || !key.userId) {
        console.error('Invalid key for button creation:', key);
        return new ActionRowBuilder();
    }

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`pause_${key.userId}`)
                .setLabel(key.isPaused ? '▶️ Unpause' : '⏸️ Pause')
                .setStyle(key.isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`addDay_${key.userId}`)
                .setLabel('+1 Day')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕'),
            new ButtonBuilder()
                .setCustomId(`removeDay_${key.userId}`)
                .setLabel('-1 Day')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('➖')
        );
}

module.exports = {
    createRegisterEmbed,
    createStatusEmbed,
    createButtons
};