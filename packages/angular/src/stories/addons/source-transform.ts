export function sourceTransform(code: string, storyContext: any) {
  return code.replace(
    /(<story([^>]+)>|<\/story>| themeName="[a-zA-Z0-9:;.\s()\-,]*")/gi,
    '',
  );
}
