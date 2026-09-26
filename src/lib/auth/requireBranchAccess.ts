import {
  UserRole,
} from "@prisma/client";

import { requireAuth } from "./requireAuth";

export async function requireBranchAccess(
  branchId: number
) {
  const user = await requireAuth();

  if (
    !Number.isInteger(branchId) ||
    branchId <= 0
  ) {
    throw new Error("INVALID_BRANCH");
  }

  if (
    user.role ===
    UserRole.SUPER_ADMIN
  ) {
    return user;
  }

  if (
    user.branchId !== branchId
  ) {
    throw new Error("FORBIDDEN_BRANCH");
  }

  return user;
}