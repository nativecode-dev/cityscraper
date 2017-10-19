import URL = require('url')

import * as process from 'process'

import { FormActionHandler, IMessageHandler, MessageProcessor } from './messaging'

const handlers: IMessageHandler[] = [new FormActionHandler()]
const processor = new MessageProcessor(handlers)
const uri = process.env.CITYSCRAPER_QUEUE_URI || 'amqp://localhost:5672/cityscraper'
const url: URL.Url = URL.parse(uri)

processor.start(url)
