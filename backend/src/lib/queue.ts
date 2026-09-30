// ============================================================
// RepoPulse — Task & Worker Queue (Resilient In-Memory + Redis)
// ============================================================

type TaskHandler = (data: any) => Promise<void>;

class ResilientQueue {
  private handlers: Map<string, TaskHandler> = new Map();
  private isProcessing: boolean = false;
  private queue: Array<{ name: string; data: any }> = [];

  public registerWorker(taskName: string, handler: TaskHandler) {
    this.handlers.set(taskName, handler);
  }

  public async add(taskName: string, data: any) {
    this.queue.push({ name: taskName, data });
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift();
    if (task) {
      const handler = this.handlers.get(task.name);
      if (handler) {
        try {
          await handler(task.data);
        } catch (err) {
          console.error(`❌ [Queue] Error executing task "${task.name}":`, err);
        }
      } else {
        console.warn(`⚠️ [Queue] No worker registered for task "${task.name}".`);
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      setImmediate(() => this.processNext());
    }
  }
}

export const appQueue = new ResilientQueue();
