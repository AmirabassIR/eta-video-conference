const rooms = {};

exports.joinRoom = (ws, room) => {
  ws.room = room;
  rooms[room] = rooms[room] || [];
  rooms[room].push(ws);
};

exports.leaveRoom = ws => {
  if (!ws.room) return;
  rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
};

exports.getRoomUsers = room => rooms[room] || [];
