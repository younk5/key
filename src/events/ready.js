module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`🤖 Bot online como ${client.user.tag}`);
        
        await client.application.commands.create({
            name: 'key',
            description: 'Gerenciar sua key de acesso'
        });
        
        console.log('🔧 Comandos registrados com sucesso!');
    }
};
