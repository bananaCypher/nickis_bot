'use strict'
import * as util from 'util'
import * as slackbots from 'slackbots'

import './utilities.js'
const TRIGGERS: string[] = require('./triggers.js');
const FILLINGS: string[] = require('./fillings.js');
const ERROR_PREFIXES: string[] = require('./error_prefixes.js');
const SUCCESS_PREFIXES: string[] = require('./success_prefixes.js');


var NickisBot: any = function Constructor (settings: [string, string]): void {
  const parsedSettings: {token: string, name:string} = {
    token: settings[0],
    name: settings[1] || 'nickis_bot'
  };
  this.settings = parsedSettings;
};

const Prototype: {
  [key: string]: (...args:any[]) => any
} = {
  run: function (): void{
    NickisBot.super_.call(this, this.settings);
    this.channel = this.getChannel(this.settings.name).then((channel: any) => channel)
    this.on('message', this._onMessage);
  },

  _onMessage: function(message: any): void{
    const ACTIONS: {
      [key: string]: (...args:any[]) => any
    } = require('./trigger_actions.js')(this);

    if(!this.isRelevantMessage(message)) { return; }
      console.log(message);

    const action: string = getTrigger(TRIGGERS, message.text.toLowerCase());
    if(!action) { return; }

    ACTIONS[action](message);
  },

  isRelevantMessage: function(message: any): boolean{
    return message.type === 'message'
        && message.user !== this.getUser(this.settings.name).then((user: any) => user)
        && message.channel !== this.getChannel(this.settings.name).then((channel: any) => channel)
  },

  error: function(text: string, userId: string): void{
    this.getUsers().then((users: any) => {
      const userName: string = users.members.find( userById(userId) ).name
      this.postMessageToUser(userName, `${getRandomElement(ERROR_PREFIXES)} ${text}`)
    })
  },

  success: function(text: string, userId: string): void{
    this.getUsers().then((users: any) => {
      const userName: string = users.members.find( userById(userId) ).name
      this.postMessageToUser(userName, `${getRandomElement(SUCCESS_PREFIXES)} ${text}`)
    })
  }
}

const userById = function(id: string): (user: any) => boolean {
  return function(user: any): boolean{
    return user.id === id;
  }
}

const getRandomElement = function(array: any[]): any {
  return array[Math.floor(Math.random()*array.length)];
}

const getTrigger = function(triggers: string[], message: string): string {
  return triggers.find( 
    (triggerType: string, triggerList: string[]): boolean => isInTriggerList(message, triggerList) 
  ) || ''
}

const isInTriggerList = function(message: string, triggerList: string[]): boolean {
  return triggerList.find(
    (trigger: string): boolean => message.indexOf(trigger) > -1
  ) !== undefined
}

NickisBot.prototype = Prototype;
util.inherits(NickisBot, slackbots);
module.exports = NickisBot;
