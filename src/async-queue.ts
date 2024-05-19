export function createAsyncQueue(maxConcurrency = 32) {
    let currentConcurrency = 0;
    const scheduledTasks: (() => Promise<void>)[] = [];

    function execute(task: () => Promise<void>) {
        currentConcurrency++;
        task().finally(() => {
            currentConcurrency--;
            const nextTask = scheduledTasks.shift();
            if (nextTask) {
                execute(nextTask);
            }
        });
    }

    return {
        push(task: () => Promise<void>) {
            if (currentConcurrency >= maxConcurrency) {
                scheduledTasks.push(task);
                return;
            }

            execute(task);
        },
    };
}
