/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import 'reflect-metadata';
import { Bot } from './struct/bot';
import Redis from 'ioredis';
import { container } from 'tsyringe';
import { DIService } from 'discordx';
import { kClient, kRedis } from './tokens';
import { Sequelize } from 'sequelize-typescript';
import { join } from 'path';

DIService.container = container;

const bot = new Bot();

const redis = new Redis();

new Sequelize({
	database: 'yuudachi',
	username: 'yuudachi',
	password: 'admin',

	dialect: 'postgres',
	models: [join(__dirname, 'database/models/**/*.{js,ts}')],
});

container.register(kRedis, {
	useValue: redis,
});
container.register(kClient, {
	useValue: bot.client,
});

bot.init();
