import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import 'winston-daily-rotate-file';
import config from 'config';

class LoggerUtil {
  logger!: winston.Logger;

  loggerConfig: any = config.get('logger');

  constructor() {
    this.init();
  }

  private init(): void{
    const { combine, timestamp, printf } = winston.format;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const myFormat = printf(({ level, message, timestamp }) => `${timestamp}: ${level.toUpperCase()}: ${message}`);
    this.logger = winston.createLogger({
      level: 'info',
      format: combine(
        timestamp(),
        myFormat,
      ),
      defaultMeta: {
        service: this.loggerConfig.log_service_name,
      },
      transports: process.env.NODE_ENV === 'production' && this.loggerConfig.aws_log_type === 'EC2' ? [
        new winston.transports.DailyRotateFile({
          datePattern: 'DD-MM-YYYY',
          filename: this.loggerConfig.error_log_path,
          level: 'error',
        }),
        new winston.transports.DailyRotateFile({
          datePattern: 'DD-MM-YYYY',
          filename: this.loggerConfig.debug_log_path,
          level: 'debug',
        }),
      ] : [],
    });
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: combine(
          timestamp(),
          myFormat,
        ),
      }));
    } else if (this.loggerConfig.aws_log_type === 'CLOUDWATCH') {
      const cloudwatchConfig = {
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
        awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
        awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
        awsRegion: process.env.CLOUDWATCH_REGION,
        messageFormatter: (opt: any) => `${opt.level.toUpperCase()}: ${opt.message}`,
      };
      this.logger.add(new WinstonCloudWatch(cloudwatchConfig));
    }
  }
}
export default new LoggerUtil().logger;
