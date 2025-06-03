import { useRef, useEffect, useMemo } from "react";
import { debounce } from "lodash";

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
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
