/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Discord, Slash, SlashOption } from 'discordx';
import { BaseCommandInteraction, CategoryChannel, MessageEmbed } from 'discord.js';
import { codeBlock } from '@discordjs/builders';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
export class Utils {
	@Slash('delete', {
		description: 'Удалить категорию и содержащиеся в ней каналы',
	})
	async erase(
		@SlashOption('category', {
			type: 'CHANNEL',
			required: true,
			description: 'Категория',
		})
		category: CategoryChannel,
		int: BaseCommandInteraction<'cached'>,
	) {
		category.children.map(async (ch) => await ch.delete('USELESS'));
		await category.delete('Хуета');
		await int.reply(codeBlock('fix', 'DONE'));
	}

	@Slash('ping', {
		description: 'Задержка бота',
	})
	async test(int: BaseCommandInteraction<'cached'>) {
		await int.reply({
			embeds: [
				new MessageEmbed().setColor('BLURPLE').addFields([
					{
						name: '> WebSocket',
						value: codeBlock('fix', `${int.client.ws.ping}`),
						inline: true,
					},
					{
						name: '> Latency',
						value: codeBlock('fix', `${Math.abs(Date.now() - int.createdTimestamp)}`),
						inline: true,
					},
				]),
			],
		});
	}
}
