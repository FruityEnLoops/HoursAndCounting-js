const ical = require('node-ical');

module.exports = {
	name: 'edt',
	description: 'Get the current day\'s timetable for your or a specified group.',
	execute(message) {
        // TODO : read args for date / specific calendar
        // 
        // TODO : Search for calendar url based on roles 
        // let url = getCalUrlFromRoles(message.member.roles);
		printIcal('https://calendar.google.com/calendar/ical/hdpka717lurrk1qu3pds5q7u40@group.calendar.google.com/public/basic.ics', new Date()); // sample ical
	},
};

function printIcal(url, date){
    ical.async.fromURL(url, {}, function (err, data) {
        for(let element in data){
            if(data[element].type == 'VEVENT'){
                // check for date; display if necessary
            }
        }
    });
}