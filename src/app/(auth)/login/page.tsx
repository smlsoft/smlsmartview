import LoginClient from "./login-client";

export default function LoginPage() {
  const defaultProviderCode = process.env.LOGIN_DEFAULT_PROVIDER_CODE ?? "";
  const preferredDbCode = process.env.LOGIN_PREFERRED_DB_CODE ?? "";

  return (
    <LoginClient
      defaultProviderCode={defaultProviderCode}
      preferredDbCode={preferredDbCode}
    />
  );
}
