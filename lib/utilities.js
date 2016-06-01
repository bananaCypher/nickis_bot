Object.prototype.find = function(func){
  const keys = Object.keys(this);
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    if ( func(key, this[key], i) ) { return key; }
  }
  return undefined;
}
