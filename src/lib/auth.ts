import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import {
  UserStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const username =
          credentials?.username?.trim();

        const password =
          credentials?.password;

        if (!username || !password) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              username,
            },

            select: {
              id: true,
              fullName: true,
              username: true,
              passwordHash: true,
              status: true,
              role: true,
              branchId: true,

              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

        if (!user) {
          return null;
        }

        if (
          user.status !==
          UserStatus.ACTIVE
        ) {
          return null;
        }

        const passwordMatches =
          await bcrypt.compare(
            password,
            user.passwordHash
          );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: String(user.id),

          name: user.fullName,

          username: user.username,

          role: user.role,

          branchId: user.branchId,

          branchName:
            user.branch.name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.id = user.id;

        token.username =
          user.username;

        token.role =
          user.role;

        token.branchId =
          user.branchId;

        token.branchName =
          user.branchName;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          token.id as string;

        session.user.username =
          token.username as string;

        session.user.role =
          token.role;

        session.user.branchId =
          token.branchId as number;

        session.user.branchName =
          token.branchName as string;
      }

      return session;
    },
  },
};