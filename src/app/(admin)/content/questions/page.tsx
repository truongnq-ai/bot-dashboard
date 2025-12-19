import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Questions | Tutor Admin Dashboard",
  description: "Quản lý questions và practice items",
};

export default function QuestionsPage() {
  return (
    <ComingSoon
      title="Quản lý Questions"
      description="Tính năng quản lý questions đang được phát triển. Bạn sẽ có thể xem danh sách questions, tạo mới, chỉnh sửa, và phê duyệt nội dung."
    />
  );
}
