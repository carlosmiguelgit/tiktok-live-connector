const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

const tiktokUsername = "ellinderoo"; // SEM @

const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
  console.log("Conectado à live!");
}).catch(err => {
  console.error("Erro ao conectar:", err);
});

let ranking = {};

tiktokLiveConnection.on("like", data => {
  console.log("LIKE RECEBIDO:", data.likeCount);

  if(!ranking[data.uniqueId]){
    ranking[data.uniqueId] = {
      name: data.nickname,
      photo: data.profilePictureUrl,
      likes: 0
    };
  }

  ranking[data.uniqueId].likes += data.likeCount;

  io.emit("like", ranking[data.uniqueId]);
});