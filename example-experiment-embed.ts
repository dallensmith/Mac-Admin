import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { NormalizedExperiment } from './src/lib/models/movie.js';
import { Colors } from 'embed-kit';

export class VisualBuilder {
	public static buildExperimentEmbed(exp: NormalizedExperiment): {
		embeds: EmbedBuilder[];
		components: ActionRowBuilder<ButtonBuilder>[];
	} {
		const embed = new EmbedBuilder()
			.setColor(Colors.DodgerBlue)
			.setTitle(exp.name || 'Unknown Experiment')
			.setDescription(exp.result || 'Experiment details available in the archives.');

		// Row 1: Date / Movies count / Host
		const statsRow: { name: string; value: string; inline: boolean }[] = [
			{ name: 'Date', value: VisualBuilder.formatDate(exp.date), inline: true },
			{ name: 'Movies', value: String(exp.movies?.length ?? 0), inline: true }
		];
		if (exp.host) statsRow.push({ name: 'Host', value: exp.host, inline: true });
		embed.addFields(...statsRow);

		// Featured Movies: numbered list with year
		if (exp.movies && exp.movies.length > 0) {
			const lineup = exp.movies
				.map((m, i) => {
					const yearSuffix = m.year ? ` (${m.year})` : '';
					return `**Movie ${i + 1}:** ${m.title}${yearSuffix}`;
				})
				.join('\n')
				.slice(0, 1024);
			embed.addFields({ name: 'Featured Movies', value: lineup, inline: false });
		}

		// View on BadMovies.co link
		if (exp.url) {
			embed.addFields({
				name: 'View on BadMovies.co',
				value: `[${exp.name}](${exp.url})`,
				inline: false
			});
		}

		if (exp.bannerUrl) {
			embed.setImage(exp.bannerUrl);
		}

		embed.setFooter({ text: 'BadMovies.co • Movie Night Experiments', iconURL: BADMOVIES_ICON });

		const expNum = /#(\d+)/.exec(exp.name)?.[1] ?? exp.name;
		const components: ActionRowBuilder<ButtonBuilder>[] = [];
		if (exp.movies && exp.movies.length > 0) {
			const row = new ActionRowBuilder<ButtonBuilder>();
			exp.movies.slice(0, 5).forEach((movie) => {
				const yearSuffix = movie.year ? ` (${movie.year})` : '';
				// Prefer slug over numeric ID — slug routes to getMovie() via WHERE slug=...
				// whereas a numeric ID can collide with year-like numbers or wrong row IDs.
				const movieKey = movie.slug ?? movie.id;
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(safeCustomId(`exp_movie_${expNum}_${movieKey}`))
						.setLabel(safeLabel(`${movie.title}${yearSuffix}`))
						.setStyle(ButtonStyle.Secondary)
				);
			});
			components.push(row);
		}

		return { embeds: [embed], components };
	}
}
