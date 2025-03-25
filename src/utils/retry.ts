export async function foldRetries<Result, FuncArgType, FuncErrorType = any>(
    func: (arg: FuncArgType) => Promise<Result>,
    errorCallback: (
        previousArg: FuncArgType,
        previousError: FuncErrorType,
        fail: () => void,
    ) => (FuncArgType | void) | Promise<FuncArgType | void>,
    initialArg: FuncArgType
) {
    let arg = initialArg;
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
