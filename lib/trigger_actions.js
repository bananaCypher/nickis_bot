'use strict';
const moment = require('moment');
const FILLINGS = require('./fillings.js');
const spreadsheet = require('./spreadsheet.js');

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

let getFridayDate = function(date){
  var nextFriday = moment(date).day(5);
  if ( moment(date) > nextFriday ) {
    nextFriday = moment(date).day(13);
  }
  return nextFriday.format('X');
}

// user(object), fillings(array) => order(object)
let createOrder = function(user, fillings){
  return {
    name: user.real_name,
    filling1: fillings[0],
    filling2: fillings[1],
    fridayDate: getFridayDate()
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

  return {
    order: function(message){
      const pickedFillings = getOrderFillings(message.text);
      if (pickedFillings.length > 2) {
        return bot.error("you can't have more than 2 fillings", message.user);
      }
      if (pickedFillings.length === 0) {
        return bot.error("the fillings you provided were not recognised", message.user);
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
    get_next_user: function(){},
    skip_next_user: function(){}, 
    show_my_order: function(){},
    show_last_week: function(){}
  };
}
