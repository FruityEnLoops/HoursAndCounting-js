const ical = require('node-ical');
const calendars = require('../calendars.json');
const Discord = require('discord.js');

module.exports = {
	name: 'edt',
	description: 'Get the current day\'s timetable for your or a specified group.',
	execute(message) {
        // TODO : read args for date / specific calendar
        // 
        // TODO : Search for calendar url based on roles 
        // let url = getCalUrlFromRoles(message.member.roles);
		printIcal(message, calendars[0], new Date("2021-09-03"));
	},
};

function printIcal(message, calendar, date){
    const response = new Discord.MessageEmbed()
        .setTitle(date.toDateString() + " - " + calendar.alias)
        .setAuthor("HoursAndCounting");
    ical.async.fromURL(calendar.url, {}, function (err, data) {
        console.log(data);
        for(let element in data){
            if(data[element].type == 'VEVENT'){
                if(sameDay(new Date(data[element].start), date)) {
                    let startTime = new Date(data[element].start);
                    let endTime = new Date(data[element].end);
                    response.addField(
                        data[element].description.val,
                        startTime.getHours() + "h" + startTime.getMinutes() + " -> " + endTime.getHours() + "h" + endTime.getMinutes()
                    );
                }
            }
        }
        message.channel.send(response);
    });    
}

// https://stackoverflow.com/a/43855221
function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }