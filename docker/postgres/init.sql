
create table guilds
(
	id text not null,
	move_channel_id text,
	settings_channel_id text,
	created_at TIMESTAMP WITH TIME ZONE,
	updated_at TIMESTAMP WITH TIME ZONE
);

create unique index guilds_id_uindex
	on guilds (id);

alter table guilds
	add constraint guilds_pk
		primary key (id);



