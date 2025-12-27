module.exports = ws => {
  let count = 0;
  const interval = setInterval(() => count = 0, 1000);

  ws.on('message', () => {
    count++;
    if (count > 15) ws.close();
  });

  ws.on('close', () => clearInterval(interval));
};
