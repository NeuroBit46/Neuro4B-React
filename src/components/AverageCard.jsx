import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function AverageCard({
  icon: Icon = Activity,
  variableName = "",
  average,
  color = "neutral", // "neutral" o "primary"
}) {
  // Elige la clase de fondo según el color
  const bgClass =
    color === "primary"
      ? "glass-primary-bg"
      : "glass-neutral-bg";
  const circleBg =
    color === "primary"
      ? "bg-[var(--color-primary)]"
      : "bg-[var(--color-neutral)]";

  return (
    <Card className={`flex flex-row items-center py-1 px-2 rounded-sm shadow-xs ${bgClass}`}>
      {/* Icono con fondo circular */}
      <div className={`flex items-center justify-center w-7 h-7 rounded-sm text-white ${circleBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      {/* Contenido a la derecha */}
      <CardContent className="flex flex-row gap-6 items-center p-0">
        <p className="text-sm font-medium text-primary-text">
          {variableName}
        </p>
        <p className="text-base font-semibold text-primary-text">
          {average}
        </p>
      </CardContent>
    </Card>
  )
}
