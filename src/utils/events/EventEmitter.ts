export interface IEventEmitter<T> {
  on(handler: (data?: T) => void): void;
  off(handler: (data?: T) => void): void;
}

export type IHandler<T> = (data: T) => void;

export class EventEmitter<T> {
  private handlers: Array<IHandler<T>> = [];

  public on(handler: IHandler<T>): void {
    this.handlers.push(handler);
  }

  public off(handler: IHandler<T>): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  public trigger(data: T) {
    this.handlers.slice(0).forEach(h => h(data));
  }
}
