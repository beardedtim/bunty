import Logger from '@app/infra/log'

Logger.silly(
  'We are starting the sytem. Here is where we would call any sort of PRE-pre setup such as starting telemetry, setting up file system state, etc',
)

// We read `./start` as require here so that we parse
// the code _only after_ we have successfully done any
// setup above
require('./start')
