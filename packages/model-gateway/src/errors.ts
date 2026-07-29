export type ModelGatewayErrorCode =
  | "provider_not_configured"
  | "provider_unavailable"
  | "authentication_failed"
  | "model_not_found"
  | "unsupported_capability"
  | "rate_limited"
  | "invalid_request"
  | "invalid_response"
  | "context_limit"
  | "generation_failed";

export class ModelGatewayError extends Error {
  readonly code: ModelGatewayErrorCode;
  readonly providerId?: string;
  readonly status?: number;

  constructor(
    code: ModelGatewayErrorCode,
    message: string,
    options: { providerId?: string; status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ModelGatewayError";
    this.code = code;
    this.providerId = options.providerId;
    this.status = options.status;
  }
}
