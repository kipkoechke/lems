"use client";

import { useCallback, useState } from "react";

/**
 * Separates the text being typed from the term actually applied to a query.
 *
 * Wiring an input straight to a query key fires a request per keystroke. Here
 * the term only changes on submit (button or Enter), or when the box is
 * emptied — emptying restores the unfiltered list immediately, so the user is
 * never stranded in a filtered state having deleted their text.
 */
export const useSearchControl = (onApply?: () => void) => {
  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");

  const apply = useCallback(
    (next: string) => {
      setTerm(next);
      onApply?.();
    },
    [onApply],
  );

  const onInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (value === "") apply("");
    },
    [apply],
  );

  const submit = useCallback(() => apply(input.trim()), [apply, input]);

  const clear = useCallback(() => {
    setInput("");
    apply("");
  }, [apply]);

  return {
    /** Bind to the input's value. */
    input,
    onInputChange,
    /** The applied term — use this in query params and filters. */
    term,
    submit,
    clear,
    isSearching: term !== "",
  };
};
