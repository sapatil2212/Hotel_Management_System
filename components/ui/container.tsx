import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  fluid?: boolean
}

export function Container({ 
  children, 
  className, 
  as: Component = "div",
  fluid = false 
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto",
        fluid 
          ? "px-4 sm:px-6 lg:px-8" 
          : "px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl",
        className
      )}
    >
      {children}
    </Component>
  )
}
