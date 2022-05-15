/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Discord, Slash, SlashGroup } from 'discordx';
import { BaseCommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { kPrisma, kRedis } from '../tokens';
import Redis from 'ioredis';
import { codeBlock } from '@discordjs/builders';
import { PrismaClient } from '@prisma/client';

@Discord()
@SlashGroup({
	name: 'room',
})
@SlashGroup('room')
@injectable()
export class Room {

	
	public constructor(
		@inject(kRedis) public readonly redis: Redis,
		@inject(kPrisma) public readonly prisma: PrismaClient,
	) {}

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
			permissionOverwrites: [
				{
					id: int.guild.roles.everyone.id,
					type: 'role',
					allow: ['VIEW_CHANNEL'],
					deny: ['SEND_MESSAGES'],
				},
			],
		});

		await this.prisma.guild.upsert({
			create: {
				settingsChannelId: createdVoiceControl.id,
				moveChannelId: createdVoiceMover.id,
				id: int.guild.id,
			},
			where: {
				id: int.guild.id,
			},
			update: {
				settingsChannelId: createdVoiceControl.id,
				moveChannelId: createdVoiceMover.id,
				updatedAt: new Date(),
			},
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

		const roleAccessButton = new MessageButton().setCustomId('room-role-access').setEmoji('🛂').setStyle('SECONDARY');

		const lockRoom = new MessageButton().setCustomId('room-lock').setEmoji('🔒').setStyle('SECONDARY');

		const setMaxRoomCapacity = new MessageButton()
			.setCustomId('room-max-capacity')
			.setEmoji('🙇')
			.setStyle('SECONDARY');

		const setRoomName = new MessageButton().setCustomId('room-name').setEmoji('📝').setStyle('SECONDARY');

		const muteMember = new MessageButton().setCustomId('room-mute-member').setEmoji('🎙️').setStyle('SECONDARY');

		const kickMember = new MessageButton().setCustomId('room-kick-member').setEmoji('👊').setStyle('SECONDARY');

		await createdVoiceControl.send({
			embeds: [
				new MessageEmbed()
					.setTitle('Управление комнатой')
					.setDescription(
						`
						${codeBlock('fix', 'Ограничения')}
						> Включить/Выключить доступ по роли - :passport_control: 

						> Закрыть/Открыть комнату - :lock:

						> Максимальное количество участников - :bow:
						${codeBlock('fix', 'Управление участниками')}
						> Выгнать участника - :punch:
						
						> Включить/Отключить микрофон участнику - :microphone2:
						${codeBlock('fix', 'Остальное')}
						> Название комнаты - :pencil: 
						`,
					)
					.setColor('BLURPLE'),
			],
			components: [
				new MessageActionRow().addComponents(roleAccessButton, lockRoom, setMaxRoomCapacity),
				new MessageActionRow().addComponents(kickMember, muteMember),
				new MessageActionRow().addComponents(setRoomName),
			],
		});
	}

	@Slash('delete', {
		description: 'Удалить приватные комнаты',
	})
	async delete(int: BaseCommandInteraction<'cached'>) {
		const guild = await this.prisma.guild.findUnique({
			where: {
				id: int.guild.id,
			},
		});

		if (!guild) {
			await int.reply(codeBlock('diff', '- Нету записи в БД'));
			return;
		}

		// TODO
		// FIXME
		await int.guild.channels
			// @ts-ignore
			.resolve(guild.moveChannelId)
			.delete()
			.catch((e) => e);


		// TODO
		// FIXME
		await int.guild.channels
			// @ts-ignore
			.resolve(guild.settingsChannelId)
			.delete()
			.catch((e) => e);

		await this.prisma.guild.update({
			where: {
				id: int.guild.id,
			},
			data: {
				settingsChannelId: null,
				moveChannelId: null,
				updatedAt: new Date(),
			},
		});
		await int.reply(codeBlock('fix', 'Готово!'));
	}
}
