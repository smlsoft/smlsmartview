import type { SessionOptions } from "iron-session";

export type Branch = {
  db_code: string;
  db_name: string;
};

export type SessionData = {
  provider_code: string;
  user_code: string;
  user_name: string;
  db_code: string;
  db_name: string;
  isLoggedIn: boolean;
  branches?: Branch[];
};

export const emptySession: SessionData = {
  provider_code: "",
  user_code: "",
  user_name: "",
  db_code: "",
  db_name: "",
  isLoggedIn: false
};

const secret = process.env.SESSION_SECRET;
if ((!secret || secret.length < 32) && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set and at least 32 chars long");
}

export const sessionOptions: SessionOptions = {
  password: secret ?? "dev-only-insecure-secret-change-me-please-32+",
  cookieName: "sml_mis_ai_session",
  ttl: 60 * 60 * 8,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/"
  }
};
