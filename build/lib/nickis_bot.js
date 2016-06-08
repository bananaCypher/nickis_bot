'use strict';
var util = require('util');
var slackbots = require('slackbots');
require('./utilities.js');
var TRIGGERS = require('./triggers.js');
var FILLINGS = require('./fillings.js');
var ERROR_PREFIXES = require('./error_prefixes.js');
var SUCCESS_PREFIXES = require('./success_prefixes.js');
var NickisBot = function Constructor(settings) {
    var parsedSettings = {
        token: settings[0],
        name: settings[1] || 'nickis_bot'
    };
    this.settings = parsedSettings;
};
var Prototype = {
    run: function () {
        NickisBot.super_.call(this, this.settings);
        this.channel = this.getChannel(this.settings.name).then(function (channel) { return channel; });
        this.on('message', this._onMessage);
    },
    _onMessage: function (message) {
        var ACTIONS = require('./trigger_actions.js')(this);
        if (!this.isRelevantMessage(message)) {
            return;
        }
        console.log(message);
        var action = getTrigger(TRIGGERS, message.text.toLowerCase());
        if (!action) {
            return;
        }
        ACTIONS[action](message);
    },
    isRelevantMessage: function (message) {
        return message.type === 'message'
            && message.user !== this.getUser(this.settings.name).then(function (user) { return user; })
            && message.channel !== this.getChannel(this.settings.name).then(function (channel) { return channel; });
    },
    error: function (text, userId) {
        var _this = this;
        this.getUsers().then(function (users) {
            var userName = users.members.find(userById(userId)).name;
            _this.postMessageToUser(userName, getRandomElement(ERROR_PREFIXES) + " " + text);
        });
    },
    success: function (text, userId) {
        var _this = this;
        this.getUsers().then(function (users) {
            var userName = users.members.find(userById(userId)).name;
            _this.postMessageToUser(userName, getRandomElement(SUCCESS_PREFIXES) + " " + text);
        });
    }
};
var userById = function (id) {
    return function (user) {
        return user.id === id;
    };
};
var getRandomElement = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};
var getTrigger = function (triggers, message) {
    return triggers.find(function (triggerType, triggerList) { return isInTriggerList(message, triggerList); }) || '';
};
var isInTriggerList = function (message, triggerList) {
    return triggerList.find(function (trigger) { return message.indexOf(trigger) > -1; }) !== undefined;
};
NickisBot.prototype = Prototype;
util.inherits(NickisBot, slackbots);
module.exports = NickisBot;
//# sourceMappingURL=nickis_bot.js.map