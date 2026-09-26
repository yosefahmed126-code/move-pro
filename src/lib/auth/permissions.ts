import {
  UserRole,
} from "@prisma/client";

import { requireAuth } from "./requireAuth";

export type Permission =
  | "patients:view"
  | "patients:create"
  | "patients:update"
  | "patients:delete"
  | "packages:view"
  | "packages:create"
  | "schedule:view"
  | "appointments:create"
  | "appointments:update"
  | "therapists:view"
  | "therapists:manage"
  | "branches:view"
  | "branches:manage"
  | "payments:view"
  | "payments:manage"
  | "reports:view"
  | "settings:view"
  | "users:manage";

const permissions: Record<
  UserRole,
  Permission[]
> = {
  SUPER_ADMIN: [
    "patients:view",
    "patients:create",
    "patients:update",
    "patients:delete",

    "packages:view",
    "packages:create",

    "schedule:view",

    "appointments:create",
    "appointments:update",

    "therapists:view",
    "therapists:manage",

    "branches:view",
    "branches:manage",

    "payments:view",
    "payments:manage",

    "reports:view",

    "settings:view",
    "users:manage",
  ],

  BRANCH_MANAGER: [
    "patients:view",
    "patients:create",
    "patients:update",

    "packages:view",
    "packages:create",

    "schedule:view",

    "appointments:create",
    "appointments:update",

    "therapists:view",

    "payments:view",
    "payments:manage",

    "reports:view",
  ],

  RECEPTIONIST: [
    "patients:view",
    "patients:create",
    "patients:update",

    "packages:view",
    "packages:create",

    "schedule:view",

    "appointments:create",
    "appointments:update",

    "therapists:view",
  ],

  THERAPIST: [
    "patients:view",
    "schedule:view",
  ],

  ACCOUNTANT: [
    "patients:view",
    "payments:view",
    "payments:manage",
    "reports:view",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
) {
  return permissions[
    role
  ].includes(permission);
}

export async function requirePermission(
  permission: Permission
) {
  const user = await requireAuth();

  if (
    !hasPermission(
      user.role,
      permission
    )
  ) {
    throw new Error("FORBIDDEN");
  }

  return user;
}