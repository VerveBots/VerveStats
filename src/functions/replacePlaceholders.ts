export default function replacePlaceholders(
  text: string,
  placeholders: Record<string, string>
) {
  Object.keys(placeholders).forEach((key) => {
    text = text.replaceAll(key, placeholders[key]);
  });
  return text;
}
