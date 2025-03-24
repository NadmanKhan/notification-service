export class ExponentialBackoff {
    private firstDelayTime: number;
    private delayTimeMultiplier: number;
    private maxAttemptCount: number;
    private maxJitter: number;

    private currentAttemptCount: number;
    private currentDelayTime: number;
    private currentJitter: number;

    constructor({
        firstDelayTime,
        delayTimeMultiplier,
        maxAttemptCount,
        maxJitter = 0,
    }: {
        firstDelayTime: number;
        delayTimeMultiplier: number;
        maxAttemptCount: number;
        maxJitter?: number;
    }) {
        this.firstDelayTime = firstDelayTime;
        this.delayTimeMultiplier = delayTimeMultiplier;
        this.maxAttemptCount = maxAttemptCount;
        this.maxJitter = maxJitter;

        this.currentAttemptCount = 0;
        this.currentDelayTime = firstDelayTime;
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
        return new Promise(resolve => setTimeout(resolve, delayTime));
    }

    private next() {
        if (this.currentAttemptCount >= this.maxAttemptCount) {
            return { done: true, value: undefined };
        }

        const delayTime = this.currentDelayTime + this.currentJitter;

        this.currentDelayTime *= this.delayTimeMultiplier;
        this.currentJitter = this.maxJitter * (Math.random() - 0.5);
        this.currentAttemptCount += 1;

        return { done: false, value: delayTime };
    }

    get done() {
        return this.currentAttemptCount >= this.maxAttemptCount;
    }
}
