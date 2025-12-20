import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập Admin | Tutor Admin Dashboard",
  description: "Đăng nhập vào Tutor Admin Dashboard",
};

export default function Login() {
  return <SignInForm />;
}
