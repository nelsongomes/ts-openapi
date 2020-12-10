import { Body } from "../openapi.types";

export function textPlain(description: string): Body {
  return {
    description,
    content: { "text-plain": {} },
  };
}
