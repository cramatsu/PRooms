/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Discord, Slash, SlashGroup } from 'discordx';
import { BaseCommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { kRedis } from '../tokens';
import Redis from 'ioredis';
import { codeBlock } from '@discordjs/builders';
import { keyspaces } from '../lib/util/keyspaces';

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

		await this.redis.set(keyspaces.settingsChannel(int.guild.id), createdVoiceControl.id);
		await this.redis.set(keyspaces.moveChannel(int.guild.id), createdVoiceMover.id);

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

		const lockRoom = new MessageButton().setCustomId('room-lock').setEmoji('🔒').setStyle('SECONDARY');

		const setMaxRoomCapacity = new MessageButton()
			.setCustomId('room-max-capacity')
			.setEmoji('🙇')
			.setStyle('SECONDARY');

		const setRoomName = new MessageButton().setCustomId('room-name').setEmoji('📝').setStyle('SECONDARY');

		const kickMember = new MessageButton().setCustomId('room-kick-member').setEmoji('👊').setStyle('SECONDARY');

		await createdVoiceControl.send({
			embeds: [
				new MessageEmbed()
					.setTitle('Управление комнатой')
					.setDescription(
						`
						> Закрыть/Открыть комнату - :lock:
						> Максимальное количество участников - :bow:
						> Выгнать участника - :punch:
						> Название комнаты - :pencil: 
						`,
					)
					.setColor('BLURPLE'),
			],
			components: [new MessageActionRow().addComponents(lockRoom, setMaxRoomCapacity, kickMember, setRoomName)],
		});
	}

	@Slash('delete', {
		description: 'Удалить приватные комнаты',
	})
	async delete(int: BaseCommandInteraction<'cached'>) {
		const moveChannel = await this.redis.get(keyspaces.moveChannel(int.guildId));
		const settingsChannel = await this.redis.get(keyspaces.settingsChannel(int.guildId));

		if (moveChannel) {
			await int.guild.channels.resolve(moveChannel)?.delete();
		}

		if (settingsChannel) {
			await int.guild.channels.resolve(settingsChannel)?.delete();
		}

		await this.redis.del(keyspaces.settingsChannel(int.guildId));
		await this.redis.del(keyspaces.moveChannel(int.guildId));

		await int.reply(codeBlock('fix', 'Готово!'));
	}
}
