export type TAssicStacks = {
  handler: () => Promise<any> | any,
  resolve: (data: any) => void,
  reject: (e: any) => void,
};

export class Assic {
  private status = false;
  private readonly stacks: TAssicStacks[] = [];

  constructor(private readonly max: number = 1) {}

  get locked() {
    return this.status;
  }

  private lock() {
    this.status = true;
    return this;
  }

  private unlock() {
    this.status = false;
    return this;
  }

  public use<R = any>(callback: () => Promise<R> | R) {
    return new Promise<R>((resolve, reject) => {
      this.stacks.push({
        handler: callback,
        resolve, reject,
      });
      if (!this.locked) {
        this.lock();
        this.notify();
      }
    })
  }

  private notify() {
    const len = this.stacks.length;
    if (!len) return this.unlock();
    const i = len > this.max ? this.max : len;
    const chunk = this.stacks.slice(0, i);
    this.stacks.splice(0, i);
    Promise.all(
      chunk.map(c => {
        return Promise.resolve(c.handler())
          .then(c.resolve)
          .catch(c.reject);
      })
    )
    .finally(() => this.notify());
  }
}