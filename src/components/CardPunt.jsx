import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "./ui/badge"
import { Icon } from "@iconify/react"
import { getNivelKey, getNivelLabel, getNivelColorVar, alphaVar } from "../lib/nivel"

function coerceNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const n = Number(String(val).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export default function CardPunt({ title, label, punt, suffix = 'Total' }) {
  const n = coerceNumber(punt);
  const nivelKey = getNivelKey(n);
  const nivelLabel = getNivelLabel(nivelKey);
  const c = getNivelColorVar(nivelKey);
  // Método 1: rgb(from var(--color-*) r g b / α)
  const cardBg = alphaVar(c, 0.10);
  const cardBorder = alphaVar(c, 0.28);
  const iconBg = alphaVar(c, 0.18);
  const iconColor = alphaVar(c, 0.90);
  const badgeBg = alphaVar(c, 0.18);
  const badgeText = alphaVar(c, 0.92);
  const badgeBorder = alphaVar(c, 0.40);

  return (
    <Card
      className="flex flex-row items-center py-1 px-2 rounded-sm shadow-xs border"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-sm"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon icon="streamline-plump:star-circle-solid" className="text-lg" />
      </div>

      <CardContent className="flex flex-col p-0 flex-1 ml-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-primary-text truncate">
            {title ?? (label ? `${label} ${suffix}` : '')}
          </p>
          <Badge
            className="h-4 px-1.5 rounded-full text-[10px] font-semibold border shrink-0"
            style={{ background: badgeBg, color: badgeText, borderColor: badgeBorder }}
          >
            {nivelLabel}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-primary-text">
          {punt}
        </p>
      </CardContent>
    </Card>
  )
}
