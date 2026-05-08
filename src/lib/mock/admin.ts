export const mockUser = {
	id: 'discord_user_123',
	name: 'Admin Dave',
	avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
	role: 'Super Admin',
	email: 'dave@example.com'
};

export const mockDashboardStats = {
	botStatus: 'Online',
	guildCount: 12,
	ping: '45ms',
	dailyCost: '$0.42',
	moviesWatched: 142
};

export const mockRecentActivity = [
	{ id: 1, action: 'Added "The Room" to the Wheel', time: '10 mins ago', user: 'Admin Dave' },
	{ id: 2, action: 'Updated system instructions', time: '1 hour ago', user: 'Admin Dave' },
	{ id: 3, action: 'Bot spun the wheel: "Troll 2"', time: '2 hours ago', user: 'System' }
];

export const mockExperiments = [
	{ id: 1, name: 'Sarcasm Level 100', date: '2026-05-04', movies: 5, status: 'Completed' },
	{ id: 2, name: '90s Action Focus', date: '2026-05-01', movies: 12, status: 'Completed' },
	{ id: 3, name: 'Current Test Run', date: '2026-05-05', movies: 2, status: 'In Progress' }
];

export const mockUsers = [
	{ id: '1', name: 'Admin Dave', role: 'Super Admin', status: 'Active', limits: 'Unlimited' },
	{ id: '2', name: 'Moderator Mike', role: 'Moderator', status: 'Active', limits: 'Standard' },
	{ id: '3', name: 'Spammy Steve', role: 'User', status: 'Banned', limits: 'None' }
];
