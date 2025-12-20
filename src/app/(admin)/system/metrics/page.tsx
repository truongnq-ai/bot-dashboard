import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉ số hệ thống | Tutor Admin Dashboard",
  description: "Theo dõi system metrics và performance",
};

export default function MetricsPage() {
  return (
    <ComingSoon
      title="Chỉ số hệ thống"
      description="Tính năng theo dõi system metrics đang được phát triển. Bạn sẽ có thể xem real-time metrics, response time, request rate, và error rate của hệ thống."
    />
  );
}
