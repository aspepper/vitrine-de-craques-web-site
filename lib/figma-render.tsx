import React, { ReactNode } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  absoluteBoundingBox?: {
    width: number
    height: number
    x?: number
    y?: number
  }
  fills?: Array<{
    type: string
    color?: { r: number; g: number; b: number; a?: number }
    imageRef?: string
  }>
  characters?: string
  layoutMode?: 'VERTICAL' | 'HORIZONTAL'
  itemSpacing?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  style?: { fontSize?: number; fontWeight?: number }
  effects?: Array<{ type: string }>
  [key: string]: any
}

function rgbToHex(r: number, g: number, b: number) {
  const to255 = (v: number) => Math.round(v * 255)
  return `#${[r, g, b]
    .map((v) => to255(v).toString(16).padStart(2, '0'))
    .join('')}`
}

function fontSizeToClass(size?: number) {
  if (!size) return ''
  if (size >= 36) return 'text-4xl'
  if (size >= 30) return 'text-3xl'
  if (size >= 24) return 'text-2xl'
  if (size >= 20) return 'text-xl'
  if (size >= 16) return 'text-lg'
  if (size >= 14) return 'text-base'
  if (size >= 12) return 'text-sm'
  return 'text-xs'
}

function paddingClasses(node: FigmaNode) {
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = node
  const vals = [paddingTop, paddingRight, paddingBottom, paddingLeft]
  if (vals.every((v) => v === undefined)) return ''
  if (vals.every((v) => v === vals[0])) return `p-[${vals[0]}px]`
  const parts = []
  if (paddingTop === paddingBottom) parts.push(`py-[${paddingTop}px]`)
  else {
    if (paddingTop !== undefined) parts.push(`pt-[${paddingTop}px]`)
    if (paddingBottom !== undefined) parts.push(`pb-[${paddingBottom}px]`)
  }
  if (paddingLeft === paddingRight) parts.push(`px-[${paddingLeft}px]`)
  else {
    if (paddingLeft !== undefined) parts.push(`pl-[${paddingLeft}px]`)
    if (paddingRight !== undefined) parts.push(`pr-[${paddingRight}px]`)
  }
  return parts.join(' ')
}

export function figmaToReact(
  node: FigmaNode,
  overrides: Record<string, string> = {},
): ReactNode {
  const override = overrides[node.name] || ''
  const children = node.children?.map((child) => figmaToReact(child, overrides))

  if (node.fills && node.fills[0]?.type === 'IMAGE') {
    const { width = 0, height = 0 } = node.absoluteBoundingBox || {}
    const src = `/${node.name}.png`
    return (
      <Image
        src={src}
        alt={node.name}
        width={width}
        height={height}
        className={override}
      />
    )
  }

  switch (node.type) {
    case 'TEXT': {
      let Tag: keyof JSX.IntrinsicElements = 'p'
      if (/^h1/i.test(node.name)) Tag = 'h1'
      else if (/^h2/i.test(node.name)) Tag = 'h2'
      else if (/^h3/i.test(node.name)) Tag = 'h3'
      const classes = [fontSizeToClass(node.style?.fontSize)]
      if ((node.style?.fontWeight ?? 400) >= 700) classes.push('font-bold')
      if (override) classes.push(override)
      return React.createElement(
        Tag,
        { className: classes.join(' ') },
        node.characters || '',
      )
    }
    case 'RECTANGLE':
    case 'ELLIPSE': {
      const classes = []
      if (
        node.fills &&
        node.fills[0]?.type === 'SOLID' &&
        node.fills[0].color
      ) {
        const c = node.fills[0].color
        classes.push(`bg-[${rgbToHex(c.r, c.g, c.b)}]`)
      }
      if (node.type === 'ELLIPSE') classes.push('rounded-full')
      if (node.effects?.some((e) => e.type === 'DROP_SHADOW'))
        classes.push('shadow')
      if (override) classes.push(override)
      const style: any = {}
      if (node.absoluteBoundingBox) {
        style.width = node.absoluteBoundingBox.width
        style.height = node.absoluteBoundingBox.height
      }
      return (
        <div className={classes.join(' ')} style={style}>
          {children}
        </div>
      )
    }
    case 'FRAME':
    case 'GROUP':
    case 'BUTTON': {
      if (node.type === 'FRAME' && /^Button/i.test(node.name)) {
        return <Button className={override}>{children}</Button>
      }
      const classes = []
      if (node.layoutMode === 'HORIZONTAL') classes.push('flex flex-row')
      else if (node.layoutMode === 'VERTICAL') classes.push('flex flex-col')
      if (node.itemSpacing) classes.push(`gap-[${node.itemSpacing}px]`)
      const padding = paddingClasses(node)
      if (padding) classes.push(padding)
      if (override) classes.push(override)
      return <div className={classes.join(' ')}>{children}</div>
    }
    default: {
      return <div className={override}>{children}</div>
    }
  }
}
