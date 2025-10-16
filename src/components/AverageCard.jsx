import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function AverageCard({ icon: Icon = Activity, average }) {
  return (
    <Card className="flex flex-row items-center py-1 px-2 rounded-sm shadow-xs glass-neutral-bg">
      {/* Icono con fondo circular */}
      <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-neutral/50 text-white">
        <Icon className="w-4 h-4" />
      </div>

      {/* Contenido a la derecha */}
      <CardContent className="flex flex-row gap-6 items-center p-0">
        <p className="text-sm font-medium text-primary-text">
          Promedio
        </p>
        <p className="text-base font-semibold text-primary-text">
          {average}
        </p>
      </CardContent>
    </Card>
  )
}
