import { cloneElement, isValidElement } from 'react'

/**
 * NOCTURNE button primitive.
 * - `variant`: primary | accent | outline | ghost | danger
 * - `size`:    sm | md | lg
 * - `render`:  element to render as (e.g. <Link to="..." />); className and
 *              handlers merge onto it, so links look/behave like buttons.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  render,
  className = '',
  children,
  block = false,
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (isValidElement(render)) {
    return cloneElement(render, {
      ...rest,
      className: `${cls} ${render.props.className ?? ''}`.trim(),
      children,
    })
  }

  return (
    <button type={rest.type ?? 'button'} className={cls} {...rest}>
      {children}
    </button>
  )
}
