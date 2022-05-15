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
