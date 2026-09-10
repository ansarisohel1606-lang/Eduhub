const sensitiveKeys = new Set([
  "password",
  "refreshTokenHash",
  "deliveryOtpHash",
  "rawResponse",
  "providerSignature",
  "refreshToken",
  "accessToken",
  "token",
  "otp",
  "resetToken",
  "idToken",
  "authorization",
  "cookie",
]);

export function safeData(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(safeData);
  if (value instanceof Date) return value;
  if (typeof value !== "object") return value;

  const plain = typeof value.toJSON === "function" ? value.toJSON() : value;
  return Object.entries(plain).reduce<Record<string, any>>(
    (result, [key, child]) => {
      if (
        !sensitiveKeys.has(key) &&
        !/(password|secret|token|authorization|cookie|otp)/i.test(key)
      )
        result[key] = safeData(child);
      return result;
    },
    {},
  );
}
