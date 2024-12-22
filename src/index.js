const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const connectDatabase = require('./database/connection');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.client.commands = new Collection();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const command = require(path.join(commandsPath, file));
                this.client.commands.set(command.name, command);
                console.log(`✅ Comando carregado: ${command.name}`);
            } catch (error) {
                console.error(`❌ Erro ao carregar comando ${file}:`, error);
            }
        }
    }

    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const event = require(path.join(eventsPath, file));
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`✅ Evento carregado: ${event.name}`);
            } catch (error) {
                console.error(`❌ Erro ao carregar evento ${file}:`, error);
            }
        }
    }

    async start() {
        try {
            console.log('🔄 Conectando ao banco de dados...');
            await connectDatabase();
            console.log('✅ Banco de dados conectado!');

            console.log('🔄 Carregando comandos...');
            this.loadCommands();
            
            console.log('🔄 Carregando eventos...');
            this.loadEvents();

            console.log('🔄 Fazendo login no Discord...');
            await this.client.login(config.token);
            console.log('✅ Bot online!');
        } catch (error) {
            console.error('❌ Erro fatal ao iniciar o bot:', error);
            process.exit(1);
        }
    }
}

const bot = new DiscordBot();
bot.start();