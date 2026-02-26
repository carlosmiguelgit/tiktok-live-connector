const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta", PORT);
});

const tiktokUsername = "ellinderoo";

let ranking = {};
let tiktokLiveConnection;

function startConnection() {
  console.log("Tentando conectar na live...");

  tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    enableExtendedGiftInfo: true
  });

  tiktokLiveConnection.connect()
    .then(() => {
      console.log("Conectado à live!");
    })
    .catch(err => {
      console.error("Erro ao conectar:", err);
      setTimeout(startConnection, 5000);
    });

  tiktokLiveConnection.on("like", data => {
    if (!ranking[data.uniqueId]) {
      ranking[data.uniqueId] = {
        name: data.nickname,
        photo: data.profilePictureUrl,
        likes: 0
      };
    }

    ranking[data.uniqueId].likes += data.likeCount;

    io.emit("like", ranking[data.uniqueId]);
  });

  tiktokLiveConnection.on("disconnected", () => {
    console.log("Desconectado. Tentando reconectar...");
    setTimeout(startConnection, 5000);
  });
}

startConnection();