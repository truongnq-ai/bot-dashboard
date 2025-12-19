import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Tutor Admin Dashboard",
  description: "Reset password for Tutor Admin Dashboard",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
