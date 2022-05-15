/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Client } from 'discordx';
import { Intents, Interaction, Snowflake } from 'discord.js';
import { importx } from '@discordx/importer';
import { join } from 'path';

export class Bot {
	private readonly _client: Client;

	public get client(): Client {
		return this._client;
	}

	constructor() {
		this._client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
			],
			botGuilds: [process.env.DISCORD_BOT_GUILD as Snowflake],
			partials: ['CHANNEL', 'MESSAGE'],
			silent: false,
		});

		this.client.on('ready', async () => {
			await this._client.initApplicationCommands({
				guild: { log: true },
			});

			await this._client.initApplicationPermissions(true);
		});

		this._client.on('interactionCreate', (interaction: Interaction) => {
			this.client.executeInteraction(interaction);
		});
	}

	public async init(): Promise<void> {
		await importx(join(__dirname, '..', '..', 'commands/**/*.{js,ts}'));
		await importx(join(__dirname, '..', '..', 'events/**/*.{js,ts}'));

		await this.client.login(process.env.DISCORD_BOT_TOKEN as string);
	}
}
