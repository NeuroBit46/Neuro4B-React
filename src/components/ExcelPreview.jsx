import EEGTable from "@/components/EEGTable";

export default function ExcelPreview({
  file,
  token,
  withCredentials = false,
  title = "Vista previa",
  onLoadEnd,
  onMetaChange,
  preferBackend = false,
  height = 360,
}) {
  const fileUrl = typeof file === "string" ? file : undefined;
  const fileObj = file instanceof File ? file : undefined;

  if (!fileUrl && !fileObj) return <div className="p-4 text-sm text-secondary-text">Sin datos</div>;

  return (
    <EEGTable
      title={title}
      fileUrl={fileUrl}
      file={fileObj}
      token={token}
      withCredentials={withCredentials}
      preferBackend={preferBackend}
      onLoaded={onLoadEnd}
      onMetaChange={onMetaChange}
      showHeader={false}
      height={height}
    />
  );
}
