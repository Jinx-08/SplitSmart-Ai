import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
function D3SpendingPieChart({ data, prefCurrency }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [parentWidth, setParentWidth] = useState(300);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setParentWidth(Math.max(220, Math.min(width, 420)));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  const totalSpend = data.reduce((sum, item) => sum + item.amount, 0);
  const chartData = totalSpend > 0 ? data : data.map((item) => ({ ...item, amount: 1 }));
  useEffect(() => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();
    const width = parentWidth;
    const height = parentWidth;
    const margin = 12;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.65;
    const g = svgElement.attr("width", width).attr("height", height).append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    const colors = [
      "#10b981",
      // Emerald-500
      "#6366f1",
      // Indigo-500
      "#f59e0b",
      // Amber-500
      "#ec4899",
      // Pink-500
      "#06b6d4",
      // Cyan-500
      "#8b5cf6"
      // Violet-500
    ];
    const colorScale = d3.scaleOrdinal().domain(chartData.map((d) => d.name)).range(colors);
    const pie = d3.pie().value((d) => d.amount).sort(null);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius).cornerRadius(4);
    const arcHover = d3.arc().innerRadius(innerRadius - 2).outerRadius(radius + 5).cornerRadius(6);
    const arcs = g.selectAll(".arc").data(pie(chartData)).enter().append("g").attr("class", "arc");
    arcs.append("path").attr("d", arc).attr("fill", (d) => colorScale(d.data.name)).style("stroke", "#09090b").style("stroke-width", "2px").style("cursor", "pointer").style("transition", "all 200ms ease").on("mouseenter", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arcHover).style("opacity", "0.95");
      if (totalSpend > 0) {
        setHoveredSlice(d.data);
      }
    }).on("mouseleave", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arc).style("opacity", "1");
      setHoveredSlice(null);
    });
    arcs.selectAll("path").transition().duration(850).attrTween("d", function(d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function(t) {
        return arc(interpolate(t)) || "";
      };
    });
    if (totalSpend === 0) {
      g.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em").style("fill", "#71717a").style("font-size", "10px").style("font-family", "monospace").style("font-weight", "bold").style("text-transform", "uppercase").text("No Outlay");
      g.append("text").attr("text-anchor", "middle").attr("dy", "1em").style("fill", "#3f3f46").style("font-size", "9px").style("font-family", "monospace").text("0.00 Recorded");
    }
  }, [chartData, parentWidth, totalSpend]);
  return <div ref={containerRef} className="w-full flex flex-col items-center bg-zinc-950 border border-neutral-900 rounded-2xl p-5 space-y-4">
      
      {
    /* Visual Title Header */
  }
      <div className="w-full flex justify-between items-center pb-2.5 border-b border-neutral-900">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            D3.js Visualization Node
          </span>
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Spending Share Map
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
          Dynamic Render
        </span>
      </div>

      {
    /* SVG Container wrapping centered Tooltip */
  }
      <div className="relative flex items-center justify-center w-full min-h-[220px]">
        <svg ref={svgRef} className="mx-auto block overflow-visible select-none" />

        {
    /* Dynamic Center HTML Overlay Tooltip */
  }
        {totalSpend > 0 && <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col items-center justify-center text-center">
            {hoveredSlice ? <div className="space-y-0.5 max-w-[130px] p-2 bg-black/85 backdrop-blur rounded-lg border border-white/5 shadow-xl animate-fade-in">
                <p className="text-[10px] font-bold text-white truncate uppercase tracking-tight">{hoveredSlice.name}</p>
                <p className="text-xs font-mono font-black text-emerald-400">
                  {prefCurrency}{hoveredSlice.amount.toFixed(2)}
                </p>
                <p className="text-[9px] font-mono text-zinc-500 font-medium">
                  {(hoveredSlice.amount / totalSpend * 100).toFixed(0)}% Share
                </p>
              </div> : <div className="space-y-0.5 pointer-events-none">
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-black uppercase tracking-widest block">Total Spent</span>
                <span className="text-sm font-mono font-black text-white block">
                  {prefCurrency}{totalSpend.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[8px] font-mono text-zinc-500 block">Hover segments for info</span>
              </div>}
          </div>}
      </div>

      {
    /* Structured Dynamic Color Legend */
  }
      <div className="w-full xl:w-11/12 grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-neutral-905">
        {data.map((item, idx) => {
    const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
    const color = colors[idx % colors.length];
    const calculatedPct = totalSpend > 0 ? (item.amount / totalSpend * 100).toFixed(0) : "0";
    return <div key={item.name} className="flex items-center justify-between text-[11px] font-mono group/legend">
              <div className="flex items-center space-x-2 truncate">
                <span
      className="w-2.5 h-2.5 rounded shrink-0 transition-transform group-hover/legend:scale-110"
      style={{ backgroundColor: color }}
    />
                <span className="text-zinc-300 font-medium truncate group-hover/legend:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0 pl-1.5 flex items-center gap-1">
                <span className="text-[9px] text-zinc-500">
                  {calculatedPct}%
                </span>
                <span className="font-extrabold text-zinc-400">
                  ({prefCurrency}{item.amount.toFixed(0)})
                </span>
              </div>
            </div>;
  })}
      </div>

    </div>;
}
export {
  D3SpendingPieChart
};
