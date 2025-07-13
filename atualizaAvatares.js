const fs = require('fs');

// Caminho para o seu db.json
const dbPath = './data/db.json';

// Lê o arquivo
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Atualiza o campo avatar de cada pessoa
if (Array.isArray(db.Pessoa)) {
  db.Pessoa = db.Pessoa.map(pessoa => {
    const n = pessoa.id % 100 === 0 ? 100 : pessoa.id % 100;
    return {
      ...pessoa,
      avatar: `https://avatar.iran.liara.run/public/${n}`
    };
  });
}

// Salva o arquivo de volta
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('Avatares atualizados com sucesso!');