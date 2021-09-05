const ical = require('node-ical');
const calendars = require('../calendars.json');
const Discord = require('discord.js');

module.exports = {
	name: 'edt',
	description: 'Get the specified day\'s timetable for your or a specified group.',
	execute(message, args) {
        let date;
        let cal;
        
        for(let arg of args){
            arg = arg.toLowerCase();

            // TODO : clean this messy switch
            switch (arg) {
                case 'demain':
                    date = new Date();
                    date.setDate(date.getDate() + 1);
                    break;
                case 'lundi':
                    date = getNextDayOfWeek(new Date(), 1);
                    break;
                case 'mardi':
                    date = getNextDayOfWeek(new Date(), 2);
                    break;
                case 'mercredi':
                    date = getNextDayOfWeek(new Date(), 3);
                    break;
                case 'jeudi':
                    date = getNextDayOfWeek(new Date(), 4);
                    break;
                case 'vendredi':
                    date = getNextDayOfWeek(new Date(), 5);
                    break;
                case 'samedi':
                    date = getNextDayOfWeek(new Date(), 6);
                    break;
                case 'dimanche':
                    date = getNextDayOfWeek(new Date(), 7);
                    break;
            }
            
            calendar = searchForCalendarInArg(arg);
        }

        if(date == null) {
            date = new Date(); // if date has not been defined by user, use today as default
        }

        if(cal == null) {
            cal = getCalendarFromRoles(message.member); // if no calendar was specified during args parsing, try to find one in the user's roles
            if(cal == null) {
                message.channel.send('error : no suitable arguments or role found');
                return;
            }
        }
		printIcal(message, cal, date);
	},
};

function printIcal(message, calendar, date){
    const response = new Discord.MessageEmbed()
        .setTitle(date.toLocaleDateString('fr-FR') + " - " + calendar.name)
        .setColor('#00ff00');
    ical.async.fromURL(calendar.url, {}, function (err, data) {
        let todaysEvents = [];
        for(let element in data){
            if(data[element].type == 'VEVENT'){
                if(sameDay(new Date(data[element].start), date)) {
                    todaysEvents.push(data[element]);
                }
            }
        }

        if(todaysEvents.length == 0) {
            response.addField(`Pas de cours aujourd'hui`, `~~bon chômage~~`);
            response.setColor('#ff0000')
            message.channel.send(response);
            return;
        }

        todaysEvents.sort(function(a, b) {
            let dateA = new Date(a.start);
            let dateB = new Date(b.start);
            if(dateA < dateB) return -1;
            if(dateA > dateB) return 1;
            return 0;
        });
        
        for(let e of todaysEvents) {
            let startTime = new Date(e.start);
            let endTime = new Date(e.end);
            response.addField(
                e.description.val,
                startTime.getHours() + "h" + pad(startTime.getMinutes(), 2) + " -> " + endTime.getHours() + "h" + pad(endTime.getMinutes(), 2)
            );
        }
        message.channel.send(response);
    });
}

function searchForCalendarInArg(arg) {
    for(let calendar of calendars) {
        for(let alias of calendar.alias) {
            if(alias.toLowerCase() == arg) {
                return calendar;
            }
        }
    }
}

function getCalendarFromRoles(member) {
    for(let calendar of calendars) {
        for(let alias of calendar.alias) {
            if(member.roles.cache.some(role => role.name.toLowerCase() === alias.toLowerCase())) {
                return calendar;
            }
        }
    }
}

// https://stackoverflow.com/a/43855221
function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
}

function getNextDayOfWeek(date, dayOfWeek) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}