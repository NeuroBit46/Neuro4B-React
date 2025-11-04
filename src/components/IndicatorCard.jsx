import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function IndicatorCard({
  icon,
  title,
  description,
  className = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  hoverable = true,
}) {
  return (
    <Card
      className={`p-3 border border-border/60 rounded-md shadow-sm bg-gradient-to-br from-white/90 to-white/70 dark:from-zinc-900/80 dark:to-zinc-900/60 backdrop-blur-sm transition-colors ${hoverable ? 'hover:border-primary/50 hover:shadow-md' : ''} ${className}`}
    >
      <CardHeader className="p-0 mb-0">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-neutral/20 text-neutral">
              <span className={`inline-flex items-center justify-center text-primary ${iconClassName}`}>
                {icon}
              </span>
            </div>
          )}
          <CardTitle className={`text-base font-semibold tracking-wide text-primary-text ${titleClassName}`}>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`text-sm leading-snug text-secondary-text ${descriptionClassName}`}>
          {description}
        </div>
      </CardContent>
    </Card>
  );
}
