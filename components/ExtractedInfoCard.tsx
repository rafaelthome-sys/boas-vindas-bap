"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface ExtractedInfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ExtractedInfoCard({ title, children, className }: ExtractedInfoCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <CheckCircle className="w-4 h-4 text-green-500" />
        {title}
      </div>
      <div className="pl-6 space-y-1 text-sm text-gray-600">{children}</div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string | number | undefined | null;
}

export function InfoItem({ label, value }: InfoItemProps) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex gap-2">
      <span className="text-gray-400 min-w-fit">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}

interface InfoListProps {
  items: string[];
  emptyMessage?: string;
}

export function InfoList({ items, emptyMessage = "Nenhum item" }: InfoListProps) {
  if (!items || items.length === 0) {
    return <span className="text-gray-400 text-xs">{emptyMessage}</span>;
  }

  return (
    <ul className="list-disc list-inside space-y-0.5">
      {items.map((item, index) => (
        <li key={index} className="text-gray-600">
          {item}
        </li>
      ))}
    </ul>
  );
}
