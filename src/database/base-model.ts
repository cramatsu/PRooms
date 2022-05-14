/**

 * @author cramatsu
 * (´｡• ω •｡`) ♡
 * @Date 13.05.2022

 */

import { Column, DataType, Model } from 'sequelize-typescript';

export class BaseModel extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING,
		unique: true,
	})
	declare id: string;

	@Column({
		type: DataType.DATE,
		defaultValue: Date.now(),
		field: 'created_at',
	})
	declare createdAt: Date;

	@Column({
		type: DataType.DATE,
		field: 'updated_at',
		defaultValue: Date.now(),
	})
	declare updatedAt: Date;
}
