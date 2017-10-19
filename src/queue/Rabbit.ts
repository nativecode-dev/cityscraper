import * as URL from 'url'

import { Connection, Exchange, Message, Queue } from 'amqp-ts'
import { RabbitQueue } from './RabbitQueue'

export class RabbitConnection {
  private readonly connection: Connection

  constructor(url: URL.Url) {
    this.connection = new Connection(this.uri(url))
  }

  public inbox<T>(name: string): RabbitQueue<T> {
    const exchange = this.connection.declareExchange('amq.fanout', 'fanout')
    const queue = this.connection.declareQueue(`cityscraper:inbox:${name}:${process.pid}`, { durable: false, exclusive: true })
    queue.bind(exchange)
    return new RabbitQueue<T>(this.connection, queue)
  }

  public pubsub<T>(name: string): RabbitQueue<T> {
    const exchange = this.connection.declareExchange('amq.fanout', 'fanout')
    const queue = this.connection.declareQueue(`cityscraper:pubsub:${name}:${process.pid}`, { durable: false })
    queue.bind(exchange)
    return new RabbitQueue<T>(this.connection, queue)
  }

  public queue<T>(name: string): RabbitQueue<T> {
    const queue = this.connection.declareQueue(`cityscraper:queue:${name}`, { durable: true })
    return new RabbitQueue<T>(this.connection, queue)
  }

  public topic<T>(topic: string): RabbitQueue<T> {
    const exchange = this.connection.declareExchange('amq.topic', 'topic')
    const queue = this.connection.declareQueue(topic, { durable: false, exclusive: true })
    queue.bind(exchange)
    return new RabbitQueue<T>(this.connection, queue)
  }

  private uri(url: URL.Url) {
    const hostname = (): string => {
      const host = url.hostname || 'localhost'
      return url.auth ? `${url.auth}@${host}` : host
    }
    const port = (): string => url.port ? url.port : '5672'
    const vhost = (): string => url.path ? url.path.substring(1) : 'cityscraper'
    return `${url.protocol}//${hostname()}:${port()}/${vhost()}`
  }
}

const uri = process.env.CITYSCRAPER_QUEUE_URI || 'amqp://localhost:5672/cityscraper'
export const Rabbit = new RabbitConnection(URL.parse(uri))
