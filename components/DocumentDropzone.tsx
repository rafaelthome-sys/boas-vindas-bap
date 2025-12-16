"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { UploadedFile } from "@/types";

interface DocumentDropzoneProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  accentColor: string;
  disabled?: boolean;
}

export function DocumentDropzone({
  files,
  onFilesAdded,
  onFileRemove,
  accentColor,
  disabled = false,
}: DocumentDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!disabled) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    disabled,
  });

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-bap-primary bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            "w-8 h-8 mx-auto mb-2",
            isDragActive ? "text-bap-primary" : "text-gray-400"
          )}
        />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Solte os arquivos aqui..."
            : "Arraste arquivos ou clique para selecionar"}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX ou imagens</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-gray-50 border",
                file.status === "error" ? "border-red-200" : "border-gray-100"
              )}
            >
              {getStatusIcon(file.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                  {file.error && (
                    <span className="text-red-500 ml-2">{file.error}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => onFileRemove(file.id)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                disabled={file.status === "processing"}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
