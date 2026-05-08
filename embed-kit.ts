/**
 * EmbedKit — shared utilities for building Discord embeds.
 *
 * Provides a typed color palette, safe truncation helpers, and a fluent
 * EmbedKit builder that enforces Discord's documented limits on every field.
 * Use EmbedKit for new builders; existing VisualBuilder methods can be
 * migrated incrementally.
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// ── Color palette ─────────────────────────────────────────────────────────────

export const Colors = {
  Blue:       0x0099FF,
  DodgerBlue: 0x1E90FF,
  Green:      0x00AE86,
  Teal:       0x1ABC9C,
  Orange:     0xFFA500,
  Red:        0xE74C3C,
  Gold:       0xF1C40F,
  Purple:     0x9B59B6,
  CobaltBlue: 0x3498DB,
  TMDbGreen:  0x01D277,
  Blurple:    0x5865F2,
} as const;

export const BADMOVIES_ICON = 'https://badmovies.co/apple-touch-icon.png';

// ── Safe truncation helpers ───────────────────────────────────────────────────

/** Truncate a string to `max` characters, appending an ellipsis if cut. */
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.substring(0, max - 1)}…`;
}

export const safeTitle       = (s: string): string => truncate(s, 256);
export const safeDescription = (s: string): string => truncate(s, 4096);
export const safeFieldName   = (s: string): string => truncate(s, 256);
export const safeFieldValue  = (s: string): string => truncate(s, 1024);
export const safeCustomId    = (s: string): string => s.substring(0, 100);
export const safeLabel       = (s: string): string => s.substring(0, 80);

// ── EmbedPayload type ─────────────────────────────────────────────────────────

export type EmbedPayload = {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
};

// ── Fluent EmbedKit builder ───────────────────────────────────────────────────

/**
 * Fluent builder for a single Discord embed.  Skips falsy field values
 * so callers don't need null-checks before calling `.field()`.
 *
 * @example
 * const payload = EmbedKit.create(Colors.Blue, 'My Title')
 *   .description('Some text')
 *   .field('Count', String(n), true)
 *   .footer('Bad Movies VR', true)
 *   .timestamp()
 *   .toPayload(components);
 */
export class EmbedKit {
  private readonly embed: EmbedBuilder;

  private constructor(color: number, title: string) {
    this.embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(safeTitle(title));
  }

  static create(color: number, title: string): EmbedKit {
    return new EmbedKit(color, title);
  }

  url(url: string): this {
    this.embed.setURL(url);
    return this;
  }

  description(text: string | null | undefined): this {
    if (text) this.embed.setDescription(safeDescription(text));
    return this;
  }

  author(name: string, iconURL?: string): this {
    this.embed.setAuthor({ name: truncate(name, 256), iconURL });
    return this;
  }

  thumbnail(url: string | null | undefined): this {
    if (url) this.embed.setThumbnail(url);
    return this;
  }

  image(url: string | null | undefined): this {
    if (url) this.embed.setImage(url);
    return this;
  }

  /**
   * Set the embed footer.
   * @param text        Footer text (max 2048 chars).
   * @param withBadMoviesIcon  When true, adds the BadMovies.co favicon as the footer icon.
   */
  footer(text: string, withBadMoviesIcon = false): this {
    this.embed.setFooter({
      text: truncate(text, 2048),
      ...(withBadMoviesIcon ? { iconURL: BADMOVIES_ICON } : {}),
    });
    return this;
  }

  timestamp(date?: Date): this {
    this.embed.setTimestamp(date ?? new Date());
    return this;
  }

  /**
   * Add a single field.  Skips silently when `value` is null, undefined, or ''.
   */
  field(name: string, value: string | null | undefined, inline = false): this {
    if (value == null || value === '') return this;
    this.embed.addFields({
      name: safeFieldName(name),
      value: safeFieldValue(value),
      inline,
    });
    return this;
  }

  /**
   * Add multiple inline fields in one call.  Falsy values are skipped.
   */
  inlineFields(...fields: Array<{ name: string; value: string | null | undefined }>): this {
    for (const f of fields) this.field(f.name, f.value, true);
    return this;
  }

  /**
   * Append an "…and N more" overflow indicator field.
   * No-op when `remaining` is 0 or negative.
   */
  overflowField(remaining: number, hint?: string): this {
    if (remaining <= 0) return this;
    this.embed.addFields({
      name: `…and ${remaining} more`,
      value: hint ?? '\u200b',
      inline: false,
    });
    return this;
  }

  /** Return the underlying EmbedBuilder for use with other discord.js APIs. */
  toEmbed(): EmbedBuilder {
    return this.embed;
  }

  /** Wrap the embed in a sendable payload object, optionally with component rows. */
  toPayload(components: ActionRowBuilder<ButtonBuilder>[] = []): EmbedPayload {
    return { embeds: [this.embed], components };
  }
}
// ── Back-navigation helpers ───────────────────────────────────────────────────

/**
 * Build a single-button ActionRow for back navigation.
 */
export function makeBackRow(label: string, customId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(safeCustomId(customId))
      .setLabel(safeLabel(label))
      .setStyle(ButtonStyle.Secondary),
  );
}

/**
 * Return a new EmbedPayload with a back-navigation row prepended to the
 * component rows.  Silently drops trailing rows beyond Discord's 5-row limit.
 */
export function withBackRow(payload: EmbedPayload, label: string, customId: string): EmbedPayload {
  const MAX_ROWS = 5;
  const components = [makeBackRow(label, customId), ...payload.components].slice(0, MAX_ROWS);
  return { embeds: payload.embeds, components };
}