const { searchForCalendarByArg, getCalendarFromRoles, DATE_FORMAT_OPTIONS, pad, parseEventDescription, isInNextHour, sortEvents } = require("../helpers")
const ical = require('node-ical');
const Discord = require('discord.js');
const { goodColor, errorColor } = require('../config.json');


const command = {
    name: 'rightnow',
    description: 'Get the next timetable event in a max 1 hour delay for your or a specified group.',
    async execute(message, args) {
        const calendarAliasArg = args[0]?.toLowerCase() //There is no need to parse other args because the command only need one arg

        let calendar = searchForCalendarByArg(calendarAliasArg);

        if (calendar == null) {
            if (message.member != null)
                calendar = getCalendarFromRoles(message.member); // if no calendar was specified during args parsing, try to find one in the user's roles
            if (calendar == null) {
                message.channel.send(`error : couldn't find which calendar to display (did you specify it / do you have the right roles?)`);
                return;
            }
        }
        const events = await getCalendarsEvents(calendar.url)
        const eventInTheNextHour = getEventInNextHour(events)
        const response = getFormattedResponse(message, eventInTheNextHour, calendar.name)
        return message.channel.send(response);
    },
};

function getCalendarsEvents(calendarUrl) {
    return new Promise((resolve, reject) => {
        let events = []
        ical.async.fromURL(calendarUrl, {}, function (err, data) {
            for (let element in data) {
                if (data[element].type == 'VEVENT') {
                    events.push(data[element])
                }
            }
            resolve(sortEvents(events))
        });
    })
}

function getEventInNextHour(events) {
    for (const event of events) {
        let startTime = new Date(event.start);

        if (isInNextHour(startTime)) {
            return event;
        }
    }
}

function getFormattedResponse(message, event, calendarName) {
    const formattedEventDate = event?.start?.toLocaleDateString('fr-FR', DATE_FORMAT_OPTIONS) || "?"

    const response = new Discord.MessageEmbed()
        .setTitle(`${formattedEventDate} - ${calendarName}`)
        .setFooter(`Requested by @ ${message.author.username}`, message.author.avatarURL())
        .setColor(goodColor)

    if (!event) {
        response.addField(`Pas de cours dans la prochaine heure`, `~~bon chômage~~`);
        response.setColor(errorColor)
        return response
    }

    response.addField(`${event.start.getHours()}h ${pad(event.start.getMinutes(), 2)} -> ${event.end.getHours()}h ${pad(event.end.getMinutes(), 2)}`, "Heures")

    const eventDescription = parseEventDescription(event.description.val)

    for (const descriptionElement of eventDescription) {
        response.addField(
            descriptionElement.value || "?",
            descriptionElement.name || "?"
        );
    }

    return response
}

module.exports = command