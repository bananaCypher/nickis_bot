'use strict';
const FILLINGS = require('./fillings.js');

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

module.exports = function(bot) {
  return {
    order: function(message){
      const pickedFillings = getOrderFillings(message.text);
      if (pickedFillings.length > 2) {
        return bot.error("you can't have more than 2 fillings", message.user);
      }
      if (pickedFillings.length === 0) {
        return bot.error("the fillings you provided were not recognised", message.user);
      }
      return console.log(pickedFillings);
    },

    list: function(){},
    add_user: function(){},
    get_next_user: function(){},
    skip_next_user: function(){}, 
    show_my_order: function(){},
    show_last_week: function(){}
  };
}
