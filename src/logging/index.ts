export * from './FileLog'

import * as debug from 'debug'

import { Filter, Interceptor, Lincoln, LincolnRegistry, Log, Options } from '@nofrills/lincoln'
import { Rabbit, RabbitQueue } from '../queue'

const DebugInterceptor: Interceptor = (log: Log): Log => {
  DebugOutput(log)
  return log
}

let queue: RabbitQueue<Log> | null = null

const RabbitInterceptor: Interceptor = (log: Log): Log => {
  if (queue === null) {
    queue = Rabbit.pubsub<Log>('logging')
  }
  queue.send(log)
  return log
}

const CreateOptions = (namespace: string): Options => {
  const options: Options = {
    filters: new LincolnRegistry<Filter>(),
    interceptors: new LincolnRegistry<Interceptor>(),
    namespace,
    separator: ':',
  }

  options.interceptors.register('debug', DebugInterceptor)
  options.interceptors.register('rabbit', RabbitInterceptor)

  return options
}

const CreateLogger = (options: string | Options | Partial<Options>): Lincoln => {
  if (typeof options === 'string') {
    return new Lincoln(CreateOptions(options))
  }
  return new Lincoln(options)
}

export const DebugLine = (namespace: string, line: string): void => {
  const logger: debug.IDebugger = debug(namespace)
  logger(line)
}

export const DebugOutput = (log: Log): void => {
  const logger: debug.IDebugger = debug(log.namespace)
  if (log.parameters.length && typeof log.parameters[0] === 'string') {
    logger(log.parameters[0], log.parameters.slice(1))
  } else {
    logger(log.parameters)
  }
}

export const Logger: Lincoln = CreateLogger('nativecode:cityscraper')
