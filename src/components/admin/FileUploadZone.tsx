import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileX } from 'lucide-react';

export interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  acceptedExtensions?: string[];
  maxFileSize?: number;
}

/**
 * Zona de drag-and-drop para upload de arquivos
 *
 * Features:
 * - Drag & drop de múltiplos arquivos
 * - Clique para selecionar
 * - Estados visuais (normal, hover, dragging, error)
 * - Validação de tipos e tamanho
 */
export function FileUploadZone({
  onFilesAdded,
  disabled = false,
  acceptedExtensions,
  maxFileSize,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    disabled,
    multiple: true,
    maxSize: maxFileSize,
    accept: acceptedExtensions
      ? acceptedExtensions.reduce((acc, ext) => {
          acc[`application/${ext.replace('.', '')}`] = [ext];
          acc[`image/${ext.replace('.', '')}`] = [ext];
          return acc;
        }, {} as Record<string, string[]>)
      : undefined,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
        ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}
        ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}
        ${!isDragActive && !isDragReject ? 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        {isDragReject ? (
          <FileX className="w-12 h-12 text-red-500" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        )}

        <div>
          {isDragActive && !isDragReject && (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Solte os arquivos aqui...
            </p>
          )}

          {isDragReject && (
            <p className="text-red-600 dark:text-red-400 font-medium">
              Alguns arquivos não são suportados
            </p>
          )}

          {!isDragActive && (
            <>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Formatos aceitos: Modelos 3D (.blend, .fbx, .obj, etc.), Texturas (.png, .jpg, etc.), Archives (.zip, .rar)
              </p>
              {maxFileSize && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Tamanho máximo por arquivo: {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
            Arquivos rejeitados:
          </p>
          <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors.map((e) => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
