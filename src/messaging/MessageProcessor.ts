import URL = require('url')

import * as fs from 'fs'
import * as path from 'path'

import { IMessageHandler } from './IMessageHandler'
import { Connection, Message } from 'amqp-ts'
import { Site } from '../models'

export class MessageProcessor {
  private readonly handlers: IMessageHandler[]

  constructor(handlers: IMessageHandler[]) {
    this.handlers = handlers
  }

  public start(url: URL.Url): Promise<void> {
    const auth = url.auth ? `${url.auth}@` : ''
    const port = url.port ? `:${url.port}` : ''
    const address = `amqp://${auth}${url.hostname}${port}`
    const exchangeName = url.pathname ? url.pathname.split('/')[1] : 'cityscraper'
    const queueName = `${exchangeName}:queue`

    const connection = new Connection(address)
    const exchange = connection.declareExchange(exchangeName)
    const queue = connection.declareQueue(queueName)

    queue.bind(exchange)

    queue.activateConsumer((message: Message) => {
      console.log(message)
      message.ack()
    })

    const pathname = path.join(process.cwd(), 'src/site.json')

    return connection.completeConfiguration().then(() => {
      fs.readFile(pathname, (error: NodeJS.ErrnoException, data: Buffer) => {
        const message = new Message(data)
        exchange.send(message)
      })
    })
  }
}
