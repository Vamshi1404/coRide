import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MagneticButton({ children, className, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
      className="inline-block"
    >
      <Button className={cn('cursor-pointer', className)} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}
