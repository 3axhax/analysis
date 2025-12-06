import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  SelectAnalysisResultError,
  SelectAnalysisResultPending,
  sendAnalysisResultFile,
} from "@entities/analysisResult";

export const DropFile = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(SelectAnalysisResultPending);
  const error = useAppSelector(SelectAnalysisResultError);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    dispatch(sendAnalysisResultFile(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #cccccc",
          borderRadius: "4px",
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive ? "#f0f8ff" : "#fafafa",
          marginBottom: "20px",
        }}
      >
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
        <input {...getInputProps()} />
        {loading ? (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <div>Обработка PDF...</div>
          </div>
        ) : isDragActive ? (
          <p>Перетащите PDF файл сюда...</p>
        ) : (
          <div>
            <p>Перетащите PDF файл сюда или нажмите для выбора</p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              Поддерживаются только PDF файлы (макс. 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropFile;
