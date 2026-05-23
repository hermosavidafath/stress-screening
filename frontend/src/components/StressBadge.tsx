import clsx from "clsx";
import { TingkatStres } from "@/lib/types";

interface Props {
  tingkat?: TingkatStres | null;
  size?: "sm" | "md" | "lg";
}

export default function StressBadge({ tingkat, size = "md" }: Props) {
  if (!tingkat) return <span className="badge-rendah">-</span>;

  const colorMap: Record<string, string> = {
    green: "badge-rendah",
    yellow: "badge-sedang",
    red: "badge-tinggi",
  };

  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        colorMap[tingkat.warna] || "badge-rendah",
        sizeMap[size]
      )}
    >
      {tingkat.nama}
    </span>
  );
}
