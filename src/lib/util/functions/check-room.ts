import { container } from 'tsyringe';
import { kRedis } from '../../../tokens';
import type Redis from 'ioredis';
import { keyspaces } from '../cache/keyspaces';

const redis = container.resolve<Redis>(kRedis);
export const isFromRoom = async (roomId: string): Promise<boolean> => {
	return !!redis.exists(keyspaces.createdRoom(roomId));
};

export const isRoomOwner = async (roomId: string, userId: string): Promise<boolean> => {
	return (await redis.get(keyspaces.createdRoom(roomId))) == userId;
};
