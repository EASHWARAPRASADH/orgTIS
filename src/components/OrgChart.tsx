import React, { useMemo, useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { Employee } from "../types";
import { cn } from "../lib/utils";
import { Search, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, Plus } from "lucide-react";

interface OrgChartProps {
  employees: Employee[];
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;

export const OrgChart: React.FC<OrgChartProps> = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<"vertical" | "horizontal">("horizontal");
  const [spacing, setSpacing] = useState({ sibling: 5, level: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build hierarchy
  const hierarchy = useMemo(() => {
    if (employees.length === 0) return null;
    
    try {
      const stratify = d3.stratify<Employee>()
        .id(d => d.id)
        .parentId(d => d.managerId);
      
      const root = stratify(employees);
      
      // Apply collapse state by removing children of collapsed nodes for layout calculation
      const visibleRoot = root.copy();
      visibleRoot.eachBefore(node => {
        if (collapsedIds.has(node.id!)) {
          node.children = undefined;
        }
      });

      const treeLayout = d3.tree<Employee>()
        .nodeSize(direction === "vertical" 
          ? [NODE_WIDTH + spacing.sibling, NODE_HEIGHT + spacing.level] 
          : [NODE_HEIGHT + spacing.sibling, NODE_WIDTH + spacing.level]
        );
      
      const layoutRoot = treeLayout(visibleRoot);

      // Swap x and y for horizontal layout
      if (direction === "horizontal") {
        layoutRoot.each(d => {
          const tmp = d.x;
          d.x = d.y;
          d.y = tmp;
        });
      }

      return layoutRoot;
    } catch (e) {
      console.error("Hierarchy error:", e);
      return null;
    }
  }, [employees, collapsedIds, direction, spacing]);

  const nodes = hierarchy ? hierarchy.descendants() : [];
  const links = hierarchy ? hierarchy.links() : [];

  // Handle panning
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Only left click for mouse
    if ('button' in e && e.button !== 0) return;
    isDragging.current = true;
    
    if ('touches' in e) {
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      lastPos.current = { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: clientX, y: clientY };
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMove as EventListener);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove as EventListener, { passive: false });
    window.addEventListener("touchend", handleUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMove as EventListener);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove as EventListener);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 2));
    } else {
      setTranslate(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const centerChart = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (direction === "vertical") {
        setTranslate({ x: width / 2, y: 50 });
      } else {
        setTranslate({ x: 50, y: height / 2 });
      }
      setZoom(1);
    }
  };

  useEffect(() => {
    centerChart();
  }, [hierarchy]);

  const filteredNodes = nodes.filter(node => 
    node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden select-none" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-4 w-48">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layout</span>
            <button 
              onClick={() => setDirection(d => d === "vertical" ? "horizontal" : "vertical")} 
              className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {direction === "vertical" ? "Vertical" : "Horizontal"}
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sibling Gap</span>
              <span className="text-[10px] font-bold text-gray-400">{spacing.sibling}px</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5"
              value={spacing.sibling}
              onChange={(e) => setSpacing(s => ({ ...s, sibling: parseInt(e.target.value) }))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level Gap</span>
              <span className="text-[10px] font-bold text-gray-400">{spacing.level}px</span>
            </div>
            <input 
              type="range" min="20" max="200" step="10"
              value={spacing.level}
              onChange={(e) => setSpacing(s => ({ ...s, level: parseInt(e.target.value) }))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 self-end">
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.1, 2))} 
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors group"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} 
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors group"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
          <button 
            onClick={centerChart} 
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors group"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onWheel={handleWheel}
      >
        <motion.div
          animate={{
            x: translate.x,
            y: translate.y,
            scale: zoom
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="origin-top-left"
        >
          {/* Links */}
          <svg className="absolute top-0 left-0 overflow-visible pointer-events-none">
            <g>
              {links.map((link, i) => {
                let path = "";
                if (direction === "vertical") {
                  const sourceX = link.source.x;
                  const sourceY = link.source.y + NODE_HEIGHT / 2;
                  const targetX = link.target.x;
                  const targetY = link.target.y - NODE_HEIGHT / 2;
                  const midY = (sourceY + targetY) / 2;
                  path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
                } else {
                  const sourceX = link.source.x + NODE_WIDTH / 2;
                  const sourceY = link.source.y;
                  const targetX = link.target.x - NODE_WIDTH / 2;
                  const targetY = link.target.y;
                  const midX = (sourceX + targetX) / 2;
                  path = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
                }
                
                return (
                  <motion.path
                    key={`link-${i}`}
                    d={path}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isHighlighted = searchTerm && (
              node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.data.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.data.department.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const isCollapsed = collapsedIds.has(node.id!);
            const hasChildren = employees.some(e => e.managerId === node.id);

            return (
              <motion.div
                key={node.data.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: node.x - NODE_WIDTH / 2,
                  y: node.y - NODE_HEIGHT / 2
                }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className={cn(
                  "absolute bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-2.5 gap-2.5 transition-all",
                  isHighlighted ? "ring-2 ring-blue-500 border-transparent shadow-lg" : "hover:shadow-md hover:border-gray-300",
                  !isHighlighted && searchTerm && "opacity-40 grayscale-[0.5]"
                )}
                style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
              >
                {/* Accent line */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: node.data.color || "#E5E7EB" }}
                />
                
                <img 
                  src={node.data.photoUrl} 
                  alt={node.data.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                    {node.data.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tight break-words">
                    {node.data.role}
                  </p>
                </div>

                {/* Collapse Toggle */}
                {hasChildren && (
                  <button
                    onClick={(e) => toggleCollapse(node.id!, e)}
                    className={cn(
                      "absolute rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all z-10",
                      direction === "vertical" 
                        ? "-bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5" 
                        : "-right-2.5 top-1/2 -translate-y-1/2 w-5 h-5",
                      isCollapsed ? "text-blue-600 border-blue-200" : "text-gray-400"
                    )}
                  >
                    {isCollapsed ? (
                      <Plus className="w-3 h-3" />
                    ) : (
                      direction === "vertical" ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
