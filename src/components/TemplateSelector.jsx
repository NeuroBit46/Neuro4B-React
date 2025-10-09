import { useState } from "react";
import { Icons } from "../constants/Icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArchivoPreviewModal from "./ArchivoPreviewModal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function TemplateSelector({
  value,
  onChange,
  templates = [
    { name: "Informe Ejecutivo", file: "/plantillas/ejecutivo.pdf", desc: "Resumen sintético para dirección." },
    { name: "Informe Supervisor", file: "/plantillas/supervisor.pdf", desc: "Detalle operativo para mandos medios." },
    { name: "Informe Gerencia", file: null, desc: "Versión en preparación." },
  ],
  title = "Plantilla de informe",
  description = "Seleccione el perfil de informe a generar",
  showPreviewAction = true,
  compact = true,
  className = "",
}) {
  const [loading, setLoading] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const handlePreview = (tpl) => {
    if (!tpl.file) return;
    setLoading(tpl.name);
    setPreviewFile({ url: tpl.file, name: tpl.name });
    setLoading(null);
  };

  return (
    <>
      <Card className={`border-border/70 shadow-xs mt-4 gap-1 p-0 pb-5 ${className}`}>
        <CardHeader className="pt-3 pb-0">
          {/* <CardTitle className="text-sm font-semibold text-primary-text">
            {title}
          </CardTitle> */}
          <CardDescription className="text-xs text-secondary-text leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <RadioGroup
            value={value?.name || ""}
            onValueChange={(val) => {
              const tpl = templates.find(t => t.name === val);
              onChange?.(tpl);
            }}
            className="flex flex-col gap-2 sm:flex-row sm:gap-3"
          >
            {templates.slice(0, 3).map((tpl) => {
              const selected = value?.name === tpl.name;
              const disabled = !tpl.file;

              return (
                <label
                  key={tpl.name}
                  className={[
                    "flex flex-1 items-start gap-2 rounded-sm border transition cursor-pointer relative",
                    compact ? "px-4 py-3" : "px-5 py-4",
                    selected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/30",
                    disabled && "opacity-55 cursor-not-allowed",
                  ].join(" ")}
                >
                  <RadioGroupItem
                    value={tpl.name}
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex text-primary/80">
                        {Icons.fileTemplate?.("size-4") ?? Icons.file?.("size-4")}
                      </span>
                      <span className="font-medium text-xs text-primary-text truncate">
                        {tpl.name}
                      </span>

                      {!tpl.file && (
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 h-5 text-[10px]"
                        >
                          Próximamente
                        </Badge>
                      )}

                      {selected && (
                        <Badge
                          variant="outline"
                          className="px-2 py-0 h-5 text-[10px] font-medium border-primary/60 text-primary bg-primary/10"
                        >
                          Seleccionada
                        </Badge>
                      )}
                    </div>

                    {tpl.desc && (
                      <p className="text-[10px] leading-snug text-secondary-text/80 line-clamp-2">
                        {tpl.desc}
                      </p>
                    )}
                  </div>

                  {showPreviewAction && tpl.file && (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      disabled={loading === tpl.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(tpl);
                      }}
                      className="h-6 px-3 text-[10px] ml-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      {loading === tpl.name ? "…" : "Vista previa"}
                    </Button>
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {previewFile && (
        <ArchivoPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}