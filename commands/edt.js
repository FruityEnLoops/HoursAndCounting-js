const ical = require('node-ical');
const Discord = require('discord.js');
const { goodColor, errorColor, DATE_FORMAT_OPTIONS } = require('../config.json');
const { sameDay, searchForCalendarByArg, getNextDayOfWeek, pad } = require("./../helpers")

module.exports = {
    name: 'edt',
    description: 'Get the specified day\'s timetable for your or a specified group.',
    execute(message, args) {
        let date;
        let cal;

        for (let arg of args) {
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

            if (cal == null) {
                cal = searchForCalendarByArg(arg);
            }
        }

        if (date == null) {
            date = new Date(); // if date has not been defined by user, use today as default
        }

        if (cal == null) {
            if (message.member != null)
                cal = getCalendarFromRoles(message.member); // if no calendar was specified during args parsing, try to find one in the user's roles
            if (cal == null) {
                message.channel.send(`error : couldn't find which calendar to display (did you specify it / do you have the right roles?)`);
                return;
            }
        }
        printIcal(message, cal, date);
    },
};

function printIcal(message, calendar, date) {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const response = new Discord.MessageEmbed()
        .setTitle(date.toLocaleDateString('fr-FR', options) + " - " + calendar.name)
        .setFooter('Requested by @' + message.author.username, message.author.avatarURL())
        .setColor(goodColor);
    ical.async.fromURL(calendar.url, {}, function (err, data) {
        let todaysEvents = [];
        for (let element in data) {
            if (data[element].type == 'VEVENT') {
                if (sameDay(new Date(data[element].start), date)) {
                    todaysEvents.push(data[element]);
                }
            }
        }

        if (todaysEvents.length == 0) {
            response.addField(`Pas de cours aujourd'hui`, `~~bon chômage~~`);
            response.setColor(errorColor)
            message.channel.send(response);
            return;
        }

        todaysEvents.sort(function (a, b) {
            let dateA = new Date(a.start);
            let dateB = new Date(b.start);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return 0;
        });

        for (let e of todaysEvents) {
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


