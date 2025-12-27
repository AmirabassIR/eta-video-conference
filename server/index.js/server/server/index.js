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
<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8" />
  <title>🛡 ETA Video Conference</title>
  <style>
    body {
      background: #0f172a;
      color: #fff;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    }
    video {
      width: 45%;
      border: 2px solid #22c55e;
      border-radius: 10px;
      margin: 5px;
    }
    .controls button {
      padding: 10px 15px;
      margin: 5px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: #22c55e;
      color: #000;
    }
  </style>
</head>
<body>

<h1>🎥 کنفرانس ویدیویی ایتا (نسخه تست)</h1>

<div class="videos">
  <video id="localVideo" autoplay muted></video>
  <video id="remoteVideo" autoplay></video>
</div>

<div class="controls">
  <button onclick="startCall()">📞 شروع تماس</button>
  <button onclick="toggleMute()">🎤 Mute/Unmute</button>
  <button onclick="toggleVideo()">🎥 Camera On/Off</button>
</div>

<script>
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let pc;

// وقتی صفحه بارگذاری شد
async function initMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = localStream;
  } catch(e) {
    alert("دسترسی به دوربین/میکروفن داده نشده!");
  }
}

async function startCall() {
  // فقط برای تست UI – هنوز WebRTC/Server نداره
  alert("📡 تماس شروع شد!\nاین نسخه فعلاً فقط رابط کاربریه.");
}

function toggleMute() {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
}

function toggleVideo() {
  if (!localStream) return;
  localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
}

initMedia();
</script>

</body>
</html>
