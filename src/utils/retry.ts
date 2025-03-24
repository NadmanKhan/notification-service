export async function foldRetries<Result, FuncArgType, FuncErrorType = any>(
    func: (arg: FuncArgType) => Promise<Result>,
    errorCallback: (previousArg: FuncArgType, previousError: FuncErrorType) => FuncArgType | Promise<FuncArgType>,
    initialArg: FuncArgType
) {
    let arg = initialArg;
    while (true) {
        try {
            return await func(arg);
        } catch (error) {
            try {
                arg = await errorCallback(arg, error);
            } catch (finalError) {
                throw finalError;
            }
        }
    }
}
