#!/usr/bin/env node
'use strict';

import * as NickisBot from '../lib/nickis_bot';

const settings: [string, string] = [process.env.NICKIS_KEY, 'nickis_bot'];
const nickisBot: any = new NickisBot(settings);

nickisBot.run();
