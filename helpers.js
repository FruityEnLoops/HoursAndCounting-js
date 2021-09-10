const HOUR = 1000 * 60 * 60; // in ms
const calendars = require('./calendars.json');

function searchForCalendarByArg(arg) {
    for (let calendar of calendars) {
        for (let alias of calendar.alias) {
            if (alias.toLowerCase() == arg) {
                return calendar;
            }
        }
    }
}

function getCalendarFromRoles(member) {
    for (let calendar of calendars) {
        for (let alias of calendar.alias) {
            if (member.roles.cache.some(role => role.name.toLowerCase() === alias.toLowerCase())) {
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


function parseEventDescription(description) {
    if (!description) return []

    const descriptionFields = description.split("\n");
    descriptionFields.pop() // Remove last element because it's an empty line

    return descriptionFields.map(descriptionField => {
        // To split the name and the value part of the description field (ex: "TD : E1, E2" => ["TD", "E1, E2"])
        const fieldSplit = descriptionField.split(":").map((element) => element.trim())

        return {
            name: fieldSplit?.[0],
            value: fieldSplit?.[1]
        }
    })

}

function isInNextHour(date) {
    const now = Date.now()
    const anHourInFuture = now + HOUR;

    return date > now && date < anHourInFuture;
}

function sortEvents(events) {
    return events.slice().sort(function (a, b) {
        let dateA = new Date(a.start);
        let dateB = new Date(b.start);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
    });
}

const DATE_FORMAT_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


module.exports = {
    parseEventDescription,
    getCalendarFromRoles,
    isInNextHour,
    searchForCalendarByArg,
    sameDay,
    getNextDayOfWeek,
    pad,
    sortEvents,
    DATE_FORMAT_OPTIONS
}