export const keyspaces = {
	settingsChannel: (guildId: string): string => `guild:${guildId}:vc:settings`,
	moveChannel: (guildId: string): string => `guild:${guildId}:vc:move`,
	createdRoom: (id: string): string => `created:room:${id}`,
};
