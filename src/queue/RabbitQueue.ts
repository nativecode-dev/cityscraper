import { Connection, Exchange, Message, Queue } from 'amqp-ts'

export type RabbitQueueHandler<T> = (body: T, properties: any) => Promise<any>

export class RabbitQueue<T> {
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
        const response = await request(json, message.properties)

        if (response) {
          message.ack()
        } else {
          message.reject()
        }
      } catch (error) {
        message.nack()
      }
    })
  }

  public publish(body: T): void {
    if (this.exchange) {
      this.exchange.send(new Message(JSON.stringify(body)))
    } else {
      this.send(body)
    }
  }

  public send(body: T): void {
    this.queue.send(new Message(JSON.stringify(body)))
  }
}
