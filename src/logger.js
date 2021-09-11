const winston = require('winston');

const logger = winston.createLogger({
  level: 'error', //error, warn,  info, http, verbose, debug, silly
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: './src/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './src/logs/all.log' }),
  ],
});


if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
      format: winston.format.simple()
  }));
}

module.exports = logger;