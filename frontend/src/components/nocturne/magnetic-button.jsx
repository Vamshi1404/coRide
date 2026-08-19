import { Button } from '@/components/ui/button'
import { useMagnetic } from '@/hooks/useMagnetic'
import { cn } from '@/lib/utils'

export function MagneticButton({ children, className, ...props }) {
  const { ref, style, labelStyle, handlers } = useMagnetic(60, 8)

  return (
    <div ref={ref} style={style} className="inline-block" {...handlers}>
      <Button
        className={cn(
          'cursor-pointer transition-all duration-200 active:scale-[0.96]',
          '[&:active]:transition-[transform] [&:active]:duration-100',
          className
        )}
        style={{
          transition: 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        {...props}
      >
        <span style={labelStyle} className="inline-block">
          {children}
        </span>
      </Button>
    </div>
  )
}
