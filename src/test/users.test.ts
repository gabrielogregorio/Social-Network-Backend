import STATUS_CODE from '@/handlers/index';
import supertest from 'supertest';
import { app, mongoose } from '../app';
import mockTests from '../mocks/tests.json';

const request = supertest(app);
let tokenValido = {};
let idUsuarioValido = '';
let token2Valido = { authorization: 'Bearer DS23HH5425KJ7LH1KGP4FD24UU0452SD1' };
let idUsuario2Valido = '62c9801e6cf21c0c4d5655f2';

const user = mockTests.createUser;

const user2 = mockTests.createUser2;

beforeAll(async () => {
  await request.delete(`/user/${user.email}`);
  await request.delete(`/user/${user2.email}`);
  const res = await request.post('/user').send(user);

  idUsuarioValido = res.body.id;

  const res2 = await request.post('/user').send(user2);
  idUsuario2Valido = res2.body.id;
  token2Valido = { authorization: `Bearer ${res2.body.token}` };

  const res3 = await request.post('/auth').send({ email: user.email, password: user.password });
  tokenValido = { authorization: `Bearer ${res3.body.token}` };
});

afterAll(() => request.delete(`/user/${user.email}`).then(async () => mongoose.connection.close()));

describe('Testes gerais', () => {
  test('[doc]: Retornar um usuário', async () => {
    const response = await request.get(`/user/${idUsuarioValido}`).set(tokenValido);
    expect(response.statusCode).toEqual(200);

    expect(response.body[0]._id).toBeDefined(); // example '62c97ecf6f24426bcf07ecaa'
    expect(response.body[0].name).toEqual('sherek');
    expect(response.body[0].username).toEqual('sherek');
    expect(response.body[0].email).toEqual('no-valid-email@fakemail.com');
    expect(response.body[0].itemBio).toEqual([]);
    expect(response.body[0].followers).toEqual([]);
    expect(response.body[0].following).toEqual([]);
    expect(response.body[0].followersIds).toEqual([]);
    expect(response.body[0].followingIds).toEqual([]);
  });

  test('[doc]: Retorna 500 para parametro invalido', async () => {
    const response = await request.get('/user/aaa').set(tokenValido);

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual({});
  });

  test('[doc]: Deve retornar erro 404 ao não encontrar o usuario', async () => {
    const response = await request.get('/user/111111111111111111111111').set(tokenValido);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({});
  });

  test('[doc]: Validar token de um usuário', async () => {
    const response = await request.post('/validate').set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({});
  });

  test('[doc]: Usuario 1 segue o 2', async () => {
    const response = await request.post(`/user/follow/${idUsuario2Valido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.followed).toEqual(true);
  });

  test('[doc]: Obter a si mesmo', async () => {
    const response = await request.get('/me').set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0]._id).toBeDefined(); // 62c98122cb61ab09493a0df5
    expect(response.body[0].name).toEqual('sherek');
    expect(response.body[0].email).toEqual('no-valid-email@fakemail.com');
    expect(response.body[0].username).toEqual('sherek');

    expect(response.body[0].itemBio).toEqual([]);
    expect(response.body[0].followers).toEqual([]);
    expect(response.body[0].followersIds).toEqual([]);

    expect(response.body[0].following[0]._id).toEqual(idUsuario2Valido); // 62c981d8d891c59252ab55d8

    expect(response.body[0].following[0].name).toEqual('TTTTTTT');
    expect(response.body[0].following[0].username).toEqual('TTTTTTTTT');
    expect(response.body[0].following[0].email).toEqual('TTTTT@mail.com');
    expect(response.body[0].following[0].img).toEqual('');
    expect(response.body[0].following[0].itemBio).toEqual([]);
    expect(response.body[0].following[0].following).toEqual([]);
    expect(response.body[0].following[0].followingIds).toEqual([]);
  });

  test('[doc]: Obter os dados de si mesmo e verificar que está sendo seguido pelo usuario 1', async () => {
    const response = await request.get('/me').set(token2Valido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].name).toEqual(user2.name);
    expect(response.body[0].email).toEqual(user2.email);
    expect(response.body[0].username).toEqual(user2.username);
    expect(response.body[0].followers[0]._id).toEqual(idUsuarioValido);
  });

  test('[doc]: Usuário 1 deve remover o seguir do usuário 2', async () => {
    const response = await request.post(`/user/follow/${idUsuario2Valido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.followed).toEqual(false);
  });

  test('[doc]: Obter os dados de si mesmo e verificar que DEIXOU de seguir o usuario 2', async () => {
    const response = await request.get('/me').set(tokenValido);
    expect(response.statusCode).toEqual(200);
    expect(response.body[0].name).toEqual(user.name);
    expect(response.body[0].email).toEqual(user.email);
    expect(response.body[0].username).toEqual(user.username);
    expect(response.body[0].following).toEqual([]);
  });

  test('[doc]: Obter os dados de si mesmo e verificar que DEIXOU de ser seguido pelo usuario 1', async () => {
    const response = await request.get('/me').set(token2Valido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].name).toEqual(user2.name);
    expect(response.body[0].email).toEqual(user2.email);
    expect(response.body[0].username).toEqual(user2.username);
    expect(response.body[0].followers).toEqual([]);
  });

  test('[doc]: Usuário não pode seguir a si mesmo', async () => {
    const response = await request.post(`/user/follow/${idUsuarioValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(400);
    expect(response.body.msg).toEqual('User cannot follow himself!');
  });

  test('[doc]: Impedir acesso com token invalido', async () => {
    const response = await request.post('/validate').set({ authorization: 'Bearer aaaaaaaaaaaaaaaaa' });
    expect(response.statusCode).toEqual(403);
  });
  test('[doc]: Deve impedir cadastro com dados vazios', async () => {
    const userEmpty = { name: '', email: '', password: '' };
    const response = await request.post('/user').send(userEmpty);

    expect(response.statusCode).toEqual(400);
  });

  test('[doc]: Deve impedir cadastro com e-mail invalido', async () => {
    const userInvalid = { name: 'Usuario Valido', email: 'Email invalido', password: 'Senha valida!' };
    const response = await request.post('/user').send(userInvalid);

    expect(response.statusCode).toEqual(400);
    expect(response.body.errors[1].param).toEqual('email');
  });

  test('[doc]: Deve impedir cadastro com senha invalido', async () => {
    const userInvalid2 = { name: 'Usuario Valido', email: 'emailvalido@email.com', password: '123' };
    const response = await request.post('/user').send(userInvalid2);

    expect(response.statusCode).toEqual(400);
    expect(response.body.errors[1].param).toEqual('password');
  });

  test('[doc]: Deve impedir um cadastro com e-mail repetido', async () => {
    const response = await request.post('/user').send(user);

    expect(response.statusCode).toEqual(409);
    expect(response.body.error).toEqual('E-mail already registered!');
  });

  test('[doc]: Deve retornar erro 400 ao tentar editar um usuário passando parametros faltantes', async () => {
    const response = await request.put(`/user/${idUsuarioValido}`, {}).set(tokenValido).send({ name: '' });

    expect(response.statusCode).toEqual(400);
  });

  test('[doc]: Deve permitir a edição de um usuario!', async () => {
    const response = await request.put(`/user/${idUsuarioValido}`).set(tokenValido).send({
      name: 'alterado',
      password: 'gabriel',
      username: 'alterado2',
      itemBio: user.itemBio,
      bio: user.bio,
      motivational: user.motivational,
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.name).toEqual('alterado');
    expect(response.body.bio).toEqual(user.bio);
    expect(response.body.motivational).toEqual(user.motivational);
    expect(response.body.itemBio[0].text).toEqual(user.itemBio[0][1]);
  });

  test('[doc]: Deve permitir a edição de um usuario novamente!', async () => {
    const response = await request
      .put(`/user/${idUsuarioValido}`)
      .set(tokenValido)
      .send({ name: user.name, password: user.password, username: user.username });

    expect(response.statusCode).toEqual(200);
    expect(response.body.name).toEqual(user.name);
  });

  test('[doc]: Deve impedir um usuário editar outro!', async () => {
    const response = await request
      .put(`/user/9999999999999999999999999`)
      .set(tokenValido)
      .send({ name: 'alterado', password: 'alterado', username: 'teste2' });

    expect(response.statusCode).toEqual(403);
  });

  test('[doc]: Deve impedir o login de um usuário não cadastrado', async () => {
    const response = await request
      .post('/auth')
      .send({ email: 'invalid_email_test', password: 'aaaaaaaaa' })
      .set(tokenValido);

    expect(response.statusCode).toEqual(404);
  });

  test('[doc]: Deve impedir o login com uma senha errada', async () => {
    const response = await request.post('/auth').send({ email: user.email, password: '....' }).set(tokenValido);

    expect(response.statusCode).toEqual(403);
  });

  test('[doc]: Deve retornar uma lista de usuários', async () => {
    const response = await request.get('/users').set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('[doc]: Deve deletar um usuário', async () => {
    const response = await request.delete('/user').set(token2Valido);

    expect(response.statusCode).toEqual(200);
  });
});
