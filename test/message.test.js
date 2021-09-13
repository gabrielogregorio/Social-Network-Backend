let {app, mongoose} = require('../src/app');
let supertest = require('supertest');
const request = supertest(app);
let tokenValidoMessage = ''
 
let user = {
  name: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  email: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  username: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  password: 'AJSKEW34FDAGS@AJSKEW34FDAGS.com',
  idMessage: ''
}

let user2 = {
  name: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  email: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  username: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  password: 'LPODHUIOQWNF@LPODHUIOQWNF.com',
  idMessage: ''
}


beforeAll(() => {
  return request.post('/user').send(user).then(res => {
    return request.post('/user').send(user2).then(res => {
      return request.post('/auth').send({email: user.email, password: user.password}).then(res => {
        tokenValidoMessage = { authorization:"Bearer " + res.body.token}
        user.idMessage = res.body.id;
        return request.post('/auth').send({email: user2.email, password: user2.password}).then(res => {
            user2.idMessage = res.body.id;
            return
        })
      })
    })
  })
})
afterAll(() => {
  return request.delete(`/user/${user.email}`).then(() => {
    return request.delete(`/user/${user2.email}`).then(() => {
      return mongoose.connection.close();
    })
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


