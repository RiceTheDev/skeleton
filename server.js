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
const timerId = setInterval(() => {
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

// Lê a variável de ambiente PORT, ou usa a porta 3000 como padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor para ouvir conexões na porta configurada
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Captura o evento beforeExit para encerrar o servidor corretamente
process.on('beforeExit', () => {
  clearInterval(timerId); // Para o intervalo que atualiza o tempo total.
  server.close(); // Encerra o servidor corretamente
});
