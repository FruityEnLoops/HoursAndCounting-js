const Discord = require('discord.js');
const { goodColor } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'Display the help message.',
	execute(message) {
		const response = new Discord.MessageEmbed()
			.setTitle('Aide')
			.setURL('https://github.com/FruityEnLoops/HoursAndCounting-js')
			.setAuthor('HoursAndCounting', 'https://i.imgur.com/J27Atoa.png', 'https://github.com/FruityEnLoops/HoursAndCounting-js')
			.setColor(goodColor)
			.setFooter('Développé par blobdash', 'https://i.imgur.com/7dIyraU.png')

		response.addFields(
			{ name: '!edt [demain || jour] [groupe]', value: `Affiche le calendrier d'aujourd'hui / du jour spécifié, pour le groupe dont vous avez le rôle / du calendrier spécifié.` },
			{ name: '!edtlist', value: 'Affiche la liste des calendriers, et les alias par lesquels ils peuvent être appelés.' },
			{ name: '!rightnow', value: "Affiche le prochain cours dans un délai maximum d'une heure" },
			{ name: '!help', value: `Affiche ce message d'aide.` }
		);
		message.channel.send(response);
	},
};