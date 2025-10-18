// atlas-workout-system/lib/collections.ts

/**
 * Creates an object that behaves like Python's defaultdict.
 * If a key is accessed that doesn't exist, it's created using the factory function.
 */
export function defaultdict<T>(factory: () => T): { [key: string]: T } {
    return new Proxy({} as { [key: string]: T }, {
        get: (target, name: string) => {
            if (!(name in target)) {
                target[name] = factory();
            }
            return target[name];
        }
    });
}