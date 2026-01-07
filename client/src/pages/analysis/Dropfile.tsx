import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  SelectAnalysisResultError,
  SelectAnalysisResultPending,
  sendAnalysisResultFile,
} from "@entities/analysisResult";
import {PDF} from "@shared/ui/Icons/PDF.tsx";

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
    <div className={'p-5 max-w-[800px] ml-auto mr-auto'}>
      <div
        {...getRootProps()}
          className={`rounded border-2 border-gray-400 border-dashed p-8 cursor-grab mb-5 ${isDragActive ? 'bg-gray-10' : 'bg-gray-50'}`}
      >
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
        <input {...getInputProps()} />
        {loading ? (
          <div className={'text-center my-5'}>
            <div>Обработка PDF...</div>
          </div>
        ) : isDragActive ? (
          <p>Перетащите PDF файл сюда...</p>
        ) : (
          <div className={'flex items-center'}>
            <PDF className={'size-10 inline mr-3 text-gray-400'}/>
            <div><p>Перетащите PDF файл сюда или нажмите для выбора</p>
              <p className={'text-sm text-gray-500'}>
                Поддерживаются только PDF файлы (макс. 10MB)
              </p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropFile;
