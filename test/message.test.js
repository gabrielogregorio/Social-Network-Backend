let {app, mongoose} = require('../src/app');
let supertest = require('supertest');
const request = supertest(app);
let token2ValidoMessage = ''
let tokenValidoMessage = ''
require('dotenv/config')
 
let user = {
  name: process.env.TEST_USER_NAME  + 'message',
  email: process.env.TEST_USER_NAME  + 'message',
  username: process.env.TEST_USER_NAME  + 'message',
  password: process.env.TEST_USER_NAME  + 'message',
  idMessage: ''
}

let user2 = {
  name: process.env.TEST_USER2_NAME  + 'message',
  email: process.env.TEST_USER2_NAME  + 'message',
  username: process.env.TEST_USER2_NAME  + 'message',
  password: process.env.TEST_USER2_NAME + 'message',
  idMessage: ''
}


beforeAll(() => {
  return request.post('/configure')
  .send({extra: 'message'})
    .then(() => {})
})


describe("Login no sistema", () => {
  test("Deve acessar o sistema e fornecer um token válido para os outros testes", () => {
    return request.post('/auth')
      .send({email: user.email, password: user.password})
      .then(res => {
        tokenValidoMessage = { authorization:"Bearer " + res.body.token}
        user.idMessage = res.body.id;
      }).catch(error => {
        fail(error)
      })
  })

  test("Segundo usuário também deve logar e conseguir um token", () => {
    return request.post('/auth')
      .send({email: user2.email, password: user2.password})
      .then(res => {
        token2ValidoMessage = { authorization:"Bearer " + res.body.token}
        user2.idMessage = res.body.id;
      }).catch(error => {fail(error)})
  })
})


describe('Envio de mensagens', () => {
  test("Usuário 1 não deve conseguir enviar uma mensagem sem os parametros", () => {
    return request.post('/message')
      .send({})
      .set(tokenValidoMessage)
      .then(res => {
        expect(res.statusCode).toEqual(400)
      })
  })
  test("Usuário 1 deve enviar uma mensagem para o usuário 2", () => {
    return request.post('/message')
      .send({to: user2.idMessage, message: 'Olá mi amigo!', test: 'true'})
      .set(tokenValidoMessage)
      .then(res => {
        expect(res.statusCode).toEqual(200)
      })
  })
 
  test("Usuário 1 deve obter todas as mensagens enviadas", () => {
    return request.get('/messages')
      .set(tokenValidoMessage)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].message).toEqual('Olá mi amigo!')
        expect(res.body[0].to._id).toEqual(user2.idMessage)
      })
  })

  test("Usuário 1 deve obter todas as mensagens enviadas ao usuário 2", () => {
    return request.get(`/message/${user2.idMessage}`)
      .set(tokenValidoMessage)
      .then(res => {
        expect(res.statusCode).toEqual(200)
      })
  })

  test("Usuário 1 deve obter todas as pessoas que interagiu", () => {
    return request.get('/messages/users')
      .set(tokenValidoMessage)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0]._id).toEqual(user2.idMessage)
      })
  })
})


beforeAll(async() => {
  await request.post('/endconfigure').send({extra: 'message'})
  return await request.post('/configure')
})
