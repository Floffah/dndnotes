import { DependencyList, useEffect, useRef } from "react";

// modernised version of https://github.com/n1ru4l/use-async-effect

function* resolve<T>(input: Promise<T>): Generator<Promise<T>, T, T> {
    return yield input;
}

export function useAsyncEffect(
    effect: (context: {
        onCancel: (cleanup: () => void) => void;
        onCancelError: (error: (e: Error) => void) => void;
        resolve: typeof resolve;
        signal: AbortSignal;
    }) => Generator<Promise<unknown>, void | (() => void)>,
    deps: DependencyList = [],
): void {
    const effectRef = useRef(effect);

    useEffect(() => {
        effectRef.current = effect;
    });

    useEffect(() => {
        const abortController = new AbortController();
        let cancelFns: Array<() => void> = [];
        let cancelErrorFns: Array<(error: Error) => void> = [];
        let cleanup: () => void | undefined;

        const generator = effectRef.current({
            onCancel: (cleanup) => {
                cancelFns.push(cleanup);
            },
            onCancelError: (cleanup) => {
                cancelErrorFns.push(cleanup);
            },
            resolve,
            signal: abortController.signal,
        });

        const runEffect = async () => {
            let result: IteratorResult<unknown> = {
                done: false,
                value: undefined,
            };
            let error: Error | undefined;

            do {
                result = error
                    ? generator.throw(error)
                    : generator.next(result.value);
                error = undefined;

                if (result.value) {
                    try {
                        await result.value;
                    } catch (e) {
                        if (abortController.signal.aborted) {
                            cancelErrorFns.forEach((fn) => fn(e as Error));
                            return;
                        }

                        error = e as Error;
                    }
                }

                if (abortController.signal.aborted) {
                    return;
                }
            } while (!result.done);

            if (result.value) {
                cleanup = result.value;
            }
        };

        runEffect();

        return () => {
            cancelFns.forEach((fn) => fn());
            abortController.abort();
            cleanup?.();
        };
    }, deps);
}
