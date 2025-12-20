import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉ số độ chính xác AI | Tutor Admin Dashboard",
  description: "Theo dõi độ chính xác của AI service",
};

export default function AccuracyMetricsPage() {
  return (
    <ComingSoon
      title="Chỉ số độ chính xác AI"
      description="Tính năng theo dõi accuracy metrics đang được phát triển. Bạn sẽ có thể xem biểu đồ độ chính xác theo thời gian, phân tích theo skill, và theo dõi xu hướng."
    />
  );
}
