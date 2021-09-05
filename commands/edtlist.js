const calendars = require('../calendars.json');
const Discord = require('discord.js');

module.exports = {
	name: 'edtlist',
	description: 'Lists all available calendars',
	execute(message) {
		let response = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setTitle('List of calendars');

        for(calendar of calendars) {
            response.addField(calendar.name, 'Alias disponibles : ' + calendar.alias.join(', '));
        }
        message.channel.send(response);
	},
};