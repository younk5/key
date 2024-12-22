const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token, clientId } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

function setupDirectories() {
    const dirs = ['src/commands', 'src/events'];
    
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            console.log(`📁 Criando diretório ${dir}...`);
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
}

async function deployCommands() {
    try {
        setupDirectories();

        const commands = [];
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        if (commandFiles.length === 0) {
            console.log('⚠️ Nenhum comando encontrado na pasta src/commands.');
            console.log('ℹ️ Certifique-se de adicionar seus arquivos de comando em ./src/commands/');
            return;
        }

        console.log('🔄 Carregando comandos...');

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('name' in command && 'description' in command) {
                commands.push({
                    name: command.name,
                    description: command.description,
                    options: command.options || []
                });
                console.log(`✅ Comando carregado: ${command.name}`);
            } else {
                console.log(`⚠️ O comando em ${file} está faltando propriedades obrigatórias`);
            }
        }

        if (commands.length === 0) {
            console.log('⚠️ Nenhum comando válido para fazer deploy.');
            return;
        }

        console.log('🔄 Iniciando deploy dos comandos globais...');

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ ${data.length} comandos registrados com sucesso!`);
        
        console.log('\n📋 Comandos registrados:');
        commands.forEach(cmd => {
            console.log(`   • ${cmd.name}: ${cmd.description}`);
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Erro: Diretório ou arquivo não encontrado');
            console.error('ℹ️ Verifique se a estrutura de pastas está correta: ./src/commands/');
        } else {
            console.error('❌ Erro ao fazer deploy dos comandos:', error);
        }
    }
}

deployCommands();