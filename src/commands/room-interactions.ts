/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 15.05.2022

 */

import { ButtonComponent, Discord } from 'discordx';
import { ButtonInteraction, MessageActionRow, Modal, Permissions, TextInputComponent } from 'discord.js';
import { isFromRoom, isRoomOwner } from '../lib/util/functions/check-room';
import { nanoid } from 'nanoid';
import { codeBlock } from '@discordjs/builders';

@Discord()
export class RoomInteractions {
	@ButtonComponent('room-name')
	async changeRoomName(int: ButtonInteraction) {
		const user = await int.guild!.members.resolve(int.user.id);

		if (user?.voice.channelId) {
			if (await isFromRoom(user?.voice.id)) {
				if (!(await isRoomOwner(user.voice.channelId, user.id))) {
					await int.deferUpdate();
					return;
				}
				const modalKey = nanoid();
				await int.showModal(
					new Modal()
						.setCustomId('VC_NAME')
						.setTitle('Название комнаты')
						.addComponents(
							new MessageActionRow<TextInputComponent>().addComponents(
								new TextInputComponent()
									.setLabel('Название')
									.setStyle('SHORT')
									.setMaxLength(32)
									.setMinLength(1)
									.setRequired(true)
									.setCustomId(modalKey),
							),
						),
				);

				const result = await int.awaitModalSubmit({
					filter: (m) => m.user.id == int.user.id,
					time: 60000,
				});

				await result.deferUpdate();
				await user.voice.channel?.setName(result.fields.getTextInputValue(modalKey));
			}
		} else {
			await int.deferUpdate();
		}
	}

	@ButtonComponent('room-max-capacity')
	async changeRoomCapacity(int: ButtonInteraction) {
		const user = await int.guild!.members.resolve(int.user.id);

		if (user?.voice.channelId) {
			if (!(await isRoomOwner(user.voice.channelId, user.id))) {
				await int.deferUpdate();
				return;
			}

			const channel = int.guild!.channels.resolve(int.channelId);

			await channel?.edit({
				permissionOverwrites: [
					{
						id: int.user.id,
						type: 'member',
						allow: ['SEND_MESSAGES'],
					},
				],
			});

			await int.deferUpdate();

			await int.followUp({
				content: codeBlock('diff', '+ Отправьте максимальное количество участников прямо в этот чат!'),
				ephemeral: true,
			});

			const message = await int.channel!.createMessageCollector({
				filter: (msg) => msg.author.id == int.user.id,
				max: 1,
				time: 6000,
			});

			message.on('end', async () => {
				if (message.endReason == 'time') {
					await int.followUp({
						content: codeBlock('diff', '- Время вышло!'),
						ephemeral: true,
					});
				}
				return;
			});

			message.on('collect', async (msg) => {
				const amount = parseInt(msg.content);

				if (amount > 99 || amount < 1 || isNaN(amount)) {
					await int.followUp({
						content: codeBlock('fix', '- Неверное количество участников'),
						ephemeral: true,
					});
					return;
				}

				await user.voice.channel?.edit({
					userLimit: amount,
				});

				await int.followUp({
					content: codeBlock('diff', '+ Установлен лимит участников!'),
					ephemeral: true,
				});
			});
		} else {
			await int.deferUpdate();
		}
	}

	@ButtonComponent('room-kick-member')
	async kickMember(int: ButtonInteraction) {
		const user = await int.guild!.members.resolve(int.user.id);

		if (user?.voice.channelId) {
			if (await isFromRoom(user?.voice.id)) {
				if (!(await isRoomOwner(user.voice.channelId, user.id))) {
					await int.deferUpdate();
					return;
				}

				await int.deferUpdate();

				await int.followUp({
					content: codeBlock('diff', '+ Упомяните участника в этом чате!'),
					ephemeral: true,
				});

				const message = await int.channel!.createMessageCollector({
					filter: (msg) => msg.author.id == int.user.id,
					max: 1,
					time: 6000,
				});

				message.on('end', async () => {
					if (message.endReason == 'time') {
						await int.followUp({
							content: codeBlock('diff', '- Время вышло!'),
							ephemeral: true,
						});
					}
					return;
				});

				message.on('collect', async (msg) => {
					const target = msg.mentions.users.first();

					if (!target || target.bot) {
						await int.followUp({
							content: codeBlock('diff', '- Некорректный пользователь!'),
							ephemeral: true,
						});
						return;
					}

					if (target.id == int.user.id) {
						await int.followUp({
							content: codeBlock('diff', '- Выйдите сами :3'),
							ephemeral: true,
						});
						return;
					}

					const targetMember = int.guild!.members.resolve(target.id);

					if (targetMember?.voice.channel && user.voice.channel?.members.has(target.id)) {
						await targetMember.voice.disconnect(`Исключен(-а) из ПК by ${int.user.id}`);
					} else {
						await int.followUp({
							content: codeBlock('diff', '- Пользователя нет в вашем канале!'),
							ephemeral: true,
						});
						return;
					}
				});
			}
		} else {
			await int.deferUpdate();
		}
	}

	@ButtonComponent('room-lock')
	async lockRoom(int: ButtonInteraction) {
		const user = await int.guild!.members.resolve(int.user.id);

		if (user?.voice.channelId) {
			if (await isFromRoom(user?.voice.id)) {
				if (!(await isRoomOwner(user.voice.channelId, user.id))) {
					await int.deferUpdate();
					return;
				}

				await int.deferUpdate();

				if (user.voice.channel?.permissionsFor(int.guild!.roles.everyone).has(Permissions.FLAGS.CONNECT)) {
					await user.voice.channel?.edit({
						permissionOverwrites: [
							{
								id: int.user.id,
								type: 'member',
								allow: ['CONNECT'],
							},
							{
								id: int.guild!.roles.everyone.id,
								deny: ['CONNECT'],
							},
						],
					});
					await int.followUp({
						content: codeBlock('diff', '+ Комната успешно заблокирована!'),
						ephemeral: true,
					});
				} else {
					await user.voice.channel?.edit({
						permissionOverwrites: [],
					});
					await int.followUp({
						content: codeBlock('diff', '- Комната разблокирована!'),
						ephemeral: true,
					});
				}
			} else {
				await int.deferUpdate();
			}
		}
	}
}
