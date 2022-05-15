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
import { kClient, kPrisma, kRedis } from './tokens';
import { PrismaClient } from '@prisma/client';

DIService.container = container;

const bot = new Bot();

const redis = new Redis();

const prisma = new PrismaClient();

prisma.$connect();

container.register(kPrisma, {
	useValue: prisma,
});

container.register(kRedis, {
	useValue: redis,
});
container.register(kClient, {
	useValue: bot.client,
});

bot.init();
