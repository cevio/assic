export type TAssicStacks = {
  handler: () => Promise<any>,
  resolve: (data: any) => void,
  reject: (e: any) => void,
};

export class Assic {
  private status = false;
  private readonly stacks: TAssicStacks[] = [];

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

  public use<R = any>(callback: () => Promise<R>) {
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
    const chunk = this.stacks.shift();
    if (!chunk) return this.unlock();
    Promise.resolve(chunk.handler())
      .then(chunk.resolve)
      .catch(chunk.reject)
      .finally(() => this.notify());
  }
}