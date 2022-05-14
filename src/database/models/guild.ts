import { Column, Table } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';

@Table({
	tableName: 'guilds',
	timestamps: true,
})
export default class Guild extends BaseModel {
	@Column({
		field: 'settings_channel_id',
		type: DataType.STRING,
		allowNull: true,
	})
	declare settingsChannelId: string;

	@Column({
		field: 'move_channel_id',
		type: DataType.STRING,
		allowNull: true,
	})
	declare moveChannelId: string;
}
