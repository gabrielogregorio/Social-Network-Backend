/* eslint-disable no-underscore-dangle */
import supertest from 'supertest';
import { app, mongoose } from '../app';

const request = supertest(app);
const post = { body: 'Um body qualquer', test: true };
const post2 = { body: 'post2', test: true };
let idPostValido = '';
let tokenValido = {};
let idComentarioValido = '';
let token2Valido = {};
require('dotenv/config');

const user = {
  name: 'testUserPost@testUserPost.com',
  email: 'testUserPost@testUserPost.com',
  username: 'testUserPost@testUserPost.com',
  password: 'testUserPost@testUserPost.com',
  id: '',
};

const user2 = {
  name: 'testUserPost2@testUserPost2.com',
  email: 'testUserPost2@testUserPost2.com',
  username: 'testUserPost2@testUserPost2.com',
  password: 'testUserPost2@testUserPost2.com',
  id: '',
};

beforeAll(async () => {
  await request.delete(`/image`);
  await request.delete(`/user/${user.email}`);
  await request.delete(`/user/${user2.email}`);
  await request.post('/user').send(user);
  await request.post('/user').send(user2);

  const res = await request.post('/auth').send({ email: user.email, password: user.password });

  tokenValido = { authorization: `Bearer ${res.body.token}` };
  user.id = res.body.id;

  const res2 = await request.post('/auth').send({ email: user2.email, password: user2.password });
  token2Valido = { authorization: `Bearer ${res2.body.token}` };
  user2.id = res2.body.id;
});

afterAll(async () => {
  await request.delete(`/image`);
  await request.delete(`/user/${user.email}`);
  await request.delete(`/user/${user2.email}`);
  mongoose.connection.close();
});

describe('Gerenciamento de posts', () => {
  test('Deve cadastrar um post', async () => {
    const response = await request.post('/post').send(post).set(tokenValido);
    expect(response.statusCode).toEqual(200);
    idPostValido = response.body._id;
  });

  test('Usuário 2 deve cadastrar um post', async () => {
    const response = await request.post('/post').send(post2).set(token2Valido);

    expect(response.statusCode).toEqual(200);
  });

  test('Deve retornar apenas o post do usuário, pois o usuário ainda não segue ninguem', async () => {
    const response = await request.get('/posts').set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].body).toEqual(post.body);
  });

  test('Para ver os posts, um usuario deve seguir o outro', async () => {
    const response = await request.post(`/user/follow/${user2.id}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.followed).toEqual(true);
  });

  test('Deve retornar uma lista com todos os posts e suas imagens', async () => {
    const response = await request.get('/posts').set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].body).toEqual(post2.body);
  });

  test('Deve compartilhar um post', async () => {
    const response = await request.post(`/post/share/${idPostValido}`).send(post2).set(token2Valido);

    expect(response.statusCode).toEqual(200);
  });

  test('Deve retornar um post', async () => {
    const response = await request.get(`/post/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].user.name).toBeDefined();
    expect(response.body[0].body).toBeDefined();
  });

  test('Deve retornar erro 500 para um parametro invalido', async () => {
    const response = await request.get('/post/aaa').set(tokenValido);

    expect(response.statusCode).toEqual(500);
  });

  test('Deve retornar erro 404 ao não encontrar o post', async () => {
    const response = await request.get('/post/111111111111111111111111').set(tokenValido);

    expect(response.statusCode).toEqual(404);
  });

  test('Deve retornar erro 400 ao tentar editar um post passando parametros incorretos', async () => {
    const response = await request.put(`/post/${idPostValido}`, {}).set(tokenValido).send({ body: '' });

    expect(response.statusCode).toEqual(400);
  });

  test('Deve permitir a edição de um post!', async () => {
    const response = await request.put(`/post/${idPostValido}`).set(tokenValido).send({ body: 'test1z' });

    expect(response.statusCode).toEqual(200);
    expect(response.body.body).toEqual('test1z');
    expect(response.body.edited).toEqual(true);
  });

  test('Não deve permitir a edição de um post por um usuário que não o postou', async () => {
    const response = await request.put(`/post/61157031ccc66931d08ce13b`).set(tokenValido).send({ body: 'test1z' });
    expect(response.statusCode).toEqual(403);
  });

  test('Deve enviar um like', async () => {
    const response = await request.post(`/post/like/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.includeLike).toEqual(true);
  });

  test('Deve desfazer um like', async () => {
    const response = await request.post(`/post/like/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.includeLike).toEqual(false);
  });

  test('Deve salvar um post', async () => {
    const response = await request.post(`/post/save/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.includeSave).toEqual(true);
  });

  test('Deve retornar o post salvo', async () => {
    const response = await request.get(`/post/list/save/`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0]._id).toEqual(idPostValido);
  });

  test('Deve remover dos salvos um post', async () => {
    const response = await request.post(`/post/save/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body.includeSave).toEqual(false);
  });

  test('Deve retornar 500 quando um post inválido for enviado', async () => {
    const response = await request.post(`/post/like/11111111`).set(tokenValido);

    expect(response.statusCode).toEqual(500);
  });

  test('Deve retornar 400 com um comentário sem texto', async () => {
    const response = await request.post(`/post/comment/${idPostValido}`).send({ text: '' }).set(tokenValido);

    expect(response.statusCode).toEqual(400);
  });

  test('Deve retornar 500 quando um comentário inválido for enviado', async () => {
    const response = await request
      .post(`/post/comment/11111111`)
      .set(tokenValido)
      .send({ text: 'Isso é um comentario' });

    expect(response.statusCode).toEqual(500);
  });

  test('Deve enviar um comentario novo', async () => {
    const response = await request
      .post(`/post/comment/${idPostValido}`)
      .set(tokenValido)
      .send({ text: 'Isso é um comentario' });

    idComentarioValido = response.body.id;
    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toBeDefined();
  });

  test('Deve enviar um comentario como resposta', async () => {
    const response = await request
      .post(`/post/comment/${idPostValido}`)
      .set(tokenValido)
      .send({ text: 'Isso é uma resposta', replie: idComentarioValido });

    idComentarioValido = response.body.id;
    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.replie).toBeDefined();
  });

  test('Deve Editar um comentario', async () => {
    const response = await request
      .put(`/post/comment/${idComentarioValido}`)
      .set(tokenValido)
      .send({ text: 'Novo texto do comentário' });

    expect(response.statusCode).toEqual(200);
  });

  test('Deve retornar 404 para um comentário não encontrado', async () => {
    const response = await request
      .put(`/post/comment/61151403a98cbbc6de55a204`)
      .set(tokenValido)
      .send({ text: 'Novo texto do comentário' });

    expect(response.statusCode).toEqual(404);
  });

  test('Deve desfazer um comentário', async () => {
    const response = await request.delete(`/post/comment/${idComentarioValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
  });

  test('Obter os posts de si mesmo', async () => {
    const response = await request.get(`/posts/user/${user.id}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].body).toBeDefined();
  });

  test('Deve Deletar um post!', async () => {
    const response = await request.delete(`/post/${idPostValido}`).set(tokenValido);

    expect(response.statusCode).toEqual(200);
  });

  test('Deve retornar 404 ao tentar deletar um post que não existe', async () => {
    const response = await request.delete(`/post/111111111111111111111111`).set(tokenValido);

    expect(response.statusCode).toEqual(404);
  });

  test('Deve retornar 500 ao passar um parametro invalido', async () => {
    const response = await request.delete(`/post/111`).set(tokenValido);

    expect(response.statusCode).toEqual(500);
  });
});
