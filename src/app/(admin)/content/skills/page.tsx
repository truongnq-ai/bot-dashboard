import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Skills | Tutor Admin Dashboard",
  description: "Quản lý skill graph và learning content",
};

export default function SkillsPage() {
  return (
    <ComingSoon
      title="Quản lý Skills"
      description="Tính năng quản lý skills đang được phát triển. Bạn sẽ có thể xem skill graph, chỉnh sửa skills, và quản lý prerequisites."
    />
  );
}
