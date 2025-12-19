import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Accuracy Metrics | Tutor Admin Dashboard",
  description: "Theo dõi độ chính xác của AI service",
};

export default function AccuracyMetricsPage() {
  return (
    <ComingSoon
      title="AI Accuracy Metrics"
      description="Tính năng theo dõi accuracy metrics đang được phát triển. Bạn sẽ có thể xem biểu đồ độ chính xác theo thời gian, phân tích theo skill, và theo dõi xu hướng."
    />
  );
}
