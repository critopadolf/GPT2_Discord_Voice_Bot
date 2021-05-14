//https://refruity.xyz/writing-discord-bot/
require('dotenv').config()
const Discord = require('discord.js')
const say = require('say');
const config = require('./config')
const discordClient = new Discord.Client()
const googleSpeech = require('@google-cloud/speech')
const googleSpeechClient = new googleSpeech.SpeechClient()
const fs = require('fs');
const filename = "MessageQueue.json"
const url = "http://127.0.0.1:5000/gather"
const discordTTS=require("discord-tts");
//JQUERY
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
//Transform 2 channel stream to 1 channel
const { Transform } = require('stream')

function convertBufferTo1Channel(buffer) {
  const convertedBuffer = Buffer.alloc(buffer.length / 2)

  for (let i = 0; i < convertedBuffer.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    convertedBuffer.writeUInt16LE(uint16, i * 2)
  }

  return convertedBuffer
}

class ConvertTo1ChannelStream extends Transform {
  constructor(source, options) {
    super(options)
  }

  _transform(data, encoding, next) {
    next(null, convertBufferTo1Channel(data))
  }
}


async function listen() {
  console.log(`Logged in as ${discordClient.user.tag}!`)
  //const member = newPresence.member
  //const presence = newPresence
  //const memberVoiceChannel = member.voice.channel
  const memberVoiceChannel = discordClient.channels.get(voice_key)
  /*
  if (!presence || !presence.activity || !presence.activity.name || !memberVoiceChannel) {
    return
  }
  */

  const connection = await memberVoiceChannel.join()
  const receiver = connection.receiver

  connection.on('speaking', (user, speaking) => {
    while (!speaking) {
      return
    }

    console.log(`I'm listening to ${user.username}`)

    // this creates a 16-bit signed PCM, stereo 48KHz stream
    const audioStream = receiver.createStream(user, { mode: 'pcm' })
    const requestConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: 'en-US'
    }
    const request = {
      config: requestConfig
    }
    const recognizeStream = googleSpeechClient
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', response => {
        const transcription = author + ' ' + (response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n'))+"\n" + recipient

          .toLowerCase()
        console.log(`Transcription: ${transcription}`)
        //feed transcription to Flask server
        var data ={SpeechResult:transcription,server_key:voice_key}
        $.post(url,data, function(data,status){console.log('${data} and status is ${status}')})
      })

    const convertTo1ChannelStream = new ConvertTo1ChannelStream()

    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)

    audioStream.on('end', async () => {
      console.log('audioStream end')
    })
  })
}

var author = 'Zuko'
var recipient = 'Iroh'
var voice_key = '709866996040204292'
const prefix = '!'
var peopleTracker = new Map();
var bodybodyTracker = new Map();
function roleCall(message,name)
{
	if(name != "@everyone")
		{message.channel.send(name);}
}
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}
discordClient.on('message', message => {
  var i = 0;
  if(!message.author.bot)
  {
  	if(peopleTracker.has(message.author.id))
  	{
  		i = peopleTracker.get(message.author.id) + 1;
  		peopleTracker.set(message.author.id, i);
  	}
  	else
  	{
  		i = 1;
  		peopleTracker.set(message.author.id,1);
  	}
  }
  if(i > 3)
  {
  	//message.delete(1000);
  	//message.channel.send("STOP, YOU'VE VIOLATED THE LAW");
  }
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const content = message.content.slice(prefix.length+command.length+1);
  if(command == 'count')
  {
  	message.channel.send(i);
  }
  else if (command === 'author') {
    message.channel.send('You are now talking as ' + args[0] + ' to ' + args[1]);
    author = args[0];
    recipient = args[1];
  }

  else if(command === 'talk'){
  	console.log(author + ' ' + content + '\n' + recipient);
    var data ={SpeechResult:author + ' ' + content + '\n' + recipient,server_key:message.channel.id};
    $.post(url,data, function(data,status){console.log('${data} and status is ${status}')});
  }
  /*
  else if(command === 'help'){
  	var c0 = 'Currently speaking as ' + author + ' to ' + recipient;
    var c1 = '!author p1 p2\tp1 is who you talk as, p2 is who you talk to';
    var c2 = '!talk\t        manually pass text to get a TTS response from GPT2';
    message.channel.send(c0 + '\n' + c1 + '\n' + c2);
  }
  */
  else if(command == "role"){
  	message.member.roles.forEach(r => roleCall(message, r.name) );
	
  }
  else if(command === 'voice') {
  	voice_key = message.member.voice.channelID
  	listen()
  }
  else if(command == 'name')
  {
  	message.channel.send('my middle name?\n It’s koi!\n Ike Koi Todoroki\n it reminds me of a fish\n they’re so calming!')
  }
  else if(command == 'bodybody')
  {
  	bodybodyTracker = new Map();
  	message.channel.send('use !join to join');
  	bodybodyTracker.set(message.author,0);
  }
  else if(command == 'join')
  {
  	bodybodyTracker.set(message.author,0);
  	message.channel.send(bodybodyTracker.size);
  }
  else if(command == 'start')
  {
  	message.channel.send('starting');
  	var killerCount = parseInt(content);
  	var len = bodybodyTracker.size;
  	var bbt = Array.from(bodybodyTracker.keys()); 
  	killerCount = killerCount * (killerCount <= bbt.length) + bbt.length * (killerCount > bbt.length);
  	//sampl = random.sample(bbt, bbt.length);
  	sampl = getRandomSubarray(bbt, bbt.length);
  	for(var y = 0; y < sampl.length; y++)
  	{
  		if(y < killerCount)
  		{
  			sampl[y].send('you are a Killer');
  		}
  		else
  		{
  			sampl[y].send('you are Innocent');
  		}
  	}
  }
  // other commands...
});
discordClient.on('ready', async () => {
  //console.log('New Presence:', newPresence)
  await listen()
})
discordClient.login(config.discordApiToken)



const http = require('http');
var express = require('express')
var bodyParser = require('body-parser');
//var discordBot = require('./stt.js')
const hostname = '127.0.0.1';
const port = 3000;
//code.iamkate.com
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
const server = express()
var queue = new Queue()

server.post('/', function(req, resp){
  //console.log(request.body)
  //console.log(request.json);      // your JSON
  //response.send(request.body);    // echo the result back
  var body = ''
  req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
  });
  req.on('end', async () => {
      console.log(body);
      //discordClient.send(body['GPT2_RESULT'])
      body = JSON.parse(body)
      var txt = body['GPT2_RESULT']
      var ser = body['server_key']
      if(txt && txt != '') {
          discordClient.channels.get('709866996040204291').send(txt);
          queue.enqueue(txt)
      }
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
function delay(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, x);
  });
}
async function tts()
{
  //while(true)
  {
    while(queue.isEmpty())
    { 
      await delay(10)
    }

    var txt = queue.dequeue()
    x = 0
    await discordClient.voice.connections.map(async (voiceConnection) => {
        const stream = discordTTS.getVoiceStream(txt);
        const dispatcher = voiceConnection.play(stream); 
        done = false
        //call recursively on vc completion
        //only gets called once 
        if(x == 0)
    		{dispatcher.on("finish",()=>tts())}
    	x++
    });

  }
}

tts()


