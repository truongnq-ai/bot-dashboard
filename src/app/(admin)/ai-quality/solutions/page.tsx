import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review AI Solutions | Tutor Admin Dashboard",
  description: "Kiểm tra và phê duyệt lời giải AI",
};

export default function SolutionsReviewPage() {
  return (
    <ComingSoon
      title="Review AI Solutions"
      description="Tính năng review AI solutions đang được phát triển. Bạn sẽ có thể xem danh sách lời giải AI, kiểm tra độ chính xác, và phê duyệt hoặc từ chối."
    />
  );
}
