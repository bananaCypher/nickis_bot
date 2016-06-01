#!/usr/bin/env node
'use strict';

var NickisBot = require('../lib/nickis_bot.js');

var nickisBot = new NickisBot({
  token: process.env.NICKIS_KEY,
  name:  'nickis_bot'
});

nickisBot.run();
