"use client";
import React, { useState } from "react";
import { toastrError } from "@/components/ui/toaster/toaster";

const FileUpload = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "application/pdf" || file.type.includes("word"))
    ) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      toastrError("Please upload PDF or DOCX only.");
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="file-upload space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Resume Upload (Optional)
      </label>

      {/* Hidden input */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="resumeUpload"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
        >
          Choose File
        </label>
        <input
          id="resumeUpload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileName && (
          <span className="text-sm text-gray-600 truncate max-w-xs">
            📄 {fileName}
          </span>
        )}
      </div>

      {fileName && (
        <p className="text-xs text-green-600 font-medium">
          File uploaded successfully!
        </p>
      )}
    </div>
  );
};

export default FileUpload;
