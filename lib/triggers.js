module.exports = {
  order: [
    "can i get",
    "geez",
    "can i have"
  ],
  list: [
    "what are people having",
    "show me the orders",
    "what are the orders",
    "what are people getting"
  ],
  add_user: [
    "added to the rota",
    "add to rota",
    "to the rota"
  ],
  get_next_user: [
    "who is next",
    "whos turn is it",
    "whos next"
  ],
  skip_next_user: [
    "skip"
  ],
  show_my_order: [
    "what have i ordered",
    "what am i getting",
    "what did i order",
    "show my order"
  ],
  show_last_week: [
    "what did i get last week",
    "what did i order last week",
    "what did i have last week"
  ]
};
Object.prototype.find = function(func){
  const keys = Object.keys(this);
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    if ( func(key, this[key], i) ) { return key; }
  }
  return undefined;
}
