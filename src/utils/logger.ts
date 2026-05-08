import pino from 'pino';
import { rename, access, stat } from 'node:fs/promises';
import { join } from 'node:path';

// ANSI color codes — used only by banner(), which bypasses Pino entirely
const RESET = '\x1b[0m';
const CYAN  = '\x1b[36m';
const BOLD  = '\x1b[1m';
const WHITE = '\x1b[37m';

// Timestamp suffix for rotated filenames: YYYY-MM-DDTHH-mm-ss
function fileTimestamp(): string {
  return new Date().toISOString().replaceAll(':', '-').replace(/\..+/, '');
}

// Calendar date string for staleness check: YYYY-MM-DD
function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

class Logger {
  private instance: pino.Logger;
  private rotationTimer: ReturnType<typeof setTimeout> | null = null;
  private currentLevel = 'info';
  private currentLokiUrl?: string;

  constructor() {
    this.instance = this.buildInstance('info');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildInstance(level: string, logDir?: string, lokiUrl?: string): pino.Logger {
    const baseTargets: pino.TransportTargetOptions[] = [
      {
        target: 'pino-pretty',
        level,
        options: {
          colorize:      true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore:        'pid,hostname',
        },
      },
    ];

    const logDirTargets: pino.TransportTargetOptions[] = logDir ? [
      {
        target: 'pino/file',
        level,
        options: {
          destination: join(logDir, 'mac-latest.log'),
          mkdir:       true,
        },
      },
      // Errors are written to both mac-latest.log and mac-error.log
      {
        target: 'pino/file',
        level:  'error',
        options: {
          destination: join(logDir, 'mac-error.log'),
          mkdir:       true,
          // pino/file appends by default — same-day restarts accumulate in mac-error.log
        },
      },
    ] : [];
    const lokiTargets: pino.TransportTargetOptions[] = lokiUrl ? [
      {
        target: 'pino-loki',
        level,
        options: {
          host:          lokiUrl,
          labels:        { app: 'smart-mac' },
          silenceErrors: false,
        },
      },
    ] : [];
    const targets: pino.TransportTargetOptions[] = [...baseTargets, ...logDirTargets, ...lokiTargets];

    const transport = pino.transport({ targets });
    return pino({ level }, transport);
  }

  /** Always rotates mac-latest.log on startup or midnight. */
  private async rotatePrevious(logDir: string): Promise<void> {
    const latest = join(logDir, 'mac-latest.log');
    try {
      await access(latest);
      await rename(latest, join(logDir, `mac-${fileTimestamp()}.log`));
    } catch {
      // File absent — nothing to rotate
    }
  }

  /**
   * Rotates mac-error.log only if it is from a different calendar day.
   * Same-day restarts leave it in place so errors accumulate for the day.
   */
  private async rotateErrorIfStale(logDir: string): Promise<void> {
    const errorLog = join(logDir, 'mac-error.log');
    try {
      await access(errorLog);
      const stats  = await stat(errorLog);
      const fileDay = stats.mtime.toISOString().slice(0, 10);
      if (fileDay !== todayDate()) {
        await rename(errorLog, join(logDir, `mac-error-${fileTimestamp()}.log`));
      }
      // Same day: leave it — pino/file will append
    } catch {
      // File absent — nothing to rotate
    }
  }

  /** One-shot timer to midnight; rotates both files and rebuilds transports. */
  private scheduleMidnightRotation(logDir: string): void {
    if (this.rotationTimer !== null) {
      clearTimeout(this.rotationTimer);
    }

    const now      = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const delay    = midnight.getTime() - now.getTime();

    this.rotationTimer = setTimeout(async () => {
      try {
        // At midnight it's always a new day, so both files rotate
        await this.rotatePrevious(logDir);
        await this.rotateErrorIfStale(logDir);
        this.instance = this.buildInstance(this.currentLevel, logDir, this.currentLokiUrl);
      } catch {
        // Best-effort — do not crash the bot on rotation failure
      }
      this.scheduleMidnightRotation(logDir);
    }, delay);

    // Unref so the timer doesn't prevent clean process exit
    this.rotationTimer.unref();
  }

  // ── Public API (unchanged from original) ──────────────────────────────────

  public async configure(level: string, logDir?: string, lokiUrl?: string): Promise<void> {
    this.currentLevel = level;
    this.currentLokiUrl = lokiUrl;
    if (logDir) {
      await this.rotatePrevious(logDir);
      await this.rotateErrorIfStale(logDir);
    }
    this.instance = this.buildInstance(level, logDir, lokiUrl);
    if (logDir) {
      this.scheduleMidnightRotation(logDir);
    }
    if (lokiUrl) {
      this.instance.info(`Loki transport enabled — pushing logs to ${lokiUrl}`);
    } else {
      this.instance.warn('Loki transport disabled — LOKI_URL not set');
    }
  }

  public debug(msg: string): void;
  public debug(obj: Record<string, unknown>, msg: string): void;
  public debug(msgOrObj: string | Record<string, unknown>, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.instance.debug(msgOrObj);
    } else {
      this.instance.debug(msgOrObj, msg ?? '');
    }
  }

  public info(msg: string): void;
  public info(obj: Record<string, unknown>, msg: string): void;
  public info(msgOrObj: string | Record<string, unknown>, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.instance.info(msgOrObj);
    } else {
      this.instance.info(msgOrObj, msg ?? '');
    }
  }

  public warn(msg: string): void;
  public warn(obj: Record<string, unknown>, msg: string): void;
  public warn(msgOrObj: string | Record<string, unknown>, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.instance.warn(msgOrObj);
    } else {
      this.instance.warn(msgOrObj, msg ?? '');
    }
  }

  public error(msg: string): void;
  public error(obj: Record<string, unknown>, msg: string): void;
  public error(msgOrObj: string | Record<string, unknown>, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.instance.error(msgOrObj);
    } else {
      this.instance.error(msgOrObj, msg ?? '');
    }
  }

  /**
   * Startup banner — direct process.stdout.write with box-drawing chars.
   * Bypasses Pino entirely so it always displays regardless of log level.
   */
  public banner(lines: string[]): void {
    const width  = 50;
    const top    = `${CYAN}${BOLD}╔${'═'.repeat(width)}╗${RESET}`;
    const bottom = `${CYAN}${BOLD}╚${'═'.repeat(width)}╝${RESET}`;
    const div    = `${CYAN}  ${'─'.repeat(width)}${RESET}`;

    process.stdout.write(`${top}\n`);
    for (const line of lines) {
      if (line === '---') {
        process.stdout.write(`${div}\n`);
      } else {
        process.stdout.write(`${CYAN}${BOLD}║${RESET}  ${WHITE}${line}${RESET}\n`);
      }
    }
    process.stdout.write(`${bottom}\n`);
  }
}

export const logger = new Logger();
