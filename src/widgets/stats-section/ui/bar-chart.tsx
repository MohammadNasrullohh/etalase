'use client'

import React, { useEffect, useRef, memo } from 'react'
import { getCategoryColor, getCategoryLabel } from '@/shared/ui/colors'

export interface BarChartItem {
  kategori: string
  label?: string
  total: number
}

interface BarChartProps {
  data: BarChartItem[]
  isVisible: boolean
  mode?: 'kategori' | 'divisi'
  onBarClick?: (item: BarChartItem) => void
}

const DIVISION_COLORS = [
  '#2D7A4D', // leaf green
  '#195B8B', // deep ocean blue
  '#D99B26', // warm golden amber
  '#9E3B14', // ember
  '#595045', // warm stone
]

const BarChartInner: React.FC<BarChartProps> = ({
  data,
  isVisible,
  mode = 'kategori',
  onBarClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const prevDataRef = useRef<string>('')

  useEffect(() => {
    if (!isVisible || !svgRef.current || data.length === 0) return

    const dataKey = `${mode}_${JSON.stringify(data)}`
    if (dataKey === prevDataRef.current) return
    prevDataRef.current = dataKey

    import('d3').then((d3) => {
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const container = svgRef.current!.parentElement!
      const W = container.clientWidth || 500
      const H = container.clientHeight || 300

      const isHorizontal = mode === 'divisi' && W > 400

      if (isHorizontal) {
        // Horizontal Bar Chart for Divisi
        const margin = { top: 20, right: 36, bottom: 24, left: 140 }
        const innerW = Math.max(W - margin.left - margin.right, 100)
        const innerH = Math.max(H - margin.top - margin.bottom, 100)

        svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

        const maxVal = d3.max(data, d => d.total) ?? 1
        const total = data.reduce((acc, d) => acc + d.total, 0)

        const yScale = d3.scaleBand()
          .domain(data.map(d => d.kategori))
          .range([0, innerH])
          .padding(0.28)

        const xScale = d3.scaleLinear()
          .domain([0, maxVal * 1.2])
          .range([0, innerW])

        // Y Axis (labels)
        g.append('g')
          .call(d3.axisLeft(yScale).tickSize(0))
          .call(ax => ax.select('.domain').remove())
          .selectAll('text')
          .attr('fill', 'var(--color-text-primary)')
          .attr('font-size', '11px')
          .attr('font-family', 'sans-serif')
          .style('text-anchor', 'end')

        // Bars
        const bars = g.selectAll('.bar-h')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar-h')
          .attr('y', d => yScale(d.kategori)!)
          .attr('height', yScale.bandwidth())
          .attr('x', 0)
          .attr('width', 0)
          .attr('rx', 4)
          .attr('fill', (_, i) => DIVISION_COLORS[i % DIVISION_COLORS.length])
          .attr('opacity', 0.85)
          .style('cursor', 'pointer')

        bars.transition()
          .duration(600)
          .ease(d3.easeCubicOut)
          .delay((_, i) => i * 60)
          .attr('width', d => Math.max(xScale(d.total), 4))

        // Value labels
        g.selectAll('.label-h')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'label-h')
          .attr('x', d => Math.max(xScale(d.total), 4) + 6)
          .attr('y', d => (yScale(d.kategori) ?? 0) + yScale.bandwidth() / 2 + 4)
          .attr('fill', 'var(--color-text-muted)')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .text(d => d.total)

        bars.on('mousemove', function(event: MouseEvent, d: BarChartItem) {
          const pct = total > 0 ? Math.round((d.total / total) * 100) : 0
          const [mx, my] = d3.pointer(event, svgRef.current)
          const tooltip = d3.select(tooltipRef.current!)
          tooltip
            .style('display', 'block')
            .style('left', `${mx + 12}px`)
            .style('top', `${my - 30}px`)
            .html(
              `<span style="font-weight:700;color:var(--color-text-primary)">${d.label || d.kategori}</span>` +
              `<br/><span style="font-size:1.1em;font-weight:700;color:#2D7A4D">${d.total}</span> kegiatan` +
              `<br/><span style="color:var(--color-text-muted)">${pct}% dari total</span>`
            )
          d3.select(this).attr('opacity', 1)
        })
        .on('mouseleave', function() {
          d3.select(tooltipRef.current!).style('display', 'none')
          d3.select(this).attr('opacity', 0.85)
        })
        .on('click', function(_: MouseEvent, d: BarChartItem) {
          onBarClick?.(d)
        })

        return
      }

      // Vertical Bar Chart (for Kategori or narrow screens)
      const margin = { top: 24, right: 24, bottom: 50, left: 36 }
      const innerW = Math.max(W - margin.left - margin.right, 100)
      const innerH = Math.max(H - margin.top - margin.bottom, 100)

      svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const maxVal = d3.max(data, d => d.total) ?? 1
      const total = data.reduce((acc, d) => acc + d.total, 0)

      const xScale = d3.scaleBand()
        .domain(data.map(d => d.kategori))
        .range([0, innerW])
        .padding(0.35)

      const yScale = d3.scaleLinear()
        .domain([0, maxVal * 1.2])
        .range([innerH, 0])

      // Grid lines
      const yTicks = yScale.ticks(4)
      g.selectAll('.grid-line')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
        .attr('stroke', 'var(--color-border-subtle)')
        .attr('stroke-dasharray', '3 3')

      // Y axis
      g.append('g')
        .call(
          d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(0)
            .tickFormat(d3.format('d'))
        )
        .call(ax => ax.select('.domain').remove())
        .selectAll('text')
        .attr('fill', 'var(--color-text-muted)')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')

      // Bars
      const getColor = (d: BarChartItem, i: number) => {
        if (mode === 'kategori') return getCategoryColor(d.kategori)
        return DIVISION_COLORS[i % DIVISION_COLORS.length]
      }

      const getLabel = (d: BarChartItem) => {
        if (mode === 'kategori') return getCategoryLabel(d.kategori)
        return d.label || d.kategori
      }

      const bars = g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.kategori)!)
        .attr('width', xScale.bandwidth())
        .attr('y', innerH)
        .attr('height', 0)
        .attr('rx', 6)
        .attr('fill', (d, i) => getColor(d, i))
        .attr('opacity', 0.88)
        .style('cursor', 'pointer')

      // Animate bars in
      bars.transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .delay((_, i) => i * 60)
        .attr('y', d => yScale(d.total))
        .attr('height', d => Math.max(innerH - yScale(d.total), 4))

      // Hover interactions
      bars.on('mousemove', function(event: MouseEvent, d: BarChartItem) {
        const pct = total > 0 ? Math.round((d.total / total) * 100) : 0
        const [mx, my] = d3.pointer(event, svgRef.current)
        const tooltip = d3.select(tooltipRef.current!)
        tooltip
          .style('display', 'block')
          .style('left', `${mx + 12}px`)
          .style('top', `${my - 30}px`)
          .html(
            `<span style="color:${getColor(d, 0)};font-weight:700">${getLabel(d)}</span>` +
            `<br/><span style="font-size:1.1em;font-weight:700;color:var(--color-text-primary)">${d.total}</span> kegiatan` +
            `<br/><span style="color:var(--color-text-muted)">${pct}% dari total</span>` +
            `<div class="text-[10px] text-[#7E7365] mt-0.5">Klik untuk melihat rincian di arsip →</div>`
          )
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseleave', function() {
        d3.select(tooltipRef.current!).style('display', 'none')
        d3.select(this).attr('opacity', 0.88)
      })
      .on('click', function(_: MouseEvent, d: BarChartItem) {
        onBarClick?.(d)
      })

      // Value labels on top of bars
      g.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => (xScale(d.kategori) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.total) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--color-text-primary)')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', '700')
        .attr('opacity', 0)
        .text(d => d.total)
        .transition()
        .delay((_, i) => i * 60 + 500)
        .attr('opacity', 1)

      // X axis labels
      const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).tickSize(0).tickFormat(k => {
          const item = data.find(d => d.kategori === k)
          return item ? getLabel(item) : (k as string)
        }))

      xAxis.select('.domain').attr('stroke', 'var(--color-border-subtle)')
      xAxis.selectAll('text')
        .attr('fill', 'var(--color-text-muted)')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('dy', '14px')
    })
  }, [data, isVisible, mode, onBarClick])

  return (
    <div className="relative w-full h-full min-h-[260px] flex flex-col justify-center">
      <svg ref={svgRef} className="w-full h-full select-none" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-30 px-3 py-2 rounded-lg glass-card shadow-lg hidden"
        style={{
          background: 'rgba(255, 253, 248, 0.95)',
          border: '1px solid var(--color-border-subtle)',
        }}
      />
    </div>
  )
}

export const BarChart = memo(BarChartInner)
