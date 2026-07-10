import { redirect } from "next/navigation";

// Passwordless sign-in and sign-up are the same flow: a first-time email or
// phone is registered automatically on verification. Send everyone to sign-in.
export default function SignUpPage() {
  redirect("/auth/sign-in");
}
