/**
 * POST /api/bug-report: turns an uploaded screenshot into a bug report.
 * Accepts multipart/form-data with `image` and optional `notes`, `repoUrl`,
 * `language` and `model`.
 * Exports: POST.
 * Depends on: @/lib/config/env, @/lib/http/*, @/lib/services/bug-report-service,
 *   @/schemas/requests.
 */
import { getEnv } from "@/lib/config/env";
import { ApiError } from "@/lib/http/api-error";
import { parseMultipartBody, validationError, withRoute } from "@/lib/http/route-helpers";
import { createBugReport } from "@/lib/services/bug-report-service";
import { REQUEST_LIMITS, bugReportFieldsSchema } from "@/schemas/requests";

const textField = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : undefined;
};

export const POST = withRoute("bug-report", async (request) => {
  const maxBytes = getEnv().MAX_IMAGE_MB * 1024 * 1024 + REQUEST_LIMITS.multipartOverheadBytes;
  const form = await parseMultipartBody(request, maxBytes);

  const image = form.get("image");
  if (!(image instanceof File)) {
    throw new ApiError("IMAGE_INVALID", { safeMessage: "Attach a screenshot to continue." });
  }

  const fields = bugReportFieldsSchema.safeParse({
    notes: textField(form, "notes"),
    repoUrl: textField(form, "repoUrl"),
    language: textField(form, "language"),
    model: textField(form, "model"),
  });
  if (!fields.success) throw validationError(fields.error);

  return createBugReport({
    fields: fields.data,
    imageBytes: new Uint8Array(await image.arrayBuffer()),
    declaredMimeType: image.type,
  });
});
