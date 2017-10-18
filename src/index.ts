export * from './models'

import URL = require('url')

import * as process from 'process'

import { IMessageHandler, MessageProcessor } from './messaging'

class SimpleMessageHandler implements IMessageHandler {
  public handle(message: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log(message)
    })
  }

  public handles(message: any): boolean {
    return true
  }
}

const handlers: IMessageHandler[] = []
const processor = new MessageProcessor(handlers)
const uri = process.env.CITYSCRAPER_QUEUE_URI || 'amqp://localhost:4369/cityscraper'
const url: URL.Url = URL.parse(uri)

processor.start(url)
