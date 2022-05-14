export const keyspaces = {
	roomOwner: (owner: string) => `room:${owner}`,
	createdRoom: (id: string) => `created:room:${id}`,
};
