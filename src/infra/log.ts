import getenv from 'getenv'
import Pino from 'pino'

const levels = {
  ...Pino.levels.values,
  // a silly log is literally just noise but
  // helps when the chips are down and you need
  // to know _everything_ happening
  silly: -1,
}

export default Pino({
  name: getenv.string('NAME', 'UNKOWN'),
  level: getenv.string('LOG_LEVEL', 'info'),
  mixin: () => ({
    version: getenv.string('VERSION', '0.0.0-UNKNOWN'),
  }),
  serializers: Pino.stdSerializers,
  customLevels: levels,
  transport:
    getenv.string('ENVIRONMENT', 'development') === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            customLevels: Object.entries(levels)
              .map(([key, value]) => `${key}:${value}`)
              .join(','),
          },
        }
      : undefined,
})
