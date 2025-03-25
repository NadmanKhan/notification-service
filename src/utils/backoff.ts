export class ExponentialBackoff {
    private firstDelayTime: number;
    private delayTimeMultiplier: number;
    private maxRetryCount: number;
    private maxJitter: number;

    private currentRetryCount: number;
    private currentDelayTime: number;
    private currentJitter: number;

    constructor({
        firstDelayTime,
        delayTimeMultiplier,
        maxRetryCount: maxRetryCount,
        maxJitter = 0,
    }: {
        firstDelayTime: number;
        delayTimeMultiplier: number;
        maxRetryCount: number;
        maxJitter?: number;
    }) {
        this.firstDelayTime = firstDelayTime;
        this.delayTimeMultiplier = delayTimeMultiplier;
        this.maxRetryCount = maxRetryCount;
        this.maxJitter = maxJitter;

        this.currentRetryCount = 0;
        this.currentDelayTime = this.firstDelayTime;
        this.currentJitter = this.maxJitter * (Math.random() - 0.5);

        if (this.maxJitter < 0 || this.maxJitter >= 1) {
            throw new Error("Jitter must be in the range [0, 1)");
        }
    }

    async delay() {
        const delayTime = this.next().value;
        if (delayTime === undefined) {
            throw new Error("Backoff is done");
        }
        await new Promise(resolve => setTimeout(resolve, delayTime));
    }

    private next() {
        if (this.currentRetryCount >= this.maxRetryCount) {
            return { done: true, value: undefined };
        }

        const delayTime = this.currentDelayTime + this.currentJitter;

        this.currentDelayTime *= this.delayTimeMultiplier;
        this.currentJitter = this.maxJitter * (Math.random() - 0.5);
        this.currentRetryCount += 1;

        return { done: false, value: delayTime };
    }

    get done() {
        return this.currentRetryCount >= this.maxRetryCount;
    }
}
