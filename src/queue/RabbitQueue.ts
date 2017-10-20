import { Connection, Exchange, Message, Queue } from 'amqp-ts'
import { Model } from '../models/Model'

export type RabbitQueueHandler<T extends Model | any> = (body: T, properties: any) => Promise<void>

export class RabbitQueue<T extends Model | any> {
  private readonly exchange: Exchange | null
  private readonly rabbit: Connection
  private readonly queue: Queue

  constructor(rabbit: Connection, queue: Queue, exchange?: Exchange) {
    this.exchange = exchange || null
    this.queue = queue
    this.rabbit = rabbit
  }

  public get configured(): Promise<Connection> {
    return this.rabbit.completeConfiguration().then(() => this.rabbit)
  }

  public close(): any {
    return this.queue.close()
  }

  public message(request: RabbitQueueHandler<T>): void {
    this.queue.activateConsumer(async (message: Message) => {
      try {
        const json = JSON.parse(message.getContent())
        await request(json, message.properties)
        message.ack()
      } catch (error) {
        message.nack()
      }
    })
  }

  public publish(body: T, route?: string): void {
    if (this.exchange) {
      this.exchange.send(new Message(JSON.stringify(body)), route)
    } else {
      this.send(body)
    }
  }

  public send(body: T, route?: string): void {
    this.queue.send(new Message(JSON.stringify(body)), route)
  }
}
