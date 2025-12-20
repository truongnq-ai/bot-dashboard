import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phân tích lỗi AI | Tutor Admin Dashboard",
  description: "Phân tích lỗi và failed requests của AI service",
};

export default function ErrorAnalysisPage() {
  return (
    <ComingSoon
      title="Phân tích lỗi AI"
      description="Tính năng phân tích lỗi AI đang được phát triển. Bạn sẽ có thể xem danh sách lỗi, phân loại theo type, và theo dõi patterns để cải thiện chất lượng."
    />
  );
}
