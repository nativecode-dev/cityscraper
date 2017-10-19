import * as URL from 'url'

import { Connection, Exchange, Message, Queue } from 'amqp-ts'
import { RabbitQueue } from './RabbitQueue'

export class RabbitConnection {
  private readonly connection: Connection

  constructor(url: URL.Url) {
    this.connection = new Connection(this.uri(url))
  }

  public get initialized(): Promise<void> {
    return this.connection.completeConfiguration()
  }

  public inbox<T>(name: string): Promise<RabbitQueue<T>> {
    const exchange = this.connection.declareExchange(`cityscraper:${this.clean(name)}`, 'fanout')
    const queue = this.connection.declareQueue(`cityscraper:${this.clean(name)}`, { autoDelete: true, durable: false })
    queue.bind(exchange)
    return this.initialized.then(() => new RabbitQueue<T>(this.connection, queue, exchange))
  }

  public pubsub<T>(name: string): Promise<RabbitQueue<T>> {
    const exchange = this.connection.declareExchange(`cityscraper:${this.clean(name)}`, 'fanout')
    const queue = this.connection.declareQueue(`cityscraper:${this.clean(name)}:${process.pid}`, { autoDelete: true, durable: false })
    queue.bind(exchange)
    return this.initialized.then(() => new RabbitQueue<T>(this.connection, queue, exchange))
  }

  public queue<T>(name: string): Promise<RabbitQueue<T>> {
    const queue = this.connection.declareQueue(`cityscraper:${this.clean(name)}`, { durable: true })
    return this.initialized.then(() => new RabbitQueue<T>(this.connection, queue))
  }

  public topic<T>(name: string): Promise<RabbitQueue<T>> {
    const exchange = this.connection.declareExchange(`cityscraper:${this.clean(name)}`, 'topic')
    const queue = this.connection.declareQueue(`cityscraper:${this.clean(name)}`, { autoDelete: true, durable: false })
    queue.bind(exchange)
    return this.initialized.then(() => new RabbitQueue<T>(this.connection, queue, exchange))
  }

  private clean(name: string): string {
    return name.replace(/[\s,\/,_]/g, '-')
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
