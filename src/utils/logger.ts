import config from '../config';

import fs from 'fs';
import path from 'path';

type LogType = 'info' | 'warn' | 'error' | 'debug' | 'all';

class Logger {
    static readonly colors = {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",

        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        FgGray: "\x1b[90m",

        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",
        BgGray: "\x1b[100m",
    } as const;


    private paths: { [key in LogType]?: string };
    private colors: { [key in Exclude<LogType, 'all'>]: keyof typeof Logger.colors } = {
        info: 'BgGreen',
        warn: 'BgYellow',
        error: 'BgRed',
        debug: 'BgBlue',
    };

    constructor(paths: { [key in LogType]?: string }) {
        this.paths = paths;

        // Create log files if they don't exist
        for (const logType in this.paths) {
            const filePath = this.paths[logType as LogType];
            if (filePath) {
                if (!fs.existsSync(filePath)) {
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    fs.writeFileSync(filePath, '');
                } else if (config.logger.clearLogs) {
                    fs.writeFileSync(filePath, '');
                }
            }
        }
    }

    static decorateForConsole(message: string, color: keyof typeof Logger.colors) {
        return `${Logger.colors[color]}${message}${Logger.colors.Reset}`;
    }

    private writeLog(logType: LogType, message: string) {
        const dateStr = `[${new Date().toISOString()}]`;
        const logTypeStr = `${logType.toUpperCase().padEnd(5)}`;

        // console output
        const coloredDateStr = Logger.decorateForConsole(dateStr, 'FgMagenta');
        const coloredLogTypeStr = Logger.decorateForConsole(logTypeStr, this.colors[logType]);
        console[logType](`${coloredDateStr} ${coloredLogTypeStr} ${message}`);

        // file output
        const fileMessage = `${dateStr} ${logTypeStr} ${message}\n`;
        const filePath = this.paths[logType];
        const allFilePath = this.paths.all;
        if (filePath) fs.appendFileSync(filePath, fileMessage);
        if (allFilePath) fs.appendFileSync(allFilePath, fileMessage);
    }

    info(message: string) {
        this.writeLog('info', message);
    }

    warn(message: string) {
        this.writeLog('warn', message);
    }

    error(message: string) {
        this.writeLog('error', message);
    }

    debug(message: string) {
        this.writeLog('debug', message);
    }
}

const logger = new Logger(config.logger.paths);

export default logger;
