require('dotenv').config();
const WebSocket = require('ws');
const verifyToken = require('./auth');
const { joinRoom, leaveRoom, getRoomUsers } = require('./rooms');
const rateLimit = require('./rateLimit');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws, req) => {
  try {
    const token = new URL(req.url, 'http://x').searchParams.get('token');
    ws.user = verifyToken(token);
  } catch {
    return ws.close();
  }

  rateLimit(ws);

  ws.on('message', msg => {
    const data = JSON.parse(msg);

    if (data.join) joinRoom(ws, data.join);

    getRoomUsers(ws.room).forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    });
  });

  ws.on('close', () => leaveRoom(ws));
});

console.log('Server running on :3000');
