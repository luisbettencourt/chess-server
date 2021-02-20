const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
var cors = require("cors");
const {MyRoom} = require("./room");
const port = process.env.PORT || 3000;

console.log(port)
const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new colyseus.Server({
  server: http.createServer(app)
});

app.get('/', function (req, res) {
  console.log('request')
  res.send('GET request to the homepage')
})

gameServer.listen(port);
gameServer.define("room", MyRoom);