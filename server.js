// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let totalTime = 0; // Variável para armazenar o tempo total
let clientCount = 0; // Contador de clientes conectados

// Atualiza o tempo total e envia para todos os clientes a cada segundo
setInterval(() => {
  if (clientCount > 0) { // Verifica se há pelo menos um cliente conectado
    totalTime++; // Incrementa o tempo total
    io.emit('updateTotalTime', totalTime); // Enviamos o tempo total para todos os clientes
  }
}, 1000);

io.on('connection', (socket) => {
  // Envia o tempo total e o número de clientes para o novo cliente quando ele se conecta
  socket.emit('updateTotalTime', totalTime);
  socket.emit('updateClientCount', clientCount);

  // Incrementa o contador de clientes conectados
  clientCount++;
  io.emit('updateClientCount', clientCount);

  // Quando um cliente desconectar, decrementamos o contador de clientes conectados
  socket.on('disconnect', () => {
    clientCount--;
    io.emit('updateClientCount', clientCount);
  });
});

// Rota padrão para servir o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Configura o servidor para servir arquivos estáticos
app.use(express.static('public'));

server.listen(3500, () => {
  console.log('Server is running on port 3000');
});
