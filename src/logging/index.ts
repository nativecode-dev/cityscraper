import * as debug from 'debug'

import { Filter, Interceptor, Lincoln, LincolnRegistry, Log, Options } from '@nofrills/lincoln'
import { Rabbit, RabbitQueue } from '../queue'

export const DebugLine = (namespace: string, line: string): void => {
  const logger: debug.IDebugger = debug(namespace)
  logger(line)
}

export const DebugLog = (log: Log): Log => {
  const logger: debug.IDebugger = debug(log.namespace)
  if (log.parameters.length && typeof log.parameters[0] === 'string') {
    logger(log.parameters[0], log.parameters.slice(1))
  } else {
    logger(log.parameters)
  }
  return log
}

const DebugInterceptor = (log: Log): Log => DebugLog(log)

const RabbitInterceptor = async (queuePromise: Promise<RabbitQueue<Log>>, log: Log): Promise<Log> => {
  const queue = await queuePromise
  queue.publish(log)
  return log
}

const CreateOptions = (namespace: string): Options => {
  const queuePromise = Rabbit.queue<Log>('logging')

  const options: Options = {
    filters: new LincolnRegistry<Filter>(),
    interceptors: new LincolnRegistry<Interceptor>(),
    namespace,
    separator: ':',
  }

  options.interceptors.register('debug', DebugInterceptor)
  options.interceptors.register('rabbit', (log: Log): Log => {
    RabbitInterceptor(queuePromise, log)
    return log
  })

  return options
}

const CreateLogger = (name: string): Lincoln => {
  const options = CreateOptions(name)
  return new Lincoln(options)
}

export const Logger = CreateLogger('nativecode:cityscraper')
