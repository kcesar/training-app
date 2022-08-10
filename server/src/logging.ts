import winston from 'winston';

export function createLogger(label:string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: {
      label
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      winston.format.colorize(),
      winston.format.printf(info => {
          let out = `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
          if (Object.keys(info.metadata).length) {
            out += ' ' + JSON.stringify(info.metadata);
          }
          if (info.metadata.error) {
              out = out + ' ' + info.metadata.error;
              if (info.metadata.error.stack) {
                  out = out + ' ' + info.metadata.error.stack;
              }
          }
          return out;
      }),
    ),
    transports: [new winston.transports.Console()],
  })
}