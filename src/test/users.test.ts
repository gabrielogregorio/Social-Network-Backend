import STATUS_CODE from '@/handlers/index';
import supertest from 'supertest';
import { app, mongoose } from '../app';
import mockTests from '../mocks/tests.json';

const request = supertest(app);
let tokenValido = {};
let idUsuarioValido = '';
let token2Valido = {};
let idUsuario2Valido = '';

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
  test('Deve retornar um Usuário', async () => {
    const response = await request.get(`/user/${idUsuarioValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body[0].name).toBeDefined();
    expect(response.body[0].email).toBeDefined();
    expect(response.body[0].username).toBeDefined();
  });

  test('Deve retornar erro 500 para um parametro invalido', async () => {
    const response = await request.get('/user/aaa').set(tokenValido);
    expect(response.statusCode).toEqual(STATUS_CODE.ERROR_IN_SERVER);
  });

  test('Deve retornar erro 404 ao não encontrar o usuario', async () => {
    const response = await request.get('/user/111111111111111111111111').set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
  });
  test('Validar token de um usuário', async () => {
    const response = await request.post('/validate').set(tokenValido);
    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
  });

  test('Usuário 1 deve seguir o usuário 2', async () => {
    const response = await request.post(`/user/follow/${idUsuario2Valido}`).set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body.followed).toEqual(true);
  });

  test('Obter os dados de si mesmo e verificar que está seguindo o usuario 2', async () => {
    const response = await request.get('/me').set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body[0].name).toEqual(user.name);
    expect(response.body[0].email).toEqual(user.email);
    expect(response.body[0].username).toEqual(user.username);
    expect(response.body[0].following[0]._id).toEqual(idUsuario2Valido);
  });

  test('Obter os dados de si mesmo e verificar que está sendo seguido pelo usuario 1', async () => {
    const response = await request.get('/me').set(token2Valido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body[0].name).toEqual(user2.name);
    expect(response.body[0].email).toEqual(user2.email);
    expect(response.body[0].username).toEqual(user2.username);
    expect(response.body[0].followers[0]._id).toEqual(idUsuarioValido);
  });

  test('Usuário 1 deve remover o seguir do usuário 2', async () => {
    const response = await request.post(`/user/follow/${idUsuario2Valido}`).set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body.followed).toEqual(false);
  });

  test('Obter os dados de si mesmo e verificar que DEIXOU de seguir o usuario 2', async () => {
    const response = await request.get('/me').set(tokenValido);
    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body[0].name).toEqual(user.name);
    expect(response.body[0].email).toEqual(user.email);
    expect(response.body[0].username).toEqual(user.username);
    expect(response.body[0].following).toEqual([]);
  });

  test('Obter os dados de si mesmo e verificar que DEIXOU de ser seguido pelo usuario 1', async () => {
    const response = await request.get('/me').set(token2Valido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body[0].name).toEqual(user2.name);
    expect(response.body[0].email).toEqual(user2.email);
    expect(response.body[0].username).toEqual(user2.username);
    expect(response.body[0].followers).toEqual([]);
  });

  test('Usuário não pode seguir a si mesmo', async () => {
    const response = await request.post(`/user/follow/${idUsuarioValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.INVALID_PARAMETERS);
    expect(response.body.msg).toEqual('User cannot follow himself!');
  });

  test('Impedir acesso com token invalido', async () => {
    const response = await request.post('/validate').set({ authorization: 'Bearer aaaaaaaaaaaaaaaaa' });
    expect(response.statusCode).toEqual(STATUS_CODE.NOT_AUTHORIZED);
  });
  test('Deve impedir cadastro com dados vazios', async () => {
    const userEmpty = { name: '', email: '', password: '' };
    const response = await request.post('/user').send(userEmpty);

    expect(response.statusCode).toEqual(STATUS_CODE.INVALID_PARAMETERS);
  });

  test('Deve impedir cadastro com e-mail invalido', async () => {
    const userInvalid = { name: 'Usuario Valido', email: 'Email invalido', password: 'Senha valida!' };
    const response = await request.post('/user').send(userInvalid);

    expect(response.statusCode).toEqual(STATUS_CODE.INVALID_PARAMETERS);
    expect(response.body.errors[1].param).toEqual('email');
  });

  test('Deve impedir cadastro com senha invalido', async () => {
    const userInvalid2 = { name: 'Usuario Valido', email: 'emailvalido@email.com', password: '123' };
    const response = await request.post('/user').send(userInvalid2);

    expect(response.statusCode).toEqual(STATUS_CODE.INVALID_PARAMETERS);
    expect(response.body.errors[1].param).toEqual('password');
  });

  test('Deve impedir um cadastro com e-mail repetido', async () => {
    const response = await request.post('/user').send(user);

    expect(response.statusCode).toEqual(STATUS_CODE.CONFLICT);
    expect(response.body.error).toEqual('E-mail already registered!');
  });

  test('Deve retornar erro 400 ao tentar editar um usuário passando parametros faltantes', async () => {
    const response = await request.put(`/user/${idUsuarioValido}`, {}).set(tokenValido).send({ name: '' });

    expect(response.statusCode).toEqual(STATUS_CODE.INVALID_PARAMETERS);
  });

  test('Deve permitir a edição de um usuario!', async () => {
    const response = await request.put(`/user/${idUsuarioValido}`).set(tokenValido).send({
      name: 'alterado',
      password: 'gabriel',
      username: 'alterado2',
      itemBio: user.itemBio,
      bio: user.bio,
      motivational: user.motivational,
    });

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body.name).toEqual('alterado');
    expect(response.body.bio).toEqual(user.bio);
    expect(response.body.motivational).toEqual(user.motivational);
    expect(response.body.itemBio[0].text).toEqual(user.itemBio[0][1]);
  });

  test('Deve permitir a edição de um usuario novamente!', async () => {
    const response = await request
      .put(`/user/${idUsuarioValido}`)
      .set(tokenValido)
      .send({ name: user.name, password: user.password, username: user.username });

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body.name).toEqual(user.name);
  });

  test('Deve impedir um usuário editar outro!', async () => {
    const response = await request
      .put(`/user/9999999999999999999999999`)
      .set(tokenValido)
      .send({ name: 'alterado', password: 'alterado', username: 'teste2' });

    expect(response.statusCode).toEqual(STATUS_CODE.NOT_AUTHORIZED);
  });

  test('Deve impedir o login de um usuário não cadastrado', async () => {
    const response = await request
      .post('/auth')
      .send({ email: 'invalid_email_test', password: 'aaaaaaaaa' })
      .set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
  });

  test('Deve impedir o login com uma senha errada', async () => {
    const response = await request.post('/auth').send({ email: user.email, password: '....' }).set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.NOT_AUTHORIZED);
  });

  test('Deve retornar uma lista de usuários', async () => {
    const response = await request.get('/users').set(tokenValido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Deve deletar um usuário', async () => {
    const response = await request.delete('/user').set(token2Valido);

    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
  });
});
