import { Button } from '@/components/ui/Button'
import { useMagnetic } from '@/hooks/useMagnetic'

export function MagneticButton({ children, className = '', ...props }) {
  const { ref, style, labelStyle, handlers } = useMagnetic(60, 8)

  return (
    <div ref={ref} style={style} className="inline-block" {...handlers}>
      <Button className={className} {...props}>
        <span style={labelStyle} className="inline-block">
          {children}
        </span>
      </Button>
    </div>
  )
}
