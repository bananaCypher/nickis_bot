'use strict';
var moment = require('moment');
var FILLINGS = require('./fillings.js');
var spreadsheet = require('./spreadsheet');
var utilities = require('./utilities.js');
var whatWordsInString = function (string, words) {
    string = string.toLowerCase();
    return words
        .filter(function (word) { return string.indexOf(word) > -1; });
};
var getOrderFillings = function (message) {
    return whatWordsInString(message, FILLINGS);
};
var createOrder = function (user, fillings) {
    return {
        name: user.real_name,
        filling1: fillings[0],
        filling2: fillings[1],
        fridayDate: utilities.getFridayDate()
    };
};
var userByName = function (name) {
    return function (users) {
        return users.members.find(function (user) { return user.profile.real_name === name; });
    };
};
module.exports = function (bot) {
    var getUserById = function (id) {
        return new Promise(function (resolve, reject) {
            bot.getUsers()
                .then(function (users) {
                resolve(users.members.find(function (user) { return user.id === id; }));
            });
        });
    };
    var getUserByName = function (name) {
        return new Promise(function (resolve, reject) {
            bot.getUsers().then(function (users) { return resolve(userByName(name)(users)); });
        });
    };
    return {
        order: function (message) {
            var pickedFillings = getOrderFillings(message.text);
            if (pickedFillings.length > 2) {
                bot.error("you can't have more than 2 fillings", message.user);
            }
            if (pickedFillings.length === 0) {
                bot.error("the fillings you provided were not recognised", message.user);
            }
            getUserById(message.user).then(function (user) {
                spreadsheet.addOrder(createOrder(user, pickedFillings)).then(function (type) {
                    bot.success("your order has been " + type, message.user);
                }).catch(function (err) {
                    bot.error("something went wrong", message.user);
                    console.error(err);
                });
            });
        },
        list: function () { },
        add_user: function () { },
        get_next_user: function (message) {
            spreadsheet.getNextUser().then(function (user) {
                bot.success(user.name + " is next up, due on " + user.nextnickisdate, message.user);
            });
        },
        skip_next_user: function () { },
        show_my_order: function () { },
        show_last_week: function () { }
    };
};
//# sourceMappingURL=trigger_actions.js.map