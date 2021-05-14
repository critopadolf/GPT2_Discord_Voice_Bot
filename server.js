const http = require('http');
var express = require('express')
var bodyParser = require('body-parser');
//var discordBot = require('./stt.js')
const hostname = '127.0.0.1';
const port = 3000;

const server = express()


server.post('/', function(req, resp){
  //console.log(request.body)
  //console.log(request.json);      // your JSON
  //response.send(request.body);    // echo the result back
  var body = 'body: '
  req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
  });
  req.on('end', () => {
      console.log(body);
      discordBot.discordClient.send(body['GPT2_RESULT'])
      resp.end('ok');
  });
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
server.use(bodyParser.json())

