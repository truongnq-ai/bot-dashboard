import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sức khỏe hệ thống | Tutor Admin Dashboard",
  description: "Kiểm tra health status của các services",
};

export default function HealthPage() {
  return (
    <ComingSoon
      title="Sức khỏe hệ thống"
      description="Tính năng kiểm tra system health đang được phát triển. Bạn sẽ có thể xem trạng thái của Core Service, AI Service, Database, và Object Storage."
    />
  );
}
