export interface IMessageHandler {
  handle(message: any): Promise<void>
  handles(message: any): boolean
}
