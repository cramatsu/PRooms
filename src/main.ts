/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import 'reflect-metadata';
import { Bot } from './lib/struct/bot';
import Redis from 'ioredis';
import { container } from 'tsyringe';
import { DIService } from 'discordx';
import { kClient, kRedis } from './tokens';

import { logger } from './logger';

DIService.container = container;

const bot = new Bot();

const redis = new Redis('redis');

container.register(kRedis, {
	useValue: redis,
});
container.register(kClient, {
	useValue: bot.client,
});

bot.init();

process.on('unhandledRejection', (e: Error) => {
	logger.error({
		error: {
			message: 'Необработаное исключение',
			details: e.stack,
		},
	});
});
