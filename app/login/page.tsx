import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to ScholarMind and continue your research.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
