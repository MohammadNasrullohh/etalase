'use client'

import React, { useEffect, useRef, memo } from 'react'
import { MonthlyTrendItem } from '@/entities/jurnal/api/get-jurnal-stats'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

const FULL_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

interface TrendChartProps {
  data: MonthlyTrendItem[]
  year: number
  isVisible: boolean
  onMonthClick?: (month: number) => void
}

const TrendChartInner: React.FC<TrendChartProps> = ({
  data,
  year,
  isVisible,
  onMonthClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const prevDataKeyRef = useRef<string>('')

  useEffect(() => {
    if (!isVisible || !svgRef.current || !data || data.length === 0) return

    const dataKey = `${year}_${JSON.stringify(data)}`
    if (dataKey === prevDataKeyRef.current) return
    prevDataKeyRef.current = dataKey

    import('d3').then(d3 => {
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const container = svgRef.current!.parentElement!
      const W = container.clientWidth || 500
      const H = container.clientHeight || 300

      const margin = { top: 28, right: 24, bottom: 44, left: 36 }
      const innerW = Math.max(W - margin.left - margin.right, 100)
      const innerH = Math.max(H - margin.top - margin.bottom, 100)

      svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)

      // Defs: Gradients
      const defs = svg.append('defs')
      const gradient = defs.append('linearGradient')
        .attr('id', 'trend-area-gradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%')

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3CA768')
        .attr('stop-opacity', 0.35)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#3CA768')
        .attr('stop-opacity', 0.02)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const maxVal = d3.max(data, d => d.total) ?? 1
      const yMax = Math.max(maxVal * 1.25, 4)

      // Scales
      const xScale = d3.scalePoint<number>()
        .domain(data.map(d => d.month))
        .range([0, innerW])
        .padding(0.4)

      const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([innerH, 0])

      // Grid Lines
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

      // Y Axis
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

      // X Axis
      const xAxisG = g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(
          d3.axisBottom(xScale)
            .tickSize(0)
            .tickFormat(m => MONTH_LABELS[(m as number) - 1] ?? '')
        )

      xAxisG.select('.domain').attr('stroke', 'var(--color-border-subtle)')
      xAxisG.selectAll('text')
        .attr('fill', 'var(--color-text-muted)')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('dy', '12px')

      // Area generator
      const areaGen = d3.area<MonthlyTrendItem>()
        .x(d => xScale(d.month)!)
        .y0(innerH)
        .y1(d => yScale(d.total))
        .curve(d3.curveMonotoneX)

      // Line generator
      const lineGen = d3.line<MonthlyTrendItem>()
        .x(d => xScale(d.month)!)
        .y(d => yScale(d.total))
        .curve(d3.curveMonotoneX)

      // Append Area
      g.append('path')
        .datum(data)
        .attr('class', 'trend-area')
        .attr('fill', 'url(#trend-area-gradient)')
        .attr('d', areaGen)
        .attr('opacity', 0)
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)

      // Append Line
      const linePath = g.append('path')
        .datum(data)
        .attr('class', 'trend-line')
        .attr('fill', 'none')
        .attr('stroke', '#2D7A4D')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('d', lineGen)

      // Line animation
      const totalLength = (linePath.node() as SVGPathElement)?.getTotalLength() || 0
      if (totalLength > 0) {
        linePath
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(800)
          .ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0)
      }

      // Invisible vertical overlay bands for easy hovering
      const bandWidth = innerW / 12
      const hoverOverlay = g.selectAll('.hover-band')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'hover-band')
        .attr('x', d => (xScale(d.month)! - bandWidth / 2))
        .attr('y', 0)
        .attr('width', bandWidth)
        .attr('height', innerH)
        .attr('fill', 'transparent')
        .style('cursor', d => (d.total > 0 ? 'pointer' : 'default'))

      // Data Points (Circles)
      const circles = g.selectAll('.trend-circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'trend-circle')
        .attr('cx', d => xScale(d.month)!)
        .attr('cy', d => yScale(d.total))
        .attr('r', d => (d.total > 0 ? 4.5 : 2.5))
        .attr('fill', d => (d.total > 0 ? '#2D7A4D' : '#D6CBB5'))
        .attr('stroke', '#FAF7F0')
        .attr('stroke-width', 1.5)
        .style('cursor', d => (d.total > 0 ? 'pointer' : 'default'))

      // Hover / Click Interactions
      hoverOverlay
        .on('mouseenter mousemove', function (event: MouseEvent, d: MonthlyTrendItem) {
          const tooltip = d3.select(tooltipRef.current!)
          const [mx, my] = d3.pointer(event, svgRef.current)
          tooltip
            .style('display', 'block')
            .style('left', `${mx + 12}px`)
            .style('top', `${my - 24}px`)
            .html(
              `<div class="font-sans text-xs">` +
              `<strong class="font-serif text-[#211E1B]">${FULL_MONTH_NAMES[d.month - 1]} ${year}</strong>` +
              `<div class="mt-0.5 text-xs text-[#2D7A4D] font-mono font-bold">${d.total} Kegiatan</div>` +
              `${d.total > 0 ? '<div class="text-[10px] text-[#7E7365] mt-0.5">Klik untuk melihat di arsip →</div>' : ''}` +
              `</div>`
            )

          circles
            .filter((c: MonthlyTrendItem) => c.month === d.month)
            .attr('r', 6.5)
            .attr('fill', '#F5B748')
        })
        .on('mouseleave', function () {
          d3.select(tooltipRef.current!).style('display', 'none')
          circles
            .attr('r', (d: MonthlyTrendItem) => (d.total > 0 ? 4.5 : 2.5))
            .attr('fill', (d: MonthlyTrendItem) => (d.total > 0 ? '#2D7A4D' : '#D6CBB5'))
        })
        .on('click', function (_: MouseEvent, d: MonthlyTrendItem) {
          if (d.total > 0) {
            onMonthClick?.(d.month)
          }
        })
    })
  }, [data, year, isVisible, onMonthClick])

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

export const TrendChart = memo(TrendChartInner)
