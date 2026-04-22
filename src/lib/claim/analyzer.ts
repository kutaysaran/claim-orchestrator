import { z } from "zod";

export const allowedDocumentTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const analyzerInputSchema = z.object({
  name: z.string().min(1, "Please select a file."),
  type: z.string(),
  size: z
    .number()
    .max(5 * 1024 * 1024, "The file must be smaller than 5 MB for this mock flow."),
});

const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"] as const;

type DocumentRule = {
  keywords: string[];
  aliases?: string[];
};

const documentRules: Record<string, DocumentRule> = {
  "Occupational Certificate": {
    keywords: ["occupational", "certificate"],
    aliases: ["employment", "occupation", "work", "employee"],
  },
};

export type AnalyzerStatus = "idle" | "selected" | "loading" | "success" | "error";

export type AnalyzerState = {
  targetDocument: string | null;
  selectedFileName: string | null;
  status: AnalyzerStatus;
  message: string;
  suggestedNextAction: string | null;
  linkedAttachmentId: string | null;
};

export type AnalyzerInput = z.infer<typeof analyzerInputSchema>;

export const defaultAnalyzerState: AnalyzerState = {
  targetDocument: null,
  selectedFileName: null,
  status: "idle",
  message: "Upload the occupational certificate to simulate AI validation.",
  suggestedNextAction: null,
  linkedAttachmentId: null,
};

export function getAnalyzerTargetLabel(targetDocument: string | null) {
  return targetDocument ?? "Occupational Certificate";
}

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getFileExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  const matchedExtension = allowedExtensions.find((extension) => normalized.endsWith(extension));

  return matchedExtension ?? null;
}

function isSupportedDocumentType(input: AnalyzerInput) {
  const hasAllowedMimeType = allowedDocumentTypes.includes(
    input.type as (typeof allowedDocumentTypes)[number],
  );
  const hasAllowedExtension = getFileExtension(input.name) !== null;

  return hasAllowedMimeType || hasAllowedExtension;
}

function getDocumentRule(targetDocument: string | null): DocumentRule {
  return (
    (targetDocument ? documentRules[targetDocument] : null) ?? {
      keywords: normalizeValue(getAnalyzerTargetLabel(targetDocument)).split(" ").filter(Boolean),
    }
  );
}

function evaluateDocumentName(fileName: string, targetDocument: string | null) {
  const normalizedName = normalizeValue(fileName);
  const normalizedTarget = normalizeValue(getAnalyzerTargetLabel(targetDocument));
  const rule = getDocumentRule(targetDocument);
  const matchedKeywords = rule.keywords.filter((keyword) => normalizedName.includes(keyword));
  const matchedAliases = (rule.aliases ?? []).filter((alias) => normalizedName.includes(alias));
  const strongKeywordMatch = matchedKeywords.length >= Math.min(2, rule.keywords.length);
  const exactTargetMatch = normalizedName.includes(normalizedTarget);
  const partialMatch = matchedKeywords.length > 0 || matchedAliases.length > 0;

  return {
    exactTargetMatch,
    matchedKeywords,
    matchedAliases,
    strongKeywordMatch,
    partialMatch,
  };
}

export function analyzeMockDocument(input: AnalyzerInput, targetDocument: string | null) {
  const validation = analyzerInputSchema.safeParse(input);
  const targetLabel = getAnalyzerTargetLabel(targetDocument);

  if (!validation.success) {
    return {
      status: "error" as const,
      message: validation.error.issues[0]?.message ?? "The file is not valid.",
      suggestedNextAction: `Upload a valid ${targetLabel} file to continue the review.`,
    };
  }

  if (!isSupportedDocumentType(input)) {
    return {
      status: "error" as const,
      message: "Upload a PDF or image file.",
      suggestedNextAction: `Choose a PDF or image version of the ${targetLabel}.`,
    };
  }

  const nameEvaluation = evaluateDocumentName(input.name, targetDocument);

  if (nameEvaluation.exactTargetMatch || nameEvaluation.strongKeywordMatch) {
    return {
      status: "success" as const,
      message: `Simulated AI validation passed. The ${targetLabel} looks readable and aligned with the requested document.`,
      suggestedNextAction:
        "Attach the validated file to the claim timeline so the file review team can continue.",
    };
  }

  if (nameEvaluation.partialMatch) {
    return {
      status: "error" as const,
      message: `The file format looks valid, but the filename only partially matches the requested ${targetLabel}. Add clearer document wording before submission.`,
      suggestedNextAction: `Rename or replace the file so the reviewer can clearly identify the ${targetLabel}.`,
    };
  }

  return {
    status: "error" as const,
    message: `The file looks readable, but it does not appear to be the requested ${targetLabel}.`,
    suggestedNextAction: `Upload the exact ${targetLabel} document or rename the file more clearly.`,
  };
}
