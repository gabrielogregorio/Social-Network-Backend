let {app, mongoose} = require('../src/app');
let supertest = require('supertest');
let request = supertest(app)
let post = {body: 'Um body qualquer', test: true}
let post2 = {body: 'post2', test: true}
let idPostValido = "";
let tokenValido = {}
let idComentarioValido = "";
let token2Valido = { }
require('dotenv/config')
 
let user = {
  name: 'testUserPost@testUserPost.com',
  email: 'testUserPost@testUserPost.com',
  username: 'testUserPost@testUserPost.com',
  password: 'testUserPost@testUserPost.com',
  id: ''
}

let user2 = {
  name: 'testUserPost2@testUserPost2.com',
  email: 'testUserPost2@testUserPost2.com',
  username: 'testUserPost2@testUserPost2.com',
  password: 'testUserPost2@testUserPost2.com',
  id: ''
}


beforeAll(() => {
  return request.delete(`/image`).then(() => {
    return request.delete(`/user/${user.email}`).then(() => {
      return request.delete(`/user/${user2.email}`).then(() => {
        return request.post('/user').send(user).then(() => {
          return request.post('/user').send(user2).then(() => {
            return request.post('/auth').send({email: user.email, password: user.password}).then(res => {
              tokenValido = { authorization:"Bearer " + res.body.token}
              user.id = res.body.id;
              return request.post('/auth').send({email: user2.email, password: user2.password}).then(res => {        
                token2Valido = { authorization:"Bearer " + res.body.token}
                user2.id = res.body.id;
              })
            })
          })
        })
      })
    })
  })
})




// Upload de imagens não está incluso nos testes
afterAll(() => {
  return request.delete(`/image`).then(() => {
    return request.delete(`/user/${user.email}`).then(() => {
      return request.delete(`/user/${user2.email}`).then(() => {
        return mongoose.connection.close();
      })
    })
  })
})


describe('Gerenciamento de posts', () => {
  test("Deve cadastrar um post", () => {
    return request.post('/post')
      .send(post)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        idPostValido = res.body._id
    }).catch(error => {fail(error)})
  })

  test("Usuário 2 deve cadastrar um post", () => {
    return request.post('/post')
      .send(post2)
      .set(token2Valido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
    }).catch(error => {fail(error)})
  })

  test("Deve retornar apenas o post do usuário, pois o usuário ainda não segue ninguem", () => {
    return request.get('/posts')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].body).toEqual(post.body)
    })
  })
  
  test('Para ver os posts, um usuario deve seguir o outro', () => {
    return request.post(`/user/follow/${user2.id}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.followed).toEqual(true)
    })
  })

  test("Deve retornar uma lista com todos os posts e suas imagens", () => {
    return request.get('/posts')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].body).toEqual(post2.body)
    })
  })

  test("Deve compartilhar um post", () => {
    return request.post(`/post/share/${idPostValido}`)
      .send(post2)
      .set(token2Valido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
    }).catch(error => {fail(error)})
  })

  test("Deve retornar um post", () => {
    return request.get(`/post/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].user.name).toBeDefined()
        expect(res.body[0].body).toBeDefined()
    })
  })

  test("Deve retornar erro 500 para um parametro invalido", () => {
    return request.get('/post/aaa')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(500)
    })
  })

  test("Deve retornar erro 404 ao não encontrar o post", () => {
    return request.get('/post/111111111111111111111111')
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(404)
    })
  })

  test("Deve retornar erro 400 ao tentar editar um post passando parametros incorretos", () => {
    return request.put(`/post/${idPostValido}`, {})
      .set(tokenValido)
      .send({body: ''})
      .then(res => {
        expect(res.statusCode).toEqual(400)
    })
  })
  
  test("Deve permitir a edição de um post!", () => {
    return request.put(`/post/${idPostValido}`)
      .set(tokenValido)
      .send({body: 'test1z'})
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.body).toEqual('test1z')
    })
  })

  test("Não deve permitir a edição de um post por um usuário que não o postou", () => {
    return request.put(`/post/61157031ccc66931d08ce13b`)
      .set(tokenValido)
      .send({body: 'test1z'})
      .then(res => {
        expect(res.statusCode).toEqual(403)
    })
  })

  test("Deve enviar um like", () => {
    return request.post(`/post/like/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.includeLike).toEqual(true)
    })
  })

  test("Deve desfazer um like", () => {
    return request.post(`/post/like/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.includeLike).toEqual(false)
    })
  })

  test("Deve salvar um post", () => {
    return request.post(`/post/save/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.includeSave).toEqual(true)
    })
  })

  test("Deve retornar o post salvo", () => {
    return request.get(`/post/list/save/`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0]._id).toEqual(idPostValido)
      })
  })
  
  test("Deve remover dos salvos um post", () => {
    return request.post(`/post/save/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.includeSave).toEqual(false)
    })
  })

  test("Deve retornar 500 quando um post inválido for enviado", () => {
    return request.post(`/post/like/11111111`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(500)
    })
  })

  test("Deve retornar 400 com um comentário sem texto", () => {
    return request.post(`/post/comment/${idPostValido}`)
    .send({text: ''})
    .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(400)
    })
  })

  test("Deve retornar 500 quando um comentário inválido for enviado", () => {
    return request.post(`/post/comment/11111111`)
      .set(tokenValido)
      .send({text: 'Isso é um comentario'})
      .then(res => {
        expect(res.statusCode).toEqual(500)
    })
  })

  test("Deve enviar um comentario novo", () => {
    return request.post(`/post/comment/${idPostValido}`)
      .set(tokenValido)
      .send({text: 'Isso é um comentario'})
      .then(res => {
        idComentarioValido = res.body.id;
        expect(res.statusCode).toEqual(200)
        expect(res.body.id).toBeDefined()
    })
  })

  test("Deve enviar um comentario como resposta", () => {
    return request.post(`/post/comment/${idPostValido}`)
      .set(tokenValido)
      .send({text: 'Isso é uma resposta', replie: idComentarioValido})
      .then(res => {
        idComentarioValido = res.body.id;
        expect(res.statusCode).toEqual(200)
        expect(res.body.id).toBeDefined()
        expect(res.body.replie).toBeDefined()
    })
  })

  test("Deve Editar um comentario", () => {
    return request.put(`/post/comment/${idComentarioValido}`)
      .set(tokenValido)
      .send({text: 'Novo texto do comentário'})
      .then(res => {
        expect(res.statusCode).toEqual(200)
    })
  })

  test("Deve retornar 404 para um comentário não encontrado", () => {
    return request.put(`/post/comment/61151403a98cbbc6de55a204`)
      .set(tokenValido)
      .send({text: 'Novo texto do comentário'})
      .then(res => {
        expect(res.statusCode).toEqual(404)
    })
  })

  test("Deve desfazer um comentário", () => {
    return request.delete(`/post/comment/${idComentarioValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
    })
  })
 
  test("Obter os posts de si mesmo", () => {
    return request.get(`/posts/user/${user.id}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body[0].body).toBeDefined()
    })
  })

  test("Deve Deletar um post!", () => {
    return request.delete(`/post/${idPostValido}`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(200)
    })
  })

  test("Deve retornar 404 ao tentar deletar um post que não existe", () => {
    return request.delete(`/post/111111111111111111111111`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(404)
    })
  })

  test("Deve retornar 500 ao passar um parametro invalido", () => {
    return request.delete(`/post/111`)
      .set(tokenValido)
      .then(res => {
        expect(res.statusCode).toEqual(500)
    })
  })
})
