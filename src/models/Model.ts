export abstract class Model {
  public dateCreated: Date = new Date()
  public dateUpdated: Date
  public id: string = Date.now().toString()
  public abstract get key(): string
}
