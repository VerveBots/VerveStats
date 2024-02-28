export default function replacePrefixes(
  text: string,
  prefixes: Record<string, string>
) {
  Object.keys(prefixes).forEach((key) => {
    text = text.replaceAll(key, prefixes[key]);
  });
  return text;
}
