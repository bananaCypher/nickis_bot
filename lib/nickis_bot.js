'use strict';
const util = require('util');
const slackbots = require('slackbots');

require('./utilities.js');
const TRIGGERS = require('./triggers.js');
const FILLINGS = require('./fillings.js');
const ERROR_PREFIXES = require('./error_prefixes.js');
const SUCCESS_PREFIXES = require('./success_prefixes.js');


var NickisBot = function Constructor(settings){
  this.settings = settings;
  this.settings.name = settings.name || 'nickis_bot';
};

const Prototype = {
  run: function (){
    NickisBot.super_.call(this, this.settings);
    this.channel = this.getChannel(this.settings.name).then(function(channel){return channel});
    this.on('message', this._onMessage);
  },
  
  _onMessage: function(message){
    const ACTIONS = require('./trigger_actions.js')(this);

    if(!this.isRelevantMessage(message)) { return; }
      console.log(message);

    const action = getTrigger(TRIGGERS, message.text.toLowerCase());
    if(!action) { return; }

    ACTIONS[action](message);
  },

  // message(Object) => (Boolean)
  isRelevantMessage: function(message){
    return message.type === 'message'
        && message.user !== this.getUser(this.settings.name).then(function(user){return user})
        && message.channel !== this.getChannel(this.settings.name).then(function(channel){return channel})
  },

  error: function(text, userId){
    this.getUsers().then(function(users){
      const userName = users
        .members
        .find(userById(userId))
        .name;
      this.postMessageToUser(userName, `${getRandomElement(ERROR_PREFIXES)} ${text}`)
    }.bind(this))
  },

  success: function(text, userId){
    this.getUsers().then(function(users){
      const userName = users
        .members
        .find(userById(userId))
        .name;
      this.postMessageToUser(userName, `${getRandomElement(SUCCESS_PREFIXES)} ${text}`)
    }.bind(this))
  }
}

// id(string), user(object) => (boolean)
const userById = function(id){
  return function(user){
    return user.id === id;
  }
}

// array(array) => *
const getRandomElement = function(array){
  return array[Math.floor(Math.random()*array.length)];
}

// message(Object) => trigger(String)
const getTrigger = function(triggers, message){
  return triggers.find(function(triggerType, triggerList){
    return isInTriggerList(message, triggerList); 
  }) || '';
}

// message(Object), trigger(Array) => (Boolean)
const isInTriggerList = function(message,triggerList){
  return triggerList.find(function(trigger){
    return message.indexOf(trigger) > -1;
  }) !== undefined;
}

NickisBot.prototype = Prototype;
util.inherits(NickisBot, slackbots);
module.exports = NickisBot;
