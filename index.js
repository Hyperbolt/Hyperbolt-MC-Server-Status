const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        'GUILD_PRESENCES'
    ],
})
require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //const presences = [];

    //let counter = 0;

    function updateStatus() {
        client.user.setPresence({ activities: [{ name: `Waiting For The Server To Launch` }], status: 'dnd' });

        //if (++conter >= presences.length) { counter = 0; };
    }

    updateStatus();
    setInterval(() => {
        updateStatus();
    }, 24 * 60 * 60 * 1000);
});

client.login(process.env.TOKEN);