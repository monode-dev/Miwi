/** @About Ensures that the given value is not null or undefined. */
const exists = <T>(x: T): x is NonNullable<T> => x !== undefined && x !== null;

/** @About Type casts all the props of the given object as read-only. */
const readonlyObj = <T>(obj: T): Readonly<T> => obj;

type Callable<C extends { call: Function }> = C[`call`] & Omit<C, `call`>;

/** @About TypeScript doesn't have an easy way to create callable objects with props.
 * This constructs one by converting the "call" prop to the callable function. */
const callable = function <C extends { call: Function }>(obj: C): Callable<C> {
  const func: any = obj.call;
  for (const key in obj) {
    if (key != `call`) func[key] = (obj as any)[key];
  }
  return func;
};

type OneOrMore<P extends VarPerms, T> = T | VarOrLit<P, T[]>;

type OmitToNever<T, Keys extends string | symbol | number> = Omit<T, Keys> & {
  [key in Keys]: never;
};

type Values<T> = T[keyof T];
