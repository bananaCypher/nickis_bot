'use strict';
const moment = require('moment');
const FILLINGS = require('./fillings.js');
const spreadsheet = require('./spreadsheet');
const utilities = require('./utilities.js');

// string(string) => words(array[string])
let whatWordsInString = function(string, words){
  string = string.toLowerCase();
  return words
    .filter((word) => string.indexOf(word) > -1);
}

// message(string) => fillings(array[string]) 
let getOrderFillings = function(message){
  return whatWordsInString(message, FILLINGS);
}

// user(object), fillings(array) => order(object)
let createOrder = function(user, fillings){
  return {
    name: user.real_name,
    filling1: fillings[0],
    filling2: fillings[1],
    fridayDate: utilities.getFridayDate()
  }
}

const userByName = function(name){
  return function(users){
    return users.members.find(user => user.profile.real_name === name);
  }
}

module.exports = function(bot) {
  const getUserById = function(id){
    return new Promise(function(resolve, reject) {
      bot.getUsers()
        .then(function(users){
          resolve( users.members.find(user => user.id === id) );
        });
    });
  }
  const getUserByName = function(name){
    return new Promise(function(resolve, reject) {
      bot.getUsers().then(users => resolve(userByName(name)(users)));
    });
  }

  return {
    order: function(message){
      const pickedFillings = getOrderFillings(message.text);
      if (pickedFillings.length > 2) {
        bot.error("you can't have more than 2 fillings", message.user);
      }
      if (pickedFillings.length === 0) {
        bot.error("the fillings you provided were not recognised", message.user);
      }
      getUserById(message.user).then(function(user){
        spreadsheet.addOrder(createOrder(user, pickedFillings)).then(function(type){
          bot.success(`your order has been ${type}`, message.user);
        }).catch(function(err){
          bot.error("something went wrong", message.user);
          console.error(err);
        });
      });
    },

    list: function(){},
    add_user: function(){},
    get_next_user: function(message){
      spreadsheet.getNextUser().then(user => {
        bot.success(`${user.name} is next up, due on ${user.nextnickisdate}`, message.user);
      });
    },
    skip_next_user: function(){}, 
    show_my_order: function(){},
    show_last_week: function(){}
  };
}
