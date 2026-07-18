export const acceptableFile = (
  file: File,
  acceptedFileExtensions: string[] | undefined
): boolean => {
  if (!acceptedFileExtensions || acceptedFileExtensions.length < 1) return true;
  return acceptedFileExtensions.includes(getFileExtension(file));
};

export const getFileExtension = (file: File): string => '.' + file.name.split('.').pop();
