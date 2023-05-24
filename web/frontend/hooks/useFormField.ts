import { useState } from "react";

export function useFormField<T extends unknown>(initialValue: T) {
  const [value, setValue] = useState(<T | string>initialValue);
  const onChange = (newValue: T | string) => setValue(newValue);
  return { value, onChange };
}
