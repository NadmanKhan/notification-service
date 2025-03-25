export async function foldRetries<Result, FuncArg, FuncError = any>(
    func: (arg: FuncArg) => Promise<Result>,
    errorCallback: (previousArg: FuncArg, previousError: FuncError) => FuncArg | Promise<FuncArg>,
    initialArg: FuncArg
) {
    let arg = initialArg;

    while (true) {
        try {
            return await func(arg);
        } catch (error) {
            const newArg = errorCallback(arg, error);
            arg = (newArg instanceof Promise) ? await newArg : newArg;
        }
    }
}
