#!/usr/bin/env node
'use strict';
var NickisBot = require('../lib/nickis_bot');
var settings = [process.env.NICKIS_KEY, 'nickis_bot'];
var nickisBot = new NickisBot(settings);
nickisBot.run();
//# sourceMappingURL=bot.js.map