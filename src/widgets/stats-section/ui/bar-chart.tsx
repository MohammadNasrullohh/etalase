'use client'

import React, { useEffect, useRef, memo } from 'react'

interface BarData {
  kategori: string
  total: number
}

interface BarChartProps {
  data: BarData[]
  /** Hanya render D3 saat section masuk viewport (dari IntersectionObserver parent) */
  isVisible: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  mou:       '#7C3AED', // violet
  audiensi:  '#0EA5E9', // sky blue
  pelaporan: '#F59E0B', // amber
  sengketa:  '#EF4444', // red
  lainnya:   '#6B7280', // gray
}

const CATEGORY_LABELS: Record<string, string> = {
  mou:       'MoU',
  audiensi:  'Audiensi',
  pelaporan: 'Pelaporan',
  sengketa:  'Sengketa',
  lainnya:   'Lainnya',
}

const BarChartInner: React.FC<BarChartProps> = ({ data, isVisible }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  // Track previous data to skip re-render if data hasn't actually changed
  const prevDataRef = useRef<string>('')

  useEffect(() => {
    // Jangan render D3 sebelum section masuk viewport
    if (!isVisible || !svgRef.current || data.length === 0) return

    // Skip D3 re-render if data values haven't changed
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
        .attr('stroke', 'rgba(255,255,255,0.06)')
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
        .attr('fill', 'rgba(255,255,255,0.35)')
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
        .attr('y', innerH)          // animate from bottom
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', d => CATEGORY_COLORS[d.kategori] ?? '#6B7280')
        .attr('opacity', 0.85)
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
            `<span style="color:${CATEGORY_COLORS[d.kategori]};font-weight:700">${CATEGORY_LABELS[d.kategori] ?? d.kategori}</span>` +
            `<br/><span style="font-size:1.1em;font-weight:700">${d.total}</span> kegiatan` +
            `<br/><span style="opacity:0.6">${pct}% dari total</span>`
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
        .attr('fill', 'rgba(255,255,255,0.5)')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0)
        .text(d => d.total)
        .transition()
        .delay((_, i) => i * 80 + 600)
        .attr('opacity', 1)

      // X axis labels
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .call(ax => ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
        .selectAll('text')
        .attr('fill', 'rgba(255,255,255,0.5)')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('dy', '1.4em')
        .text((d) => CATEGORY_LABELS[d as string] ?? d as string)
    })
  }, [data, isVisible])


  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none z-50 px-3 py-2 rounded-xl text-xs text-white leading-relaxed"
        style={{
          background: 'rgba(6, 6, 10, 0.88)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.4)',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}
      />
    </div>
  )
}

// Wrap in memo so parent scroll-state re-renders don't re-mount this component
export const BarChart = memo(BarChartInner)
