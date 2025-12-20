import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | Tutor Admin Dashboard",
  description: "Đặt lại mật khẩu cho Tutor Admin Dashboard",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
