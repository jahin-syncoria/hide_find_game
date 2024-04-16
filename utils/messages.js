const moment = require('moment');

function formatMessage(username,userType, text) {
  return {
    username,
    userType,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
