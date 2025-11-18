import React, { useState, useRef, useEffect } from 'react';
import ButtonBase from './ButtonBase';
import DropzoneField from './DropzoneFile';
import { Icons } from '../constants/Icons';
// import { WorkerInput } from './WorkerInput';
import ArchivoPreviewModal from './ArchivoPreviewModal';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from './ui/card';
import { useLoadingBar } from "@/components/LoadingBar";
import { Progress } from "./ui/progress";
import ButtonWithProgress from './ButtonWithProgress';

export default function WorkerForm({
  mode = 'crear',
  initialData = {},
  onSubmit,
  hideEmptyInView = false,
  emptyPlaceholder = 'Sin dato',
  emptyLabels = {},
}) {
  const isView = mode === 'ver';
  const isEdit = mode === 'editar';
  const isCreate = mode === 'crear';

  const [name, setName]           = useState(initialData.name || '');
  const [company, setCompany]     = useState(initialData.company || '');
  const [position, setPosition]   = useState(initialData.position || '');
  const [pdfFile, setPdfFile]     = useState(initialData.pdfFile || null);
  const [excelFile, setExcelFile] = useState(initialData.excelFile || null);
  const [pdfName, setPdfName]     = useState(initialData.pdfName || '');
  const [excelName, setExcelName] = useState(initialData.excelName || '');
  const [loading, setLoading]     = useState(false);
  const [observations, setObservations] = useState(initialData.observations || '');

  const [showModal, setShowModal]   = useState(false);
  const [activeFile, setActiveFile] = useState(null);

  // refs para exponer openPicker()
  const pdfRef   = useRef();
  const excelRef = useRef();
  
  const handlePdfDrop   = files => setPdfFile(files[0]);
  const handleExcelDrop = files => setExcelFile(files[0]);

  const normalizeRuta = ruta =>
    ruta && (ruta.startsWith("archivos/") || ruta.startsWith("/archivos/"))
      ? `/media/${ruta.replace(/^\//, '')}`
      : ruta;

  const openFileModal = file => {
    if (!file) return;

    const toLower = s => (s || '').toLowerCase();
    const guessTypeFromExt = ext => {
      if (!ext) return 'desconocido';
      if (ext === 'pdf') return 'pdf';
      if (['csv', 'xls', 'xlsx'].includes(ext)) return 'excel';
      return 'desconocido';
    };

    let url, revokeUrl, name, type = 'desconocido', size, lastModified;

    if (file instanceof File) {
      // Caso: archivo recién subido
      url = URL.createObjectURL(file);
      revokeUrl = url;
      name = file.name || 'Archivo';
      size = file.size;
      lastModified = file.lastModified;

      const mime = toLower(file.type);
      if (mime.includes('pdf')) type = 'pdf';
      else if (mime.includes('csv') || mime.includes('sheet') || mime.includes('excel')) type = 'excel';
      else type = guessTypeFromExt(toLower(name.split('.').pop()));
    } else if (typeof file === 'string') {
      // Caso: ruta/URL desde backend
      url = normalizeRuta(file);
      const clean = url.split('?')[0].split('#')[0];
      name = clean.split('/').pop() || 'Archivo';
      type = guessTypeFromExt(toLower(name.split('.').pop()));
    } else if (file && file.url) {
      // Caso: objeto con { url, name? }
      url = normalizeRuta(file.url);
      size = file.size;
      lastModified = file.lastModified;

      const baseName = (file.name || url.split('?')[0].split('#')[0].split('/').pop() || '').toString();
      name = baseName || 'Archivo';
      const ext = toLower(baseName.split('.').pop());
      type = guessTypeFromExt(ext);
    }

    const active = { name, url, type, size, lastModified, revokeUrl };
    setActiveFile(active);
    setShowModal(true);
  };


  // reemplazar o limpiar
  const handlePdfReplace   = () => pdfRef.current.openPicker();
  const handlePdfRemove    = () => setPdfFile(null);
  const handleExcelReplace = () => excelRef.current.openPicker();
  const handleExcelRemove  = () => setExcelFile(null);

  const handleSubmit = async () => {
    if (!name.trim())   return alert('El nombre es obligatorio');
    if (!pdfFile)       return alert('Debe subir un archivo PDF Nesplora');

    setLoading(true);
    try {
      const newData = { name, company, position, observations };

      // adjuntar siempre el PDF
      newData.pdfFile = pdfFile;
      // adjuntar Excel solo si existe
      if (excelFile) newData.excelFile = excelFile;

      // En crear: siempre correr OCR. En editar: solo si se subió un File nuevo.
      const meta = {
        mode,
        pdfChanged: isEdit ? pdfFile instanceof File : true,
      };

      if (onSubmit) {
        // ahora onSubmit recibe { data, meta }
        await onSubmit({ data: newData, meta });
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "editar" || mode === "ver") {
      setName(initialData.name || '');
      setCompany(initialData.company || '');
      setPosition(initialData.position || '');
      setPdfFile(initialData.pdfFile || null);
      setExcelFile(initialData.excelFile || null);
      setObservations(initialData.observations || ''); // <-- igual que position
    }
  }, [initialData, mode]);

  // Limpia el blob al cerrar el modal
  useEffect(() => {
    if (!showModal && activeFile?.revokeUrl) {
      URL.revokeObjectURL(activeFile.revokeUrl);
    }
    // eslint-disable-next-line
  }, [showModal]);

  // Estado de solo lectura cuando se crea o se está cargando
  const isReadOnly = isView || loading;

  // Helpers para “ver”
  const isEmpty = (v) => !String(v ?? '').trim();
  const shouldHide = (v) => isView && hideEmptyInView && isEmpty(v);

  // usa el label específico si existe, si no, el emptyPlaceholder global
  const viewPlaceholder = (key, v, defaultPh) =>
    isView && isEmpty(v) ? (emptyLabels?.[key] ?? emptyPlaceholder) : defaultPh;

  // NUEVO: renderiza ícono con opacidad si está vacío en modo "ver"
  const renderIcon = (iconDef, dim = false, size = 'text-xl', activeColor = 'text-primary') => {
    const color = dim ? 'text-primary opacity-50' : activeColor;
    if (typeof iconDef === 'function') {
      return iconDef(size, color);
    }
    return React.isValidElement(iconDef)
      ? React.cloneElement(iconDef, { className: `${size} ${color}` })
      : null;
  };

  const dimName     = isView && isEmpty(name);
  const dimCompany  = isView && isEmpty(company);
  const dimPosition = isView && isEmpty(position);
  const dimObservations = isView && isEmpty(observations);

  const { isActive: globalLoading, progress } = useLoadingBar();

  return (
    <div className="space-y-6">
      {/* Card: Datos del trabajador */}
      <Card className="rounded-sm shadow-xs gap-2 py-4">
        <CardHeader>
          <CardTitle className='text-base text-primary-text'>Datos del trabajador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-5">
            {/* Nombre */}
            {!shouldHide(name) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-secondary-text mb-1 flex items-center gap-2">
                  {renderIcon(Icons.workers, dimName)}
                  Nombre
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  // En "ver": solo readOnly (no disabled) para evitar opacidad
                  readOnly={isView}
                  disabled={loading}
                  placeholder={viewPlaceholder('name', name, 'Ingrese nombre completo del trabajador')}
                  className={`text-primary-text placeholder:text-secondary-text/70 text-sm focus:ring-2 focus:ring-primary/40 ${isView ? 'disabled:opacity-100' : ''}`}
                />
              </div>
            )}

            {/* Empresa */}
            {!shouldHide(company) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-secondary-text mb-1 flex items-center gap-2">
                  {renderIcon(Icons.company, dimCompany)}
                  Empresa
                </label>
                <Input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  readOnly={isView}
                  disabled={loading}
                  placeholder={viewPlaceholder('company', company, 'Ingrese empresa del trabajador')}
                  className={`text-primary-text placeholder:text-secondary-text/70 text-sm focus:ring-2 focus:ring-primary/40 ${isView ? 'disabled:opacity-100' : ''}`}
                />
              </div>
            )}

            {/* Cargo */}
            {!shouldHide(position) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-secondary-text mb-1 flex items-center gap-2">
                  {renderIcon(Icons.position, dimPosition)}
                  Cargo
                </label>
                <Input
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  readOnly={isView}
                  disabled={loading}
                  placeholder={viewPlaceholder('position', position, 'Ingrese cargo del trabajador')}
                  className={`text-primary-text placeholder:text-secondary-text/70 text-sm focus:ring-2 focus:ring-primary/40 ${isView ? 'disabled:opacity-100' : ''}`}
                />
              </div>
            )}

            {/* Observaciones */}
            {!shouldHide(observations) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-secondary-text mb-1 flex items-center gap-2">
                  {renderIcon(Icons.notes, dimObservations)}
                  Observaciones
                </label>
                <Textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  readOnly={isView}
                  disabled={loading}
                  placeholder={viewPlaceholder('observations', observations, 'Ingrese observaciones adicionales')}
                  className={`text-primary-text placeholder:text-secondary-text/70 text-sm rounded-md border border-border/60 bg-transparent px-3 py-2 min-h-[80px] max-h-[220px] resize-vertical focus:ring-2 focus:ring-primary/40 focus:border-primary ${isView ? 'disabled:opacity-100' : ''}`}
                  rows={4}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card: Archivos */}
      <Card className="rounded-sm shadow-xs gap-0 py-4">
        <CardHeader>
          <CardTitle className='text-base text-primary-text'>Archivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20">
            {/* PDF */}
            <div>
              <DropzoneField
                ref={pdfRef}
                onDrop={handlePdfDrop}
                file={pdfFile}
                disabled={isReadOnly}
                forceDisabled={loading}
                fileLabel={pdfName ? `${pdfName}` : 'Archivo PDF Nesplora'}
                onClick={() => !loading && pdfFile && openFileModal(pdfFile)}
                disablePreview={isCreate}
                showPointer={!isCreate}
                enableHover={!isCreate}
              />
              {(isEdit || isCreate) && pdfFile && (
                <div className="flex justify-evenly space-x-4 mt-2">
                  <ButtonBase size="sm" variant="secondary" onClick={handlePdfReplace} disabled={loading}>
                    Cambiar PDF
                  </ButtonBase>
                  <ButtonBase size="sm" className='glass-secondary text-secondary' onClick={handlePdfRemove} disabled={loading}>
                    Eliminar PDF
                  </ButtonBase>
                </div>
              )}
            </div>

            {/* Excel */}
            <div>
              <DropzoneField
                ref={excelRef}
                onDrop={handleExcelDrop}
                file={excelFile}
                disabled={isReadOnly}
                forceDisabled={loading}
                fileLabel={excelName ? `${excelName}` : 'Archivo Excel EEG'}
                onClick={() => !loading && excelFile && openFileModal(excelFile)}
                disablePreview={isCreate}
                showPointer={!isCreate}
                enableHover={!isCreate}
              />
              {(isEdit || isCreate) && excelFile && (
                <div className="flex justify-evenly space-x-4 mt-2">
                  <ButtonBase size="sm" variant="primary" onClick={handleExcelReplace} disabled={loading}>
                    Cambiar EXCEL
                  </ButtonBase>
                  <ButtonBase size="sm" className='glass-primary-bg text-primary' onClick={handleExcelRemove} disabled={loading}>
                    Eliminar EXCEL
                  </ButtonBase>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
        {!isView && (
          <CardFooter className="flex items-center justify-center gap-8 mt-4">
            <ButtonWithProgress
              buttonLabel={isEdit ? "Editar trabajador" : "Añadir trabajador"}
              onAction={async () => {
                if (!name.trim()) throw new Error('El nombre es obligatorio');
                const newData = { name, company, position, pdfFile, excelFile, observations };
                const meta = {
                  mode,
                  pdfChanged: isEdit ? pdfFile instanceof File : true,
                };
                if (onSubmit) {
                  await onSubmit({ data: newData, meta });
                }
                return { nombre: name };
              }}
              progressText={isEdit ? "Editando trabajador..." : "Añadiendo trabajador..."}
              readyText={`El trabajador ${name} ha sido ${isEdit ? "editado" : "creado"} exitosamente`}
              errorText="No se pudo crear el trabajador. Intente nuevamente."
              downloadLabel=""
              showDownload={false}
              variant="neutral"
              size="md"
              minWidth={170}
              disabled={loading}
              allowNoFile
            />
{/* 
            {globalLoading && (
              <div className="flex items-center gap-0">
                <Progress
                  value={progress}
                  className="h-3 w-50"
                  aria-label="Progreso"
                />
                <span className="text-xs text-secondary-text tabular-nums w-10 text-right">
                  {Math.min(100, Math.round(progress))}%
                </span>
              </div>
            )} */}
          </CardFooter>
        )}

      {/* Modal: Previsualización de archivo */}
      {showModal && activeFile && (
        <ArchivoPreviewModal
          open={showModal}
          onClose={() => setShowModal(false)}
          file={activeFile}
          // solo para evitar el warning de React al cerrar el modal
          key={activeFile.url}
        />
      )}
    </div>
  );
}
