export function sourceTransform(code: string, _storyContext: unknown) {
  return code.replace(
    /(<story([^>]+)>|<\/story>| themeName="[a-zA-Z0-9:;.\s()\-,]*")/gi,
    '',
  );
}
