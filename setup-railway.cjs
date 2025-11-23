const fs = require('fs');
const { exec } = require('child_process');

// Ler arquivo .env
const envFile = fs.readFileSync('.env', 'utf8');
const envLines = envFile.split('\n');

const variables = {};

envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            // Remover aspas se existirem
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            variables[key.trim()] = value.trim();
        }
    }
});

// Adicionar NODE_ENV=production
variables['NODE_ENV'] = 'production';

// Gerar novo JWT_SECRET se necessário, ou usar o existente
// variables['JWT_SECRET'] = ... (já deve estar no .env)

console.log('Configurando variáveis no Railway...');

Object.entries(variables).forEach(([key, value]) => {
    if (key === 'PORT') return; // Railway define PORT automaticamente

    console.log(`Configurando ${key}...`);
    exec(`railway variables --service f26a33c5-116c-40d1-9501-f7eecf40ce69 --set "${key}=${value}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao configurar ${key}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr ${key}: ${stderr}`);
            return;
        }
        console.log(`Sucesso ${key}`);
    });
});
