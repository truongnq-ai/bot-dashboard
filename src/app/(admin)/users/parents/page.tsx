import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Phụ huynh | Tutor Admin Dashboard",
  description: "Quản lý danh sách phụ huynh trong hệ thống",
};

export default function ParentsPage() {
  return (
    <ComingSoon
      title="Quản lý Phụ huynh"
      description="Tính năng quản lý phụ huynh đang được phát triển. Bạn sẽ có thể xem danh sách phụ huynh, thông tin liên kết với học sinh, và quản lý tài khoản."
    />
  );
}
