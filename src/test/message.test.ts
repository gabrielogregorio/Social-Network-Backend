/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import { app, mongoose } from '../app';

const request = supertest(app);
let tokenValidoMessage = null;

const user = {
  name: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  email: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  username: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  password: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  idMessage: '',
};

const user2 = {
  name: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  email: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  username: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  password: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  idMessage: '',
};

beforeAll(() =>
  request
    .post('/user')
    .send(user)
    .then(() =>
      request
        .post('/user')
        .send(user2)
        .then(() =>
          request
            .post('/auth')
            .send({ email: user.email, password: user.password })
            .then((res) => {
              tokenValidoMessage = { authorization: `Bearer ${res.body.token}` };
              user.idMessage = res.body.id;
              return request
                .post('/auth')
                .send({ email: user2.email, password: user2.password })
                .then((res2) => {
                  user2.idMessage = res2.body.id;
                });
            }),
        ),
    ),
);

afterAll(() =>
  request
    .delete(`/user/${user.email}`)
    .then(() => request.delete(`/user/${user2.email}`).then(() => mongoose.connection.close())),
);

describe('Envio de mensagens', () => {
  test('Usuário 1 não deve conseguir enviar uma mensagem sem os parametros', () =>
    request
      .post('/message')
      .send({})
      .set(tokenValidoMessage)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
      }));
  test('Usuário 1 deve enviar uma mensagem para o usuário 2', () =>
    request
      .post('/message')
      .send({ to: user2.idMessage, message: 'Olá mi amigo!', test: 'true' })
      .set(tokenValidoMessage)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
      }));

  test('Usuário 1 deve obter todas as mensagens enviadas', () =>
    request
      .get('/messages')
      .set(tokenValidoMessage)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].message).toEqual('Olá mi amigo!');
        expect(res.body[0].to._id).toEqual(user2.idMessage);
      }));

  test('Usuário 1 deve obter todas as mensagens enviadas ao usuário 2', () =>
    request
      .get(`/message/${user2.idMessage}`)
      .set(tokenValidoMessage)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
      }));

  test('Usuário 1 deve obter todas as pessoas que interagiu', async () => {
    const response = await request.get('/messages/users').set(tokenValidoMessage);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0]._id).toEqual(user2.idMessage);
  });
});
