import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Tutor Admin Dashboard",
  description: "Login to Tutor Admin Dashboard",
};

export default function Login() {
  return <SignInForm />;
}
