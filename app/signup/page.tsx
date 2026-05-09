import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your ScholarMind account and start synthesizing research.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
