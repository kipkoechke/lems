/**
 * The message worth showing from a failed request.
 *
 * Laravel answers a rejected form with a generic top line and the real reason
 * underneath:
 *
 *   { "message": "Validation failed.",
 *     "errors": { "email": ["These credentials do not match our records."] } }
 *
 * Showing `message` alone tells the user only that something was invalid, so
 * the field errors are preferred when they exist. Several fields are joined
 * rather than picking one, because a form can fail on more than one at a time
 * and dropping the rest sends the user round the loop again.
 */

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[] | string>;
}

const fieldErrors = (body?: ApiErrorBody): string => {
  if (!body?.errors || typeof body.errors !== "object") return "";

  return Object.values(body.errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((message): message is string => typeof message === "string")
    .join(" ");
};

export const apiErrorMessage = (
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (typeof err !== "object") return fallback;

  const error = err as {
    response?: { data?: ApiErrorBody };
    message?: string;
  };

  const body = error.response?.data;
  const fields = fieldErrors(body);
  if (fields) return fields;
  if (body?.message) return body.message;

  // No response at all — a network failure, or an Error thrown locally.
  if (error.response) return fallback;
  return error.message || fallback;
};
