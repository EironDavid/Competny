import { Badge } from "@/components/ui/badge";

interface ApplicationStatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

export default function ApplicationStatusBadge({ status, className = "" }: ApplicationStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ${className}`}>
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className={`bg-green-100 text-green-800 hover:bg-green-200 ${className}`}>
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className={`bg-red-100 text-red-800 hover:bg-red-200 ${className}`}>
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}
