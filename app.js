const express = require('express');
const cors = require('cors');
const app = express();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { eAdmin } = require('./middleware/authentication');
const User = require('./models/User');
const Filme = require('./models/Filme');

app.use(express.json());
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "http://localhost:8080")
    res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, DELETE');
    app.use(cors());
    next();
});

app.get('/', eAdmin, async (req, res) => {
    await User.findAll({
        attributes: ['id', 'name', 'email'],
        order: [['id', "DESC"]]
    })
    .then((users) => {
        return res.json({
            erro: false,
            users,
            id_usuario_logado: req.userId
        });
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhum usuário encontrado!"
        });
    });    
});

app.post('/cadastrar', async (req, res) => {
    var dados = req.body;

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

app.post('/cadastrarNovoUsuario', eAdmin, async (req, res) => {
    var dados = req.body;

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

    if(user === null){
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta! Nenhum usuário com este e-mail"
        });
    }

    if(!(await bcrypt.compare(req.body.password, user.password))){
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta! Senha incorreta!"
        });
    }

    var token = jwt.sign({id: user.id}, process.env.SECRET, {
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

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});