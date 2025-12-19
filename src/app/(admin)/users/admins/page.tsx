import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Admin | Tutor Admin Dashboard",
  description: "Quản lý danh sách admin trong hệ thống",
};

export default function AdminsPage() {
  return (
    <ComingSoon
      title="Quản lý Admin"
      description="Tính năng quản lý admin đang được phát triển. Bạn sẽ có thể xem danh sách admin, phân quyền, và quản lý tài khoản."
    />
  );
}
