/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Discord, Slash } from 'discordx';
import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import { codeBlock } from '@discordjs/builders';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
export class Utils {
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
