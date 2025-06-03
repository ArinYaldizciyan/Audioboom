import { useRef, useEffect, useMemo } from "react";
import { debounce, DebouncedFunc } from "lodash";

export function useDebounce<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  delay: number = 200
): DebouncedFunc<(...args: Args) => void> {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useMemo(
    () =>
      debounce((...args: Args) => {
        fnRef.current(...args);
      }, delay),
    [delay]
  );

  // clean up on unmount
  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}

// export const useDebounce = (callback: () => void) => {
//   const ref = useRef<any>("");

//   useEffect(() => {
//     ref.current = callback;
//   }, [callback]);

//   const debouncedCallback = useMemo(() => {
//     const func = () => {
//       ref.current?.();
//     };

//     return debounce(func, 200);
//   }, []);

//   return debouncedCallback;
// };
