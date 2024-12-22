const mongoose = require('mongoose');
const config = require('../../config.json');

async function connectDatabase() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('📦 Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

module.exports = connectDatabase;