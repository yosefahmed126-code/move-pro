"use client";

import {
  Bell,
  Search,
  Moon,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react";

import {
  signOut,
  useSession,
} from "next-auth/react";

import { useState } from "react";

function formatRole(role?: string) {
  if (!role) return "";

  return role
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function Navbar() {
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const user = session?.user;

  const fullName =
    user?.name ?? "User";

  const initial =
    fullName.charAt(0).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="h-16 shrink-0 border-b bg-white px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search patients..."
          className="w-full rounded-lg border pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="relative"
        >
          <Bell className="text-gray-600" />

          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>

        <button type="button">
          <Moon className="text-gray-600" />
        </button>

        {/* User */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-50"
          >
            <div className="text-right">
              <h3 className="font-semibold text-slate-900">
                {fullName}
              </h3>

              <p className="text-xs text-gray-500">
                {formatRole(user?.role)}
              </p>
            </div>

            <div className="w-11 h-11 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
              {initial}
            </div>

            <ChevronDown
              size={16}
              className="text-slate-400"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg">
              <div className="border-b p-4">
                <p className="font-semibold text-slate-900">
                  {fullName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  @{user?.username}
                </p>
              </div>

              <div className="border-b p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 size={16} />

                  <span>
                    {user?.branchName ??
                      "No Branch"}
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-cyan-600">
                  {formatRole(user?.role)}
                </p>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={17} />

                  {loggingOut
                    ? "Signing out..."
                    : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}