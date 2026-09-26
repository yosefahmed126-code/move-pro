import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function requireAuth() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = Number(
    session.user.id
  );

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: userId,

    name:
      session.user.name ?? "User",

    username:
      session.user.username,

    role:
      session.user.role,

    branchId:
      session.user.branchId,

    branchName:
      session.user.branchName,
  };
}