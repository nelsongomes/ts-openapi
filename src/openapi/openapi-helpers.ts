export function textPlain(description: string) {
  return {
    content: {
      "text/plain": {
        schema: {
          type: "string",
        },
      },
    },
    description,
  };
}
