"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.error(
        "Please enter username and password."
      );

      return;
    }

    setLoading(true);

    try {
      const result = await signIn(
        "credentials",
        {
          username: username.trim(),
          password,
          redirect: false,
        }
      );

      if (!result || result.error) {
        toast.error(
          "Invalid username or password."
        );

        return;
      }

      toast.success(
        "Welcome to Move Pro."
      );

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "LOGIN_ERROR:",
        error
      );

      toast.error(
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-2xl font-bold text-white shadow-lg">
            MP
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Move Pro
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Physiotherapy Clinic Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Sign In
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter your account details to continue.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Move Pro Physiotherapy Clinic
        </p>
      </div>
    </main>
  );
}