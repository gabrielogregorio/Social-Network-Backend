let {app, mongoose}  = require('../src/app');
//const { Server } = require('socket.io');

const server = app.listen(3333, () => {
  console.log('server is running!');
})

/*
// socket.io para tornar as coisas mais dinamicas. Ainda é preciso extruturar melhor como tudo isso vai
acontecer
const io = new Server(server, { cors: { origin: 'http://127.0.0.1:8080' } });

io.on('connection', function(socket) {
  console.log(socket.id)
  socket.on('SEND_MESSAGE', function(data) {
        io.emit('MESSAGE', data)
    });
})  
*/
