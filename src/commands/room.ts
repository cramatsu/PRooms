/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Discord, Slash, SlashGroup } from 'discordx';
import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { kRedis } from '../tokens';
import Redis from 'ioredis';
import Guild from '../database/models/guild';
import { codeBlock } from '@discordjs/builders';

@Discord()
@SlashGroup({
	name: 'room',
})
@SlashGroup('room')
@injectable()
export class Room {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}
	@Slash('init', {
		description: 'Инициализировать приватные комнаты',
	})
	async init(int: BaseCommandInteraction<'cached'>) {
		const createdCategory = await int.guild.channels.create('Комнаты', {
			type: 'GUILD_CATEGORY',
		});

		const createdVoiceMover = await createdCategory.createChannel('♿ | Вкатиться️', {
			type: 'GUILD_VOICE',
			bitrate: 8000,
		});

		const createdVoiceControl = await createdCategory.createChannel('🛠️️️', {
			type: 'GUILD_TEXT',
		});

		await Guild.create({
			id: int.guild.id,
			moveChannelId: createdVoiceMover.id,
			settingsChannelId: createdVoiceControl.id,
		});

		await int.reply({
			embeds: [
				new MessageEmbed()
					.setColor('BLURPLE')
					.setTitle('ヽ(*・ω・)ﾉ')
					.addFields([
						{
							name: '> Перемещение',
							value: `<#${createdVoiceMover.id}>`,
							inline: true,
						},
						{
							name: '> Управление',
							value: `<#${createdVoiceControl.id}>`,
							inline: true,
						},
					])
					.setDescription(
						codeBlock(
							'fix',
							'Каналы настройки и управления успешно инициализированы!\nЕсли не нравится название каналов - переименуйте их!',
						),
					),
			],
		});
	}

	@Slash('delete', {
		description: 'Удалить приватные комнаты',
	})
	async delete(int: BaseCommandInteraction<'cached'>) {
		const guild = await Guild.findOne({
			where: {
				id: int.guild.id,
			},
		});

		// @ts-ignore
		await int.guild.channels.resolve(guild.moveChannelId).delete();
		// @ts-ignore
		await int.guild.channels.resolve(guild.settingsChannelId).delete();

		await int.reply('OK! B00mer');
	}
}
