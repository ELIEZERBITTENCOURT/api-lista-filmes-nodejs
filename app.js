const express = require('express');
const cors = require('cors');
const app = express();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Filme = require('./models/Filme');

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080")
    res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, DELETE');
    app.use(cors());
    next();
});

const eAutorizado = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    return res.status(401).json({ erro: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

app.get('/', eAutorizado, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'],
            order: [['id', 'DESC']]
        });

        return res.json({
            erro: false,
            users,
            id_usuario_logado: req.userId
        });
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: 'Erro: Nenhum usuário encontrado!'
        });
    }
});

app.post('/cadastrar', async (req, res) => {
    var dados = req.body;

    if (!dados.password || typeof dados.password !== 'string') {
      return res.status(400).json({
        erro: true,
        mensagem: "A senha é obrigatória e deve ser uma string."
      });
    }

    dados.password = await bcrypt.hash(dados.password, 8);

    await User.create(dados)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Usuário cadastrado com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Usuário não cadastrado com sucesso!"
            });
        });
});


app.post('/login', async (req, res) => {

    const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: {
            email: req.body.email
        }
    });

    if (user === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta! Nenhum usuário com este e-mail"
        });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta! Senha incorreta!"
        });
    }

    var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: '7d' // 7 dias
    });

    return res.json({
        erro: false,
        mensagem: "Login realizado com sucesso!",
        token
    });
});

app.get("/filme/:id", (req, res) => {
    Filme.findOne({ _id: req.params.id }).then((filme) => {
        return res.json(filme);
    }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum filme encontrado!"
        })
    })
})

app.post('/votar', eAutorizado, async (req, res) => {
    const { filmeId, pontuacao } = req.body;

    const filme = await Filme.findByPk(filmeId);
    if (!filme) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Filme não encontrado!"
        });
    }

    filme.votos = filme.votos + 1;
    filme.pontuacao = filme.pontuacao + pontuacao;

    await filme.save();

    return res.json({
        erro: false,
        mensagem: "Voto computado com sucesso!",
    });
});


app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});

module.exports = app;
