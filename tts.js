require('dotenv').config() //file with your bot credentials/token/etc
const config = require('./config')
const discord = require("discord.js");
const discordTTS=require("discord-tts");
const discordClient = new discord.Client();

discordClient.login(config.discordApiToken);
 
discordClient.on("ready",()=>{
    console.log("Online");
});
 
discordClient.on("message", async (msg) =>{
	console.log("hello")
	await discordClient.voice.connections.map(async (voiceConnection) => {
	    const stream = discordTTS.getVoiceStream(msg.content);
        voiceConnection.play(stream);
        //dispatcher.on("finish",()=>voiceChannel.leave())	
	});
	/*
    if(msg.author.id==="709865307258486825"){
        const voiceChannel = msg.member.voice.channel;
        voiceChannel.join().then(connection => {
            const stream = discordTTS.getVoiceStream(msg.content);
            const dispatcher = connection.play(stream);
            dispatcher.on("finish",()=>voiceChannel.leave())
        });
    }
    */
});

discordClient.on('ready', async () => {
	const memberVoiceChannel = discordClient.channels.get("709866996040204292")
	const connection = await memberVoiceChannel.join()	
});