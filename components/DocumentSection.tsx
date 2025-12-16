"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DocumentDropzone } from "./DocumentDropzone";
import { UploadedFile } from "@/types";
import {
  FileText,
  ClipboardList,
  Wallet,
  FileCheck,
  Users,
  Scale,
  FolderOpen,
} from "lucide-react";

interface DocumentSectionProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  extractedPreview?: ReactNode;
  isProcessing?: boolean;
}

const iconMap: Record<string, typeof FileText> = {
  convencao: FileText,
  atas: ClipboardList,
  financeiro: Wallet,
  certidoes: FileCheck,
  departamentoPessoal: Users,
  juridico: Scale,
  outros: FolderOpen,
};

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
  gray: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" },
};

export function DocumentSection({
  id,
  title,
  description,
  icon,
  color,
  files,
  onFilesAdded,
  onFileRemove,
  extractedPreview,
  isProcessing = false,
}: DocumentSectionProps) {
  const IconComponent = iconMap[id] || FileText;
  const colors = colorMap[color] || colorMap.blue;

  const hasExtractedData = files.some((f) => f.status === "completed" && f.extractedData);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-sm transition-all duration-200",
        hasExtractedData ? colors.border : "border-gray-200"
      )}
    >
      <div className={cn("px-4 py-3 border-b", colors.bg, colors.border)}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <IconComponent className={cn("w-5 h-5", colors.text)} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <DocumentDropzone
          files={files}
          onFilesAdded={onFilesAdded}
          onFileRemove={onFileRemove}
          accentColor={color}
          disabled={isProcessing}
        />

        {extractedPreview && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {extractedPreview}
          </div>
        )}
      </div>
    </div>
  );
}
