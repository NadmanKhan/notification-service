export async function foldRetries<Result, FuncArg, FuncError = any>(
    func: (arg: FuncArg) => Promise<Result>,
    errorCallback: (
        previousArg: FuncArg,
        previousError: FuncError,
        fail: () => void,
    ) => (FuncArg | void) | Promise<FuncArg | void>,
    initialArg: FuncArg
) {
    let arg: FuncArg = initialArg;
    let done: boolean = false;
    const fail = () => { done = true; };

    while (!done) {
        try {
            return await func(arg);
        } catch (error) {
            const newArg = await errorCallback(arg, error, fail);
            if (newArg === undefined) {
                return;
            }
            arg = newArg;
        }
    }
}
