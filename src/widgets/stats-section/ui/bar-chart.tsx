'use client'

import React, { useEffect, useRef, memo } from 'react'
import { getCategoryColor, getCategoryLabel } from '@/shared/ui/colors'

interface BarData {
  kategori: string
  total: number
}

interface BarChartProps {
  data: BarData[]
  isVisible: boolean
}

const BarChartInner: React.FC<BarChartProps> = ({ data, isVisible }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const prevDataRef = useRef<string>('')

  useEffect(() => {
    if (!isVisible || !svgRef.current || data.length === 0) return

    const dataKey = JSON.stringify(data)
    if (dataKey === prevDataRef.current) return
    prevDataRef.current = dataKey
    import('d3').then((d3) => {
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const container = svgRef.current!.parentElement!
      const W = container.clientWidth || 500
      const H = container.clientHeight || 320

      const margin = { top: 24, right: 24, bottom: 56, left: 44 }
      const innerW = W - margin.left - margin.right
      const innerH = H - margin.top - margin.bottom

      svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const maxVal = d3.max(data, d => d.total) ?? 1
      const total = data.reduce((acc, d) => acc + d.total, 0)

      const xScale = d3.scaleBand()
        .domain(data.map(d => d.kategori))
        .range([0, innerW])
        .padding(0.35)

      const yScale = d3.scaleLinear()
        .domain([0, maxVal * 1.15])
        .range([innerH, 0])

      // Grid lines
      const yTicks = yScale.ticks(5)
      g.selectAll('.grid-line')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
        .attr('stroke', '#E4DDD0')
        .attr('stroke-dasharray', '4 4')

      // Y axis
      g.append('g')
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(0)
            .tickFormat(d3.format('d'))
        )
        .call(ax => ax.select('.domain').remove())
        .selectAll('text')
        .attr('fill', '#7E7365')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')

      // Bars
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
        .attr('fill', d => getCategoryColor(d.kategori))
        .attr('opacity', 0.85)
        .attr('stroke', d => getCategoryColor(d.kategori))
        .attr('stroke-width', '1.5px')
        .style('cursor', 'pointer')

      // Animate bars in
      bars.transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .delay((_, i) => i * 80)
        .attr('y', d => yScale(d.total))
        .attr('height', d => innerH - yScale(d.total))

      // Hover interactions via tooltip div
      bars.on('mousemove', function(event: MouseEvent, d: BarData) {
        const pct = total > 0 ? Math.round((d.total / total) * 100) : 0
        const tooltip = d3.select(tooltipRef.current!)
        tooltip
          .style('display', 'block')
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 36}px`)
          .html(
            `<span style="color:${getCategoryColor(d.kategori)};font-weight:700">${getCategoryLabel(d.kategori)}</span>` +
            `<br/><span style="font-size:1.1em;font-weight:700;color:#211E1B">${d.total}</span> kegiatan` +
            `<br/><span style="color:#7E7365">${pct}% dari total</span>`
          )
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseleave', function() {
        d3.select(tooltipRef.current!).style('display', 'none')
        d3.select(this).attr('opacity', 0.85)
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
        .attr('fill', '#211E1B')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', '700')
        .attr('opacity', 0)
        .text(d => d.total)
        .transition()
        .delay((_, i) => i * 80 + 600)
        .attr('opacity', 1)

      // X axis labels
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .call(ax => ax.select('.domain').attr('stroke', '#E4DDD0'))
        .selectAll('text')
        .attr('fill', '#595045')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('dy', '1.4em')
        .text((d) => getCategoryLabel(d as string))
    })
  }, [data, isVisible])

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none z-50 px-3 py-2 rounded-xl text-xs text-[#211E1B] leading-relaxed"
        style={{
          background: '#FAF7F0',
          border: '1px solid #E4DDD0',
          boxShadow: '0 4px 16px rgba(90, 75, 55, 0.12)',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}
      />
    </div>
  )
}

export const BarChart = memo(BarChartInner)
