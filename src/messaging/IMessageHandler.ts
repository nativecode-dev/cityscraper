export interface IMessageHandler {
  priority: number

  handle(message: object): Promise<object>
  handles(message: object): boolean
}
