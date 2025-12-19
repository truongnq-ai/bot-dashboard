import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Học sinh | Tutor Admin Dashboard",
  description: "Quản lý danh sách học sinh trong hệ thống",
};

export default function StudentsPage() {
  return (
    <ComingSoon
      title="Quản lý Học sinh"
      description="Tính năng quản lý học sinh đang được phát triển. Bạn sẽ có thể xem danh sách học sinh, thông tin chi tiết, và quản lý trạng thái tài khoản."
    />
  );
}
