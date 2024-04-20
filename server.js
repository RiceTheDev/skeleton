// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    // Serve a página HTML quando a rota raiz é acessada
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/data' && req.method === 'GET') {
    // Retorna os dados necessários para a página HTML quando a rota /data é acessada
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ totalTime, clientCount }));
  } else {
    // Se a rota não for encontrada, retorna um erro 404
    res.writeHead(404);
    res.end('Not Found');
  }
});

const io = socketIo(server);

let totalTime = 0; // Tempo total
let clientCount = 0; // Contador de clientes

// Atualiza o tempo total e envia para todos os clientes a cada segundo
const timerId = setInterval(() => {
  if (clientCount > 0) {
    totalTime++;
    io.emit('updateTotalTime', totalTime);
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

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
