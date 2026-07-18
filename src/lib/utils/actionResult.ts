import { ActionResult } from "../types/ActionResult";

export function success<T>(
  message: string,
  data?: T
): ActionResult<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function failure(
  message: string
): ActionResult {
  return {
    success: false,
    message,
  };
}