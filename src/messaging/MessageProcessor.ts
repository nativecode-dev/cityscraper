import URL = require('url')

import { IMessageHandler } from './IMessageHandler'
import { Connection, Exchange, Message, Queue } from 'amqp-ts'
import { Site } from '../models'

const vhost = (url: URL.Url): string => {
  if (url.pathname) {
    const parts = url.pathname.split('/').slice(1)
    if (parts.length > 0) {
      return parts[0]
    }
  }
  return 'cityscraper'
}

export class MessageProcessor {
  private readonly handlers: IMessageHandler[]

  private queue: Queue

  constructor(handlers: IMessageHandler[]) {
    this.handlers = handlers.sort((a, b) => a.priority > b.priority ? 1 : 0)
  }

  public async start(url: URL.Url): Promise<void> {
    const auth = url.auth ? `${url.auth}@` : ''
    const port = url.port || '5672'
    const uri = `${url.protocol}//${auth}${url.hostname}:${port}/${vhost(url)}`

    const connection = new Connection(uri)
    const exchange = connection.declareExchange('amq.fanout', 'fanout', { durable: true })
    const queue = connection.declareQueue(`cityscraper:${process.pid}`, { durable: false, exclusive: true })

    queue.bind(exchange)
    queue.activateConsumer(async (message: Message): Promise<any> => {
      try {
        const body = message.getContent()
        const json = JSON.parse(body)

        const result = await this.handlers
          .filter((handler: IMessageHandler): boolean => handler.handles(json))
          .map((handler: IMessageHandler): Promise<object> => handler.handle(json))
          .reduce(async (previous: Promise<object>, current: Promise<object>): Promise<object> => {
            const prev = await previous
            const curr = await current
            return Object.assign(prev, curr)
          }, Promise.resolve({}))
          .catch((error: any) => console.log(error))

        message.ack()
        return result
      } catch (error) {
        message.reject(false)
        console.log(error)
      }
    })
  }
}
