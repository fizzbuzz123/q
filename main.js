const makeIdx = (() => {
  let idx = 0;
  return () => idx += 1;
})();
const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
const noop = () => {};

class Queue {
  #jobs = [];
  #onProcess = noop;
  #onSuccess = noop;
  #onFailure = noop;
  #onDone = noop;
  #onDrain = noop;

  constructor() {
    this.#init();
  }

  #init() {
    const listen = async () => {
      while (this.#jobs.length !== 0) {
        await this.#tick();
      }
      setTimeout(listen, 1000);
    };
    listen();
  }

  async #tick() {
    const job = this.#jobs.pop();
    await this.#onProcess(job);
  }

  process(cb) {
    this.#onProcess = cb;
    return this;
  }

  success(cb) {
    this.#onSuccess = cb;
    return this;
  }

  failure(cb) {
    this.#onFailure = cb;
    return this;
  }

  done(cb) {
    this.#onDone = cb;
    return this;
  }

  drain(cb) {
    this.#onDrain = cb;
    return this;
  }

  add(job) {
    this.#jobs.unshift(job);
    return this;
  }
}

const main = () => {
  const queue = new Queue();
  queue
    .process(async (job) => {
      await wait(2000);
      console.dir({ job });
    })
    .success((result) => console.dir({ result }))
    .failure((error) => console.dir({ error }))
    .done((error, result) => {
      console.dir({ error });
      console.dir({ result });
    })
    .drain(() => {
      console.log('Queue drain');
    });

  setInterval(() => {
    queue
      .add({ name: 'uaa', data: { userId: makeIdx() } })
      .add({ name: 'uaa', data: { userId: makeIdx() } })
      .add({ name: 'uaa', data: { userId: makeIdx() } });
  }, 1000);

  setInterval(() => { console.log('Middle man'); }, 1500);
};
