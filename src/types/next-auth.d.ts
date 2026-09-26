import {
  DefaultSession,
} from "next-auth";

import {
  UserRole,
} from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
      branchId: number;
      branchName: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: UserRole;
    branchId: number;
    branchName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: UserRole;
    branchId: number;
    branchName: string;
  }
}