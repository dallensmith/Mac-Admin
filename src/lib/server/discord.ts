import { DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, ADMIN_DISCORD_USER_IDS } from '$env/static/private';

const DISCORD_API = 'https://discord.com/api/v10';
const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';

const botHeaders = {
	Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
	'Content-Type': 'application/json'
};

interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	approximate_member_count?: number;
	approximate_presence_count?: number;
}

export interface GuildStats {
	name: string;
	iconUrl: string | null;
	memberCount: number;
	onlineCount: number;
}

export interface MemberAccess {
	allowed: boolean;
	topRoleName: string;
}

export function getAvatarUrl(userId: string, avatarHash: string | null): string {
	if (!avatarHash) return DEFAULT_AVATAR;
	return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}

/**
 * Check whether a Discord user has admin access.
 * Access is granted only if the user ID is in ADMIN_DISCORD_USER_IDS.
 */
export function checkGuildMemberAccess(discordUserId: string): MemberAccess {
	const whitelist = ADMIN_DISCORD_USER_IDS
		? ADMIN_DISCORD_USER_IDS.split(',')
				.map((id) => id.trim())
				.filter(Boolean)
		: [];

	return { allowed: whitelist.includes(discordUserId), topRoleName: 'Admin' };
}

/**
 * Fetch guild stats. Returns null if the API call fails (non-fatal for access).
 */
export async function getGuildStats(): Promise<GuildStats | null> {
	try {
		const res = await fetch(`${DISCORD_API}/guilds/${DISCORD_GUILD_ID}?with_counts=true`, {
			headers: botHeaders
		});
		if (!res.ok) return null;

		const guild: DiscordGuild = await res.json();
		const iconUrl = guild.icon
			? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
			: null;

		return {
			name: guild.name,
			iconUrl,
			memberCount: guild.approximate_member_count ?? 0,
			onlineCount: guild.approximate_presence_count ?? 0
		};
	} catch {
		return null;
	}
}
