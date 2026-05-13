import { createHash } from 'node:crypto';

export class CacheManager {
	private readonly cache: Map<string, { data: unknown; expiry: number }> = new Map();
	private readonly defaultTtl: number;

	constructor(defaultTtlSeconds: number = 3600) {
		this.defaultTtl = defaultTtlSeconds * 1000;
	}

	/**
	 * Generates a deterministic key from a prefix and object/args
	 */
	public generateKey(prefix: string, args: unknown): string {
		const str = JSON.stringify(args);
		const hash = createHash('sha256').update(str).digest('hex').substring(0, 16);
		return `${prefix}:${hash}`;
	}

	public get<T>(key: string): T | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() > cached.expiry) {
			this.cache.delete(key);
			return null;
		}

		return cached.data as T;
	}

	public set(key: string, data: unknown, ttlSeconds?: number): void {
		const ttl = ttlSeconds === undefined ? this.defaultTtl : ttlSeconds * 1000;
		this.cache.set(key, {
			data,
			expiry: Date.now() + ttl
		});
	}

	public delete(key: string): void {
		this.cache.delete(key);
	}

	public clear(): void {
		this.cache.clear();
	}
}
