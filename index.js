// TODO: ADD AUTO CLEARING WHEN THE STATUS UPDATES TO ONLINE





import Discord from 'discord.js';
import ms from 'ms';
import dotenv from 'dotenv';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fetch from 'node-fetch';
const client = new Discord.Client({
    intents: [
        //https://ziad87.net/intents/
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES"
    ],
    partials: [
        "MESSAGE",
        //"CHANNEL",
        //"REACTION",
        "GUILD_MEMBER",
        //"USER"
    ]
});
dotenv.config();

const ip = process.env.IP;
const port = process.env.PORT || 25565;

resetStatus()

let currentlyOnline = false;
let currentPlayers = null;
let maintenanceMode = false;
let customMessage = 'Hello world';
let oldStatus = 0;
let currentStatus = 0;

// maintenance 2
// offline 0
// online 1


function resetStatus() {
    getServerInfo().then(res => {
        if (res.online === false || res.offline === true) {
            getServerInfoV1().then(function(resSecond) {
                if(resSecond.online === false || resSecond.offline === true) {
                    currentlyOnline = false;
                    currentPlayers = null;
                    console.log('The server is offline!');
                } else {
                    if (resSecond.version === "Maintenance") {
                        maintenanceMode = true
                    } else {
                        maintenanceMode = false
                    }
                    currentlyOnline = true;
                    currentPlayers = `${resSecond.players.online}/${resSecond.players.max}`;
                    console.log(`The server is online!\nCurrent Players: ${currentPlayers}!`);
                }
            })
        } else {
            if (res.version === "Maintenance") {
                maintenanceMode = true
            } else {
                maintenanceMode = false
            }
            currentlyOnline = true;
            currentPlayers = `${res.players.online}/${res.players.max}`;
            console.log(`The server is online!\nCurrent Players: ${currentPlayers}!`);
        }
    }).catch(e => {
        console.log(e);
    })
}

async function getServerInfo() {
    const response = await fetch(`https://api.mcsrvstat.us/2/${ip}:${port}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    return data;
}

async function getServerInfoV1() {
    const response = await fetch(`https://api.mcsrvstat.us/1/${ip}:${port}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    return data;
}

function updateStatus() {
    const channel = client.channels.cache.get(process.env.CHANNELID);
    if (!channel) return new error('Channel ID is undefined!');

    if (!process.env.MESSAGEID) {
        const setupEmbed = new Discord.MessageEmbed()
        .setTitle('Setting up!')
        .setDescription('The bot is currently being set up! This is a message to grab the message ID from witch we can then edit this message!')
        .setTimestamp()

        
        channel.send({ embeds: [setupEmbed] }).then(() => {
            console.log('SETUP MODE ACTIVATED UNTIL MESSAGEID IS DEFINED IN THE .env FILE!')
            process.exit();
        });
    }

    if (maintenanceMode === true) {
        currentStatus = 2;
    } else if (currentlyOnline === true) {
        currentStatus = 1;
    } else {
        currentStatus = 0;
    }

    // maintenance 2
    // offline 0
    // online 1

    console.log(currentStatus);
    console.log(oldStatus);

    if (currentStatus === 1 && !oldStatus === 1) {
        console.log('Switch to online');
        customMessage = undefined;
        oldStatus = 1;
    }

    if (maintenanceMode === true) {
        client.user.setPresence({ activities: [{ name: `The Developers!`, type: 'WATCHING' }], status: 'idle' });
    } else if (currentlyOnline === true) {
        client.user.setPresence({ activities: [{ name: `With ${currentPlayers} Players!`, type: 'PLAYING' }], status: 'online' });
    } else {
        client.user.setPresence({ activities: [{ name: `An Offline Server!`, type: 'WATCHING' }], status: 'dnd' });
    }

    channel.messages.fetch(process.env.MESSAGEID).then(msg => {
        if (maintenanceMode === true) {
            const Embed = new Discord.MessageEmbed()
            .setColor('#FFA500')
            .setTitle('Hyperbolt MC Server Status!')
            .setURL('https://hyperbolt.xyz/')
            .setAuthor('Hyperbolt', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg', 'https://hyperbolt.xyz/')
            .setDescription(`The Server is currently online but maintenance mode is active, witch means the server is currently undergoing maintenance!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg')
            .addFields(
                { name: 'Am I Still Able to Connect?', value: 'No because the server is in maintenance mode we restrict the server to only staff members and developers.'},
                { name: 'Ammout of online players:', value: currentPlayers },
                { name: 'Connection IP:', value: process.env.DISPLAYIP },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/Reason:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter('This message updates every 30 seconds! Some information could be incorrect due to caching reasons!', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg');
            msg.edit({ embeds: [Embed] })
        } else if (currentlyOnline === true) {
            const Embed = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Hyperbolt MC Server Status!')
            .setURL('https://hyperbolt.xyz/')
            .setAuthor('Hyperbolt', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg', 'https://hyperbolt.xyz/')
            .setDescription(`The Server is currently online! To connect paste ${process.env.DISPLAYIP} into dirrect connect under the muliplayer section!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg')
            .addFields(
                { name: 'Ammout of online players:', value: currentPlayers },
                { name: 'Connection IP:', value: process.env.DISPLAYIP },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/s:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter('This message updates every 30 seconds! Some information could be incorrect due to caching reasons!', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg');
            msg.edit({ embeds: [Embed] })
        } else {
            const Embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Hyperbolt MC Server Status!')
            .setURL('https://hyperbolt.xyz/')
            .setAuthor('Hyperbolt', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg', 'https://hyperbolt.xyz/')
            .setDescription(`The Server is currently offline!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg')
            .addFields(
                { name: 'Connection IP:', value: process.env.DISPLAYIP },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/Reason:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter('This message updates every 30 seconds! Some information could be incorrect due to caching reasons!', 'https://cdn.discordapp.com/attachments/723040879501115444/801996767934939196/Hyperbolt_Logo_500_x_500_New_JPG.jpg');
            msg.edit({ embeds: [Embed] })
        }
    });
    console.log('Status has been updated!')
}

client.on('ready', c => {
    console.log(`Logged in as ${c.user.tag}`);
    updateStatus();
    setInterval(() => {
        updateStatus();
    }, ms('30s'));

    const commands = [
        new SlashCommandBuilder().setName('setmessage').setDescription('Sets the custom messagge!')
        .addStringOption((option) => option.setName('message').setDescription('The message you want to set the custom message to!')),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    rest.put(Routes.applicationGuildCommands(c.user.id, '718429580817465445'), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
});

setInterval(() => {
    resetStatus();
}, ms('30s'));

client.on('messageCreate', message => {
    if (message.author.bot) return;
    
    let prefix = '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (cmd === 'setmessage') {
        if (!message.member.permissions.has('MANAGE_GUILD')) return message.reply('You are missing the permission `MANAGE_GUILD`!')
        if (!args.length >= 1) {
            customMessage = undefined;
            message.reply('The status has been cleared!');
        } else {
            customMessage = args.join(' ');
            message.reply('The status has been changed!');
        }
        updateStatus();
    }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'setmessage') {
        if (!interaction.memberPermissions.has('MANAGE_GUILD')) return interaction.reply({ content: 'You are missing the permission `MANAGE_GUILD`!', ephemeral: true })
        let args = interaction.options.getString('message');
        if (args === null) {
            customMessage = undefined;
            interaction.reply({ content: 'The status has been cleared!', ephemeral: true });
        } else {
            customMessage = args;
            interaction.reply({ content: 'The status has been changed!', ephemeral: true });
        }
        updateStatus();
	} 
});

client.login(process.env.TOKEN);