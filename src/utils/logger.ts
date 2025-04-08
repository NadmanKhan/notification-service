import fs from 'fs';
import path from 'path';
import os from 'os';

export type LogLevel = typeof LOG_LEVELS[number];

export type ColorRule = {
    bg?: keyof typeof CONSOLE_STYLE_CMDS['bg'];
    fg?: keyof typeof CONSOLE_STYLE_CMDS['fg'];
};

export type LogLevelColorRule = {
    [key in LogLevel]?: ColorRule;
};


export const CONSOLE_STYLE_CMDS = {
    modifiers: {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Inverse: "\x1b[7m",
        Hidden: "\x1b[8m",
    },
    fg: {
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        FgGray: "\x1b[90m",
        FgBrightBlack: "\x1b[90m", // Bright Black == Gray
        FgBrightRed: "\x1b[91m",
        FgBrightGreen: "\x1b[92m",
        FgBrightYellow: "\x1b[93m",
        FgBrightBlue: "\x1b[94m",
        FgBrightMagenta: "\x1b[95m",
        FgBrightCyan: "\x1b[96m",
        FgBrightWhite: "\x1b[97m",
    },
    bg: {
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",
        BgGray: "\x1b[100m",
        BgBrightBlack: "\x1b[100m", // Bright Black == Gray
        BgBrightRed: "\x1b[101m",
        BgBrightGreen: "\x1b[102m",
        BgBrightYellow: "\x1b[103m",
        BgBrightBlue: "\x1b[104m",
        BgBrightMagenta: "\x1b[105m",
        BgBrightCyan: "\x1b[106m",
    }
} as const;

export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

export const LOG_LEVELS_RANK: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
} as const;

export const DEFAULT_LOG_LEVEL: LogLevel = 'info';
export const DEFAULT_LOG_LEVEL_COLOR_RULE: LogLevelColorRule = {
    trace: { bg: 'BgGray' },
    debug: { bg: 'BgCyan' },
    info: { bg: 'BgGreen' },
    warn: { bg: 'BgYellow' },
    error: { bg: 'BgRed' },
    fatal: { bg: 'BgBrightRed' },
};

const CONSOLE_LOG_MAP: Record<LogLevel, (message: string) => void> = {
    trace: console.trace,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    fatal: console.error,
};

function applyColor(message: string, colorRule: ColorRule): string {
    const bgColor = colorRule.bg ? CONSOLE_STYLE_CMDS.bg[colorRule.bg] : '';
    const fgColor = colorRule.fg ? CONSOLE_STYLE_CMDS.fg[colorRule.fg] : '';
    const resetCmd = CONSOLE_STYLE_CMDS.modifiers.Reset;
    const color = bgColor + fgColor;
    message = color ? (color + message + resetCmd) : message;
    return message;

}


export type LoggerOptions = {
    logFile?: {
        path?: string;
        clearOnStartup?: boolean;
    };
    logLevel?: LogLevel;
    logLevelColorRule?: LogLevelColorRule;
};

export type LogOptions = {
    level: LogLevel;
    messageColorRule?: ColorRule;
};
export class StructuredLog {
    hostname: string;
    pid: number;
    date: Date;
    logLevel: LogLevel;
    message: string;

    constructor(logLevel: LogLevel, message: string) {
        this.hostname = os.hostname();
        this.pid = process.pid;
        this.date = new Date();
        this.logLevel = logLevel;
        this.message = message;
    }

    format(options?: { logLevelColorRule?: ColorRule, messageColorRule?: ColorRule }): string {
        const { hostname, pid, date, logLevel, message } = this;

        let hostnameStr = `[${hostname}]`;
        let pidStr = `[${pid}]`;
        let dateStr = `[${date.toISOString()}]`;
        let logLevelStr = `[${logLevel.toUpperCase().padEnd(5)}]`;
        let messageStr = message;

        if (options?.logLevelColorRule) {
            const colorRule = options?.logLevelColorRule;
            hostnameStr = applyColor(hostnameStr, { fg: 'FgGray' });
            pidStr = applyColor(pidStr, { fg: 'FgCyan' });
            dateStr = applyColor(dateStr, { fg: 'FgMagenta' });
            logLevelStr = applyColor(logLevelStr, colorRule || {});
        }

        if (options?.messageColorRule) {
            const messageColorRule = options?.messageColorRule;
            messageStr = applyColor(messageStr, messageColorRule);
        }

        return `${hostnameStr} ${pidStr} ${dateStr} ${logLevelStr} ${messageStr}`;
    }
}


export class Logger {
    private logFilePath?: string;
    private logLevelRank: number = LOG_LEVELS_RANK[DEFAULT_LOG_LEVEL];
    private logLevel: LogLevel = DEFAULT_LOG_LEVEL;
    private logLevelColorRule: LogLevelColorRule = DEFAULT_LOG_LEVEL_COLOR_RULE;

    constructor(options?: LoggerOptions) {
        // Set properties
        this.logFilePath = options?.logFile?.path;
        this.logLevel = options?.logLevel || DEFAULT_LOG_LEVEL;
        this.logLevelRank = LOG_LEVELS_RANK[this.logLevel];
        this.logLevelColorRule = {
            ...DEFAULT_LOG_LEVEL_COLOR_RULE,
            ...options?.logLevelColorRule,
        };

        // Create log file if they don't exist
        if (this.logFilePath && !fs.existsSync(this.logFilePath)) {
            const dir = path.dirname(this.logFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.logFilePath, '');
        }

        // Clear log file on startup if specified
        if (this.logFilePath && options?.logFile?.clearOnStartup) {
            fs.writeFileSync(this.logFilePath, '');
        }
    }


    log(
        message: string,
        { level, messageColorRule }: LogOptions = { level: 'info' },
    ) {

        if (this.logLevelRank > LOG_LEVELS_RANK[level]) {
            return;
        }

        const structuredLog = new StructuredLog(level, message);

        // console output
        CONSOLE_LOG_MAP[level](structuredLog.format({
            logLevelColorRule: this.logLevelColorRule[level],
            messageColorRule,
        }));

        // file output
        if (this.logFilePath) {
            fs.appendFileSync(this.logFilePath, structuredLog.format() + os.EOL);
        }
    }

    trace(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'trace', messageColorRule });
    }

    debug(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'debug', messageColorRule });
    }

    info(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'info', messageColorRule });
    }

    warn(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'warn', messageColorRule });
    }

    error(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'error', messageColorRule });
    }

    fatal(message: string, { messageColorRule }: { messageColorRule?: ColorRule } = {}) {
        this.log(message, { level: 'fatal', messageColorRule });
    }
}
