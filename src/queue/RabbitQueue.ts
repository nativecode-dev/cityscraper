import { Connection } from 'amqp-ts'

import { Lincoln } from '@nofrills/lincoln'
import { Message, Queue } from 'amqp-ts'
import { Logger } from '../logging'

export type RabbitQueueHandler<T> = (body: T, properties: any) => Promise<T>

export class RabbitQueue<T> {
  private readonly rabbit: Connection
  private readonly log: Lincoln
  private readonly queue: Queue

  constructor(rabbit: Connection, queue: Queue) {
    this.log = Logger.extend('RabbitQueue')
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
        const response = await request(json, message.properties)

        if (response) {
          message.ack()
        } else {
          message.reject()
        }
      } catch (error) {
        message.nack()
        this.log.error(error)
      }
    })
  }

  public send(body: T): void {
    const message = new Message(JSON.stringify(body))
    this.queue.send(message)
  }
}
