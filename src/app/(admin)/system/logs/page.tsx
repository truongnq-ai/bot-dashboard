import ComingSoon from "@/components/common/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Logs | Tutor Admin Dashboard",
  description: "Xem và quản lý system logs",
};

export default function LogsPage() {
  return (
    <ComingSoon
      title="System Logs"
      description="Tính năng xem system logs đang được phát triển. Bạn sẽ có thể xem logs theo level, filter theo service, search, và export logs."
    />
  );
}
