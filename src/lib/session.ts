import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "portfolio_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET is missing. Add a long random value to .env.");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(userId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(token: string) {
  const { payload } = await jwtVerify(token, secret());
  if (!payload.sub || typeof payload.email !== "string") return null;
  return { userId: payload.sub, email: payload.email };
}
