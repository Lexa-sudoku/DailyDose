import { errorTranslations } from "@/constants/error-translations";

export function extractErrorMessageString(details: any): string {
  if (!details || typeof details !== "object") return "";

  const messages: string[] = [];

  Object.values(details).forEach((value) => {
    if (Array.isArray(value)) {
      messages.push(...value);
    } else if (typeof value === "string") {
      messages.push(value);
    } else if (typeof value === "object") {
      messages.push(...extractErrorMessageString(value).split("\n"));
    }
  });

  return messages.map(translateError).join(" ");
}

function translateError(message: string): string {
  return errorTranslations[message] || message;
}
