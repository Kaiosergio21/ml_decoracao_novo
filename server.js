const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();

db.query('SELECT 1')
  .then(() => console.log('Banco conectado com sucesso!'))
  .catch(err => console.error('Erro na conexão com banco:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para receber dados de formulários HTML

app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagens_div', express.static(path.join(__dirname, 'public/imagens_div')));

app.use(session({
  secret: 'seuSegredoAqui',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hora
}));


function verificarLogin(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/views/login.html');
  }
}

// ============================
// 🔗 ROTA PRINCIPAL
// ============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'Home.html'));
});

// ===============================
// 🚪 ROTA DE LOGOUT
// ===============================

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/views/login.html');
});


// ===============================
// 🔒 EXEMPLO DE ROTA PROTEGIDA
// ===============================

app.get('/perfil', verificarLogin, (req, res) => {
  res.send(`Olá, ${req.session.usuario.nome}. Bem-vindo ao seu perfil.`);
});

app.get('/verificar-login', (req, res) => {
  if (req.session.usuario) {
    res.json({ logado: true, usuario: req.session.usuario });
  } else {
    res.json({ logado: false });
  }
});


// ============================
// 🟩 ROTA DE CADASTRO
// ============================
app.post('/cadastro', async (req, res) => {
  const { nome, sobrenome, email, senha, cpf_cnpj, telefone, cep, estado, cidade, bairro, rua, numero_da_casa } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      `INSERT INTO usuario (nome, sobrenome, email, senha, cpf_cnpj, telefone, cep, estado, cidade, bairro, rua, numero_da_casa, data_cadastro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nome, sobrenome, email, senhaHash, cpf_cnpj, telefone, cep, estado, cidade, bairro, rua, numero_da_casa]
    );

    // Após cadastro, redireciona para login
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao cadastrar usuário');
  }
});


// ============================
// 🟦 ROTA DE LOGIN
// ============================
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [usuarios] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).send('Usuário não encontrado');
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).send('Senha incorreta');
    }

    // 🔒 Salva os dados do usuário na sessão
    req.session.usuario = usuario;

    res.redirect('/'); // Redireciona para a home (página inicial)
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'cadastro.html'));
});

app.get('/troca_senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'troca_senha.html'));
});



// ============================
// 🟧 ROTA DE TROCA DE SENHA
// ============================
app.post('/troca-de-senha', async (req, res) => {
  const { cpf_cnpj, senha_nova } = req.body;

  if (!cpf_cnpj || !senha_nova) {
    return res.status(400).send('Dados incompletos.');
  }

  try {
    // Hash da nova senha
    const senhaHash = await bcrypt.hash(senha_nova, 10);

    // Atualiza a senha do usuário com o cpf_cnpj informado
    const [resultado] = await db.query(
      'UPDATE usuario SET senha = ? WHERE cpf_cnpj = ?',
      [senhaHash, cpf_cnpj]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }

     res.redirect('/login');
  } catch (error) {
    console.error('Erro ao trocar a senha:', error);
    res.status(500).send('Erro no servidor ao trocar senha.');
  }
});



// ============================
// 🔸 ROTAS DE PRODUTOS, AVALIAÇÕES E FAVORITOS (SUAS ATUAIS)
// ============================

app.get('/produtos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM produto');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/produtos/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria;
  let sql = 'SELECT * FROM produto';
  const values = [];

  if (categoria !== 'todos') {
    sql += ' WHERE categoria = ?';
    values.push(categoria);
  }

  try {
    const [results] = await db.query(sql, values);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos por categoria' });
  }
});

app.post('/avaliacoes', async (req, res) => {
  const { estrelas, comentario, produtoId, usuarioId } = req.body;

  if (!estrelas || !comentario || !produtoId || !usuarioId) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const sql = `
    INSERT INTO avaliacao (estrelas, comentario, fk_produto_id_produto, fk_usuario_id_usuario, data_avaliacao)
    VALUES (?, ?, ?, ?, NOW())
  `;

  try {
    await db.query(sql, [estrelas, comentario, produtoId, usuarioId]);
    res.json({ message: 'Avaliação salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar avaliação.' });
  }
});

app.get('/avaliacoes/:produtoId', async (req, res) => {
  const produtoId = req.params.produtoId;

  const sql = `
    SELECT estrelas, comentario 
    FROM avaliacao 
    WHERE fk_produto_id_produto = ? 
    ORDER BY data_avaliacao DESC
  `;

  try {
    const [results] = await db.query(sql, [produtoId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

app.post('/favoritos', async (req, res) => {
  const { produtoId, usuarioId } = req.body;

  if (!produtoId || !usuarioId) {
    return res.json({ sucesso: false, mensagem: 'Dados incompletos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM favoritado WHERE fk_produto_id_produto = ? AND fk_usuario_id_usuario = ?',
      [produtoId, usuarioId]
    );

    if (rows.length > 0) {
      await db.query(
        'DELETE FROM favoritado WHERE fk_produto_id_produto = ? AND fk_usuario_id_usuario = ?',
        [produtoId, usuarioId]
      );
      return res.json({ sucesso: true, favorito: false });
    } else {
      await db.query(
        'INSERT INTO favoritado (fk_produto_id_produto, fk_usuario_id_usuario) VALUES (?, ?)',
        [produtoId, usuarioId]
      );
      return res.json({ sucesso: true, favorito: true });
    }
  } catch (error) {
    return res.json({ sucesso: false, mensagem: 'Erro no banco de dados' });
  }
});


// ============================
// 🏁 INICIAR SERVIDOR
// ============================
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
