/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import winston from 'winston';

const filename = 'demon-slayer=scraper';
const logDirectory = 'logs';
const logLevels = ['info', 'warn'];

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.align(),
    winston.format.printf((info) =>
      `${info.label || ''} ${info.message}`.trim(),
    ),
  ),
  transports: logLevels.map(
    (level) =>
      new winston.transports.File({
        filename: `${filename}-${level}.log`,
        level,
        dirname: logDirectory,
      }),
  ),
});

export default logger;
