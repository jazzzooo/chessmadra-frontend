import { clsx } from "~/utils/classes";
import { createRequire } from "module";
import { createEffect, JSX, splitProps } from "solid-js";
import { InputError } from "./forms/InputError";
import { InputLabel } from "./forms/InputLabel";

type TextInputProps = {
  ref: (element: HTMLInputElement | HTMLTextAreaElement) => void;
  type: "text" | "email" | "tel" | "password" | "url" | "number" | "date";
  name: string;
  value: string | number | undefined;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
  placeholder?: string;
  required?: boolean;
  class?: string;
  inputClass?: string;
  label?: string;
  error?: string;
  padding?: "none";
};

type TextAreaProps = {
  ref?: (element: HTMLTextAreaElement) => void;
  name?: string;
  value: string | number | undefined;
  onInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent>;
  onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>;
  placeholder?: string;
  required?: boolean;
  class?: string;
  inputClass?: string;
  label?: string;
  error?: string;
  padding?: "none";
} & Partial<JSX.HTMLAttributes<HTMLTextAreaElement>>;

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, [
    "class",
    "inputClass",
    "value",
    "label",
    "error",
    "padding",
  ]);
  createEffect(() => {
    console.log(`errors, ${props.name}`, props.error);
  });
  return (
    <div class={clsx(!props.padding && "", props.class)}>
      <InputLabel
        name={props.name}
        label={props.label}
        required={props.required}
      />
      <input
        {...inputProps}
        class={clsx(
          "bg-gray-12 md:text-md w-full rounded border-2 p-4 placeholder:text-gray-50",
          props.error
            ? "border-red-600/50 dark:border-red-400/50"
            : "&hover:border-slate-300 dark:&hover:border-slate-700 border-slate-200 focus:border-sky-600/50 dark:border-slate-800 dark:focus:border-sky-400/50",
          props.inputClass
        )}
        id={props.name}
        value={props.value || ""}
        aria-invalid={!!props.error}
        aria-errormessage={`${props.name}-error`}
      />
      <InputError name={props.name} error={props.error} />
    </div>
  );
}

export function TextArea(props: TextAreaProps) {
  const [, inputProps] = splitProps(props, [
    "class",
    "inputClass",
    "value",
    "label",
    "error",
    "padding",
  ]);
  createEffect(() => {
    console.log(`errors, ${props.name}`, props.error);
  });
  return (
    <div class={clsx(!props.padding && "", props.class)}>
      <InputLabel
        name={props.name ?? ""}
        label={props.label}
        required={props.required}
      />
      <textarea
        {...inputProps}
        class={clsx(
          "bg-gray-12 md:text-md w-full rounded border-2 p-4 placeholder:text-gray-50",
          props.error
            ? "border-red-600/50 dark:border-red-400/50"
            : "&hover:border-slate-300 dark:&hover:border-slate-700 border-slate-200 focus:border-sky-600/50 dark:border-slate-800 dark:focus:border-sky-400/50",
          props.inputClass
        )}
        id={props.name}
        value={props.value || ""}
        aria-invalid={!!props.error}
        aria-errormessage={`${props.name}-error`}
      />
      <InputError name={props.name ?? ""} error={props.error} />
    </div>
  );
}
