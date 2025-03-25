export async function foldAttempts<Result, FuncArg, FuncError = any>(
    attempt: (arg: FuncArg) => Promise<Result>,
    retry: (previousArg: FuncArg, previousError: FuncError) => FuncArg | Promise<FuncArg>,
    initialArg: FuncArg
) {
    let arg = initialArg;

    while (true) {
        try {
            return await attempt(arg);
        } catch (error) {
            const newArg = retry(arg, error);
            arg = (newArg instanceof Promise) ? await newArg : newArg;
        }
    }
}
