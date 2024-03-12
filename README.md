# Miwi

A simple, normalized UI library for SolidJS so you can build fast and pivot even faster.

## Reactivity Utils

We've baked Antioch's reactivity tools into Miwi. There are four main ones that matter `useProp`, `useFormula`, `doNow`, and `doWatch`.

### `useProp`

Creates a basic, reactive value that can be read by using `myProp.value`, and written to using `myProp.value = newValue`.

```tsx
import { useProp } from "miwi";

function MyComponent() {
  const myProp = useProp(0);

  return (
      {/* Assigning to `myProp.value` will cause the text below to automatically re-render. */}
    <Button onClick={() => myProp.value++}>
      {/* Because we read `myProp.value` this will automatically re-render when myProp changes. */}
      You've pressed the button {myProp.value} times.
    </Button>
  );
}
```

If you're curious, here is the actual source code for `useProp`.

```ts
export function useProp<T>(initValue: T): Prop<T> {
  // We literally wrap a Solid JS signal.
  const [getValue, setValue] = createSignal(initValue);
  // We prefer to the `.value` syntax to Solid's function syntax, hence why we do this.
  return {
    // Reads the value, and triggers a re-render when it changes.
    get value(): T {
      return getValue();
    },
    // Updates the value and notifies all watchers.
    set value(newValue: T) {
      setValue(newValue as any);
    },
  };
}
```

### `useFormula`

Creates a reactive value that is derived from other reactive values and can be accessed via `myFormula.value`. It's like a computed property in Vue or SolidJS.

```tsx
import { useProp, useFormula } from "miwi";

function MyComponent(props: { firstName: string; lastName: string }) {
  const myFormula = useFormula(() => `${props.firstName} ${props.lastName}`);
  // Will re-render if firstName or lastName changes.
  return <Txt>{myFormula.value}</Txt>;
}
```

Can also be be called with a second function to create a read/write formula. Note, the write type is assumed to be the same as the read type, but you can override it if you need to.

```tsx
import { useProp, useFormula } from "miwi";

const myProp = useProp<number | null>(null);
// In this example we use `useFormula` to create a non-null version of `myProp`.
const myFormula = useFormula(
  () => myProp ?? 0,
  // Can be written to.
  (newValue: number) => (myProp.value = newValue),
);
```

If you're curious, here is the actual source code for `useFormula`.

```ts
export function useFormula<GetType, SetType = GetType>(
  get: () => GetType,
  /** Optional setter function */
  set?: ((value: SetType) => any) | undefined,
): ReadonlyProp<GetType> & (typeof set extends undefined ? {} : WriteonlyProp<GetType>) {
  // For getting, `useFormula` just wraps SolidJS's `createMemo`.
  const getMemo = createMemo(get);
  return {
    _isSig: true,
    get value(): GetType {
      return getMemo();
    },
    // The value can't be set on readonly formulas.
    set value(newValue: SetType) {
      set?.(newValue);
    },
  } as any;
}
```

### `doNow`

Just runs the provided function immediately and returns the result. It just helps corral code.

```tsx
// `myNum` will equal 42
const myNum = doNow(() => 42);
```

If you're curious, here is the actual source code for `doNow`.

```ts
export function doNow<T>(func: () => T): T {
  return func();
}
```

### `doWatch`

Runs the provided function immediately and then again whenever any of the reactive values it reads from change.

```tsx
import { useProp, doWatch } from "miwi";
const myProp = useProp(0);

// Immediately logs "myProp: 0"
doWatch(() => {
  console.log("myProp: ", myProp.value);
});

// Logs "myProp: 1" when myProp changes.
myProp.value = 1;
```

You may also provide an `on` option to control exactly which props to watch.

```tsx
import { useProp, doWatch } from "miwi";
const myProp = useProp(0);
const myOtherProp = useProp(0);

// Immediately logs "myProp: 0"
doWatch(
  () => {
    console.log("myProp: ", myProp.value);
  },
  { on: [myProp] },
);

// Logs "myProp: 1" when myProp changes.
myProp.value = 1;

// Does not log anything when myOtherProp changes.
myOtherProp.value = 1;
```

If you're curious, here is the actual source code for `doWatch`.

```ts
export function doWatch(
  func: () => void,
  options?: Partial<{
    on: ReadonlyProp<any>[];
  }>,
) {
  // Just wraps SolidJS's `createEffect`.
  createEffect(
    exists(options?.on)
      ? // Use SolidJS's `on` when requested.
        on(
          options.on.map(dep => () => dep.value),
          func,
        )
      : func,
  );
}
```
