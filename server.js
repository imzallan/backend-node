const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
require('dotenv').config(); // Carregar variáveis de ambiente a partir de um arquivo .env


const app = express();
app.use(cors());
// Configura automaticamente os cabeçalhos de segurança
app.use(helmet());
app.use(bodyParser.json());


// Conectar com as credências do Banco de Dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Iniciando validação de dado  
const { body, validationResult } = require('express-validator');
// Definir a rota POST para autenticação
app.post('/api/users', [
    body('username').notEmpty().trim(),
    body('password').notEmpty().trim()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Obter os dados de usuário e senha do corpo da solicitação
    const { username, password } = req.body;    
  
    // Consultar o banco de dados para verificar se o usuário existe
    const query = `SELECT * FROM Usuários WHERE username = ? AND password = ?`;
    db.query(query, [username, password], (err, results) => {
      if (err) {
        // Ocorreu um erro ao executar a consulta
        console.error('Erro ao consultar o banco de dados:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
        return;
      }
      // Autenticação bem sucedida
      if (results.length > 0) {
        console.log('Autenticação bem-sucedida');
        res.status(200).json({ message: 'Autenticação bem-sucedida',  success: true, data: results });
      } else {
        // Autenticação falhou
        console.log('Autenticação mal-sucedida');
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    });
  });
  
// Teste Inicial de página (Não necessário ter)
app.get('/', (re, res) => {
    return res.json("From Backend side");
});

// Exposição das Columns user_id e username da table Usuários para exposição no FrontEnd
app.get('/api/users', (req, res) => {
    const sql = 'SELECT name, role, photo FROM Usuários';
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
});

// Iniciar o servidor
app.listen(8081, () => {
    console.log("listening");
});