const moment = require('moment');

export function formatDateToRestTime(date) {
    return moment(date).format('YYYY-MM-DDHH:mm');
}

export function dateIsBetweenDates(date, startingDate, endDate) {
    let format = "YYYY-MM-DDTHH:mm:ss";
    return moment(date, format).isBetween(moment(startingDate), moment(endDate))
}

export function parseRestTimeToJsDate(date) {
    let format = "YYYY-MM-DDTHH:mm:ss";
    return moment(date, format).toDate();
}