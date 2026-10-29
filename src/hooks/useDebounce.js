import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a rapidly changing value (e.g. search input).
 * Debounces by approximately 350ms (within 300-400ms) to prevent sending API
 * requests on every keystroke.
 *
 * @template T
 * @param {T} value - The input value to debounce.
 * @param {number} [delay=350] - Debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
