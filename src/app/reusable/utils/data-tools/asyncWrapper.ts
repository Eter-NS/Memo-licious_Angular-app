type AsyncFunction<T> = () => Promise<T>;
type AsyncResultWrapper<T> = Promise<
  { data: T; error: undefined } | { data: undefined; error: unknown }
>;

export async function asyncWrapper<T>(
  asyncFunction: AsyncFunction<T>
): AsyncResultWrapper<T> {
  try {
    const result = await asyncFunction();
    return { data: result, error: undefined };
  } catch (error) {
    return { data: undefined, error: error };
  }
}
