import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.replace('T', ' ')
		.slice(0, 19);

	const [globalUsage, usageLogs] = await Promise.all([
		locals.adminPb.collection('sm_global_usage').getFullList({ sort: 'date' }),
		locals.adminPb.collection('sm_usage_logs').getFullList({
			filter: `created >= '${thirtyDaysAgo}'`,
			sort: 'created'
		})
	]);

	// Aggregate usage logs
	const totalTokens = usageLogs.reduce((sum, r) => sum + (r.tokens as number), 0);
	const totalCost = usageLogs.reduce((sum, r) => sum + (r.cost_usd as number), 0);
	const activeUsers = new Set(usageLogs.map((r) => r.user_id as string)).size;
	const totalCalls = usageLogs.length;

	// Model breakdown (sorted by token usage desc)
	const modelMap = new Map<string, { tokens: number; cost: number; count: number }>();
	for (const r of usageLogs) {
		const model = (r.model as string) || 'unknown';
		const existing = modelMap.get(model) ?? { tokens: 0, cost: 0, count: 0 };
		modelMap.set(model, {
			tokens: existing.tokens + (r.tokens as number),
			cost: existing.cost + (r.cost_usd as number),
			count: existing.count + 1
		});
	}
	const modelBreakdown = [...modelMap.entries()]
		.map(([model, stats]) => ({ model, ...stats }))
		.sort((a, b) => b.tokens - a.tokens);

	// Last 7 days of global usage for chart
	const today = new Date().toISOString().slice(0, 10);
	const last7Days: { date: string; cost: number }[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		const record = globalUsage.find((r) => r.date === d);
		last7Days.push({ date: d, cost: (record?.total_cost as number) ?? 0 });
	}
	// Normalise to percentage heights (max = 100%)
	const maxCost = Math.max(...last7Days.map((d) => d.cost), 0.000001);
	const chartBars = last7Days.map((d) => ({
		date: d.date,
		cost: d.cost,
		heightPct: Math.max(4, Math.round((d.cost / maxCost) * 96))
	}));

	return {
		totalTokens,
		totalCost,
		activeUsers,
		totalCalls,
		modelBreakdown,
		chartBars,
		today
	};
};
