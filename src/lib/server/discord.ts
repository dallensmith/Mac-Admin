import { DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, ADMIN_DISCORD_USER_IDS } from '$env/static/private';

const DISCORD_API = 'https://discord.com/api/v10';
const ADMINISTRATOR_PERMISSION = BigInt(0x8);
const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';

const botHeaders = {
	Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
	'Content-Type': 'application/json'
};

interface DiscordRole {
	id: string;
	name: string;
	permissions: string;
	position: number;
}

interface DiscordGuildMember {
	roles: string[]; // role IDs
}

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
 * Check whether a Discord user has admin access to the guild.
 * Access is granted if the user is in ADMIN_DISCORD_USER_IDS OR holds a role
 * with the ADMINISTRATOR permission bit.
 * Throws on any API error — callers should treat a throw as a denial.
 */
export async function checkGuildMemberAccess(discordUserId: string): Promise<MemberAccess> {
	// Whitelist check — no API call needed
	const whitelist = ADMIN_DISCORD_USER_IDS
		? ADMIN_DISCORD_USER_IDS.split(',').map((id) => id.trim()).filter(Boolean)
		: [];

	// Fetch member and all guild roles in parallel
	const [memberRes, rolesRes] = await Promise.all([
		fetch(`${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}`, {
			headers: botHeaders
		}),
		fetch(`${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/roles`, { headers: botHeaders })
	]);

	if (!memberRes.ok || !rolesRes.ok) {
		throw new Error(
			`Discord API error: member=${memberRes.status} roles=${rolesRes.status}`
		);
	}

	const member: DiscordGuildMember = await memberRes.json();
	const allRoles: DiscordRole[] = await rolesRes.json();

	// Roles held by this member
	const memberRoleIds = new Set(member.roles);
	const heldRoles = allRoles.filter((r) => memberRoleIds.has(r.id));

	// Check ADMINISTRATOR permission on any held role
	const hasAdminPerm = heldRoles.some(
		(r) => (BigInt(r.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION
	);

	const allowed = whitelist.includes(discordUserId) || hasAdminPerm;

	// Top role = highest position among held roles (fallback to '@everyone' equivalent)
	const sortedRoles = [...heldRoles].sort((a, b) => b.position - a.position);
	const topRole = sortedRoles[0];
	const topRoleName = topRole?.name ?? 'Member';

	return { allowed, topRoleName };
}

/**
 * Fetch guild stats. Returns null if the API call fails (non-fatal for access).
 */
export async function getGuildStats(): Promise<GuildStats | null> {
	try {
		const res = await fetch(
			`${DISCORD_API}/guilds/${DISCORD_GUILD_ID}?with_counts=true`,
			{ headers: botHeaders }
		);
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
