const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 8000;

// Conexão com MySQL usando Promises
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();

// Testa conexão
console.log('Conexão com o banco de dados MySQL configurada.');

db.query('SELECT 1')
  .then(() => console.log('Banco conectado com sucesso!'))
  .catch(err => console.error('Erro na conexão com banco:', err));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagens_div', express.static(path.join(__dirname, 'public/imagens_div')));

// Rota principal exibindo produtos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'Home.html'));
});

//cadastro

  app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    bcrypt.compare(senha, result[0].senha, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao verificar a senha' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Senha incorreta' });
      }

      // Simples resposta sem token
      return res.json({
        message: 'Login bem-sucedido',
        usuario: {
          id: result[0].id_usuario,
          nome: result[0].nome,
          email: result[0].email
        }
      });
    });
  });
});


  // Rota de Cadastro
  // Rota de Cadastro
app.post('/cadastro', (req, res) => {
  const {
    nome,
    sobrenome,
    email,
    senha,
    cpf_cnpj,
    telefone,
    cep,
    estado,
    cidade,
    bairro,
    rua,
    numero_da_casa
  } = req.body;

  if (!nome || !sobrenome || !email || !senha || !estado) {
    return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
  }

  const cpfLimpo = cpf_cnpj ? cpf_cnpj.replace(/\D/g, '') : null;
  const telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : null;
  const cepLimpo = cep ? cep.replace(/\D/g, '') : null;

  db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    bcrypt.hash(senha, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criptografar a senha' });
      }

      const dataCadastro = new Date().toISOString().slice(0, 10); // Só a data YYYY-MM-DD

      const query = `
        INSERT INTO usuario (
          nome, sobrenome, email, senha, cpf_cnpj, telefone,
          cep, rua, numero_da_casa, bairro, cidade, data_cadastro, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [
          nome,
          sobrenome,
          email,
          hashedPassword,
          cpfLimpo,
          telefoneLimpo,
          cepLimpo,
          rua,
          numero_da_casa,
          bairro,
          cidade,
          dataCadastro,
          estado
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
          }
          return res.json({ message: 'Cadastro bem-sucedido' });
        }
      );
    });
  });
});

  // Rota para Troca de Senha
 app.post('/troca-de-senha', (req, res) => {
  const { cpf_cnpj, senha_nova } = req.body;
  const cpfLimpo = cpf_cnpj.replace(/\D/g, '');

  // Criptografa a nova senha
  bcrypt.hash(senha_nova, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao criptografar a senha' });
    }

    // Atualiza a senha no banco de dados
    db.query('UPDATE usuario SET senha = ? WHERE cpf_cnpj = ?', [hashedPassword, cpfLimpo], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar a senha' });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'CPF/CNPJ não encontrado' });
      }

      return res.json({ message: 'Senha alterada com sucesso' });
    });
  });
});

  // Rota para as páginas estáticas
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'views', 'login.html'));
  });

  app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','views', 'cadastro.html'));
  });

  app.get('/troca-de-senha', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'views', 'troca_senha.html'));
  });


// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM produto');
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Rota para buscar produtos por categoria
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
    console.error('Erro ao buscar produtos por categoria:', err.message);
    res.status(500).json({ error: 'Erro ao buscar produtos por categoria' });
  }
});

// Rota para inserir avaliação
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
    console.error('Erro ao salvar avaliação:', err.message);
    res.status(500).json({ error: 'Erro ao salvar avaliação.' });
  }
});

// Rota para buscar avaliações de um produto
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
    console.error('Erro ao buscar avaliações:', err.message);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});


// Rota de favoritos (já estava com async/await)
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
    console.error(error);
    return res.json({ sucesso: false, mensagem: 'Erro no banco de dados' });
  }
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
