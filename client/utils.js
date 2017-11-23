export const checkValidity = {
    minutes: mins => isNumber(mins) && mins < 60 && mins >= 0,
    hours: hs => isNumber(hs) && hs < 24 && hs >= 0
}

export const timeIsValid = time => checkValidity.minutes(time.minutes) &&
    checkValidity.hours(time.hours);

const isNumber = value => !isNaN(parseInt(value, 10));