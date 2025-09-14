import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function AverageCard({ icon: Icon = Activity, average }) {
  return (
    <Card className="flex flex-row items-center py-1 px-2 rounded-sm shadow-xs">
      {/* Icono con fondo circular */}
      <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-indigo-100 text-indigo-600">
        <Icon className="w-4 h-4" />
      </div>

      {/* Contenido a la derecha */}
      <CardContent className="flex flex-col p-0">
        <p className="text-xs font-medium text-secondary-text">
          Promedio
        </p>
        <p className="text-xs font-semibold text-primary-text">
          {average}
        </p>
      </CardContent>
    </Card>
  )
}
