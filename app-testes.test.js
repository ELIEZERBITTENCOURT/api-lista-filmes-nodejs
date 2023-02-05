const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./app');
const faker = require('faker');

process.env.APP_SECRET = "secret-key";

describe('Rota principal', () => {

  const fakeUser = {
    id: faker.random.number(),
    name: faker.name.findName(),
    email: faker.internet.email()
  };

  const fakeToken = jwt.sign({ id: fakeUser.id }, process.env.APP_SECRET);

  it('retorna a lista de usuários e o ID do usuário logado', async () => {
    const response = await request(app)
      .get('/')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      erro: false,
      users: [fakeUser],
      id_usuario_logado: fakeUser.id
    });
  });

  it('retorna um erro se o token não for fornecido', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ erro: 'Token não fornecido' });
  });

  it('retorna um erro se o token for mal formatado', async () => {
    const response = await request(app)
      .get('/')
      .set('Authorization', 'Bearer');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ erro: 'Token inválido' });
  });

  it('retorna um erro se o token for inválido', async () => {
    const response = await request(app)
      .get('/')
      .set('Authorization', `Bearer ${fakeToken}abc`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ erro: 'Token inválido' });
  });
});

describe('Rota /cadastrar', () => {
  const fakeUser = {
    id: faker.random.number(),
    name: faker.name.findName(),
    email: faker.internet.email()
  };

  const fakeToken = jwt.sign({ id: fakeUser.id }, process.env.APP_SECRET);

  it('Deve retornar JSON com erro = false e mensagem de sucesso ao cadastrar', async () => {
    const res = await request(app)
      .post('/cadastrar')
      .send({
        user: fakeUser,
        token: fakeToken
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('erro', false);
    expect(res.body).toHaveProperty('mensagem', 'Usuário cadastrado com sucesso!');
  });
});

describe('Rota POST /login', () => {
  const fakeUser = {
    id: faker.random.number(),
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };

  const fakeToken = jwt.sign({ id: fakeUser.id }, process.env.APP_SECRET, { expiresIn: '7d' });

  it('Deve retornar JSON com erro = false e token ao realizar login corretamente', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: fakeUser.email, password: fakeUser.password }); expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      erro: false,
      mensagem: 'Login realizado com sucesso!',
      token: fakeToken
    });
  });

  it('Deve retornar JSON com erro = true e mensagem de erro ao enviar email incorreto', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'emailincorreto@example.com', password: '123456' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      erro: true,
      mensagem: "Erro: Usuário ou a senha incorreta! Nenhum usuário com este e-mail"
    });
  });

  it('Deve retornar JSON com erro = true e mensagem de erro ao enviar senha incorreta', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: fakeUser.email, password: 'senhaincorreta' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      erro: true,
      mensagem: "Erro: Usuário ou a senha incorreta! Senha incorreta!"
    });
  });
});

describe("Rota GET /filme/:id", () => {
  it("Deve retornar JSON com informações do filme se ele existir", async () => {
    const fakeId = "123456789";
    const fakeFilme = {
      _id: fakeId,
      title: "The Matrix",
      year: 1999,
      genre: "Action, Sci-Fi"
    };
    jest.spyOn(Filme, "findOne").mockReturnValue(Promise.resolve(fakeFilme));
    const response = await request(app).get(`/filme/${fakeId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(fakeFilme);
    expect(Filme.findOne).toHaveBeenCalledWith({ _id: fakeId });
  });

  it("Deve retornar JSON com erro = true e mensagem de erro se filme não existir", async () => {
    const fakeId = "987654321";
    jest.spyOn(Filme, "findOne").mockReturnValue(Promise.resolve(null));
    const response = await request(app).get(`/filme/${fakeId}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: true,
      message: "Nenhum filme encontrado!"
    });
    expect(Filme.findOne).toHaveBeenCalledWith({ _id: fakeId });
  });
});

describe('Rota POST /votar', () => {
    it('Deve retornar erro ao votar em filme não encontrado', async () => {
        const fakeToken = 'token falso';

        const response = await request(app)
            .post('/votar')
            .set('Authorization', `Bearer ${fakeToken}`)
            .send({ filmeId: 999, pontuacao: 3 });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            erro: true,
            mensagem: "Erro: Filme não encontrado!",
        });
    });

    it('Deve computar voto com sucesso', async () => {
        const fakeToken = 'token falso';
        const fakeFilmeId = 1;
        const fakePontuacao = 3;

        const response = await request(app)
            .post('/votar')
            .set('Authorization', `Bearer ${fakeToken}`)
            .send({ filmeId: fakeFilmeId, pontuacao: fakePontuacao });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            erro: false,
            mensagem: "Voto computado com sucesso!",
        });
    });
});
