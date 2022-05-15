/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { ArgsOf, Discord, On } from 'discordx';
import { inject, injectable } from 'tsyringe';
import { kPrisma, kRedis } from '../tokens';
import type Redis from 'ioredis';
import { keyspaces } from '../lib/util/cache/keyspaces';
import { PrismaClient } from '@prisma/client';

@Discord()
@injectable()
export class ClientEvents {
	constructor(@inject(kRedis) public readonly redis: Redis, @inject(kPrisma) public readonly prisma: PrismaClient) {}


	/**
	 * TODO Переделать логику
	 * FIXME Исправить баги
	 * **/
	@On('voiceStateUpdate')
	async voiceStateChanged([oldState, newState]: ArgsOf<'voiceStateUpdate'>) {
		/*
		 * Стоп-условие, исключающее другие события
		 * */
		if (oldState.channelId == newState.channelId) return;

		/**
		 * Пользователь покинул голосовой канал
		 * **/
		if (!newState.channel) {
			const createdRoom = await this.redis.exists(keyspaces.createdRoom(oldState.channelId!));

			if (createdRoom) {
				if (oldState.channel?.deletable && oldState.channel.members.size == 0) {
					await oldState.channel?.delete();
					await this.redis.del(keyspaces.createdRoom(oldState.channelId!));
					return;
				}
			}
		} else {
			/**
			 * Если пользователь перешел в другой канал
			 * **/
			if (oldState.channel) {
				if (newState.channelId != oldState.channelId) {
					const createdRoom = await this.redis.get(keyspaces.createdRoom(oldState.channelId!));

					if (createdRoom) {
						if (oldState.channel?.deletable && oldState.channel.members.size == 0) {
							await oldState.channel?.delete();
							await this.redis.del(keyspaces.createdRoom(oldState.channelId!));
							return;
						}
					}
				}
			}

			if (newState.channelId == oldState.channelId) return;

			const guild = await this.prisma.guild.findFirst({
				where: {
					id: newState.guild.id,
				},
			});

			if (newState.channelId == guild?.moveChannelId) {
				await newState.channel?.parent
					?.createChannel(`${newState.member?.user.username ?? 'Unknown'}`, {
						type: 'GUILD_VOICE',
					})
					.then(async (vc) => {
						await newState.setChannel(vc.id);
						await this.redis.set(keyspaces.createdRoom(vc.id), newState.id);
					});
			}
		}
	}
}
