import { useEffect, useRef, useState } from 'react';
import {
	SigmaContainer,
	useLoadGraph,
	useRegisterEvents,
	useSigma,
	useSetSettings,
} from '@react-sigma/core';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import type { GraphData } from '../utils/tags';
import '@react-sigma/core/lib/style.css';

/* ── Color mapping ── */
const TIER_HEX: Record<string, { light: string; dark: string }> = {
	blue: { light: '#3b82f6', dark: '#60a5fa' },
	violet: { light: '#8b5cf6', dark: '#a78bfa' },
	emerald: { light: '#10b981', dark: '#34d399' },
	amber: { light: '#f59e0b', dark: '#fbbf24' },
	rose: { light: '#f43f5e', dark: '#fb7185' },
	teal: { light: '#14b8a6', dark: '#2dd4bf' },
};

function hexForColor(color: string, dark: boolean): string {
	return (TIER_HEX[color] ?? TIER_HEX.blue)[dark ? 'dark' : 'light'];
}

function nodeSize(tier: number, count: number): number {
	const base = tier === 2 ? 12 : tier === 3 ? 8 : 6;
	return base + Math.min(count * 1.5, 8);
}

/* ── Convex hull helpers ── */

type Pt = [number, number];

function convexHull(points: Pt[]): Pt[] {
	if (points.length < 3) return points;
	const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const cross = (o: Pt, a: Pt, b: Pt) =>
		(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

	const lower: Pt[] = [];
	for (const p of sorted) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
			lower.pop();
		lower.push(p);
	}
	const upper: Pt[] = [];
	for (let i = sorted.length - 1; i >= 0; i--) {
		const p = sorted[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
			upper.pop();
		upper.push(p);
	}
	lower.pop();
	upper.pop();
	return lower.concat(upper);
}

/**
 * Generate padding points around each node center, then compute
 * a single convex hull. Works uniformly for 1, 2, or N nodes.
 */
function paddedHull(centers: Pt[], padding: number): Pt[] {
	const expanded: Pt[] = [];
	const steps = 8; // points per circle
	for (const [cx, cy] of centers) {
		for (let i = 0; i < steps; i++) {
			const angle = (Math.PI * 2 * i) / steps;
			expanded.push([cx + Math.cos(angle) * padding, cy + Math.sin(angle) * padding]);
		}
	}
	return convexHull(expanded);
}

function drawSmoothHull(ctx: CanvasRenderingContext2D, hull: Pt[]) {
	if (hull.length < 3) return;
	const n = hull.length;
	ctx.moveTo(
		(hull[n - 1][0] + hull[0][0]) / 2,
		(hull[n - 1][1] + hull[0][1]) / 2,
	);
	for (let i = 0; i < n; i++) {
		const next = (i + 1) % n;
		ctx.quadraticCurveTo(
			hull[i][0],
			hull[i][1],
			(hull[i][0] + hull[next][0]) / 2,
			(hull[i][1] + hull[next][1]) / 2,
		);
	}
	ctx.closePath();
}

/* ── PARA cluster centers (spread across the canvas) ── */
const PARA_CENTERS: Record<string, { x: number; y: number }> = {
	Areas:     { x: 0,   y: 0 },
	Resources: { x: 80,  y: -40 },
	Archives:  { x: 80,  y: 40 },
	Projects:  { x: -80, y: 0 },
};

/* ── Sub-components ── */

function LoadGraphData({ data, dark }: { data: GraphData; dark: boolean }) {
	const loadGraph = useLoadGraph();

	useEffect(() => {
		const graph = new Graph();

		// Skip tier 1 nodes — they become background regions
		for (const node of data.nodes) {
			if (node.tier === 1) continue;
			const para = node.id.split('/')[0];
			const center = PARA_CENTERS[para] ?? { x: 0, y: 0 };
			// Cluster nodes around their PARA center with small random scatter
			const angle = Math.random() * Math.PI * 2;
			const radius = 8 + Math.random() * 15;
			graph.addNode(node.id, {
				x: center.x + Math.cos(angle) * radius,
				y: center.y + Math.sin(angle) * radius,
				size: nodeSize(node.tier, node.count),
				label: node.id.split('/').pop()!,
				color: hexForColor(node.color, dark),
				tier: node.tier,
				count: node.count,
				tierColor: node.color,
				para,
			});
		}

		for (const edge of data.edges) {
			if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
			const edgeKey = `${edge.source}--${edge.target}`;
			if (!graph.hasEdge(edgeKey)) {
				graph.addEdgeWithKey(edgeKey, edge.source, edge.target, {
					size: edge.type === 'hierarchy' ? 1.5 : 0.5,
					color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
					edgeType: edge.type,
				});
			}
		}

		// Pre-run ForceAtlas2 to settle the layout before first paint
		forceAtlas2.assign(graph, {
			iterations: 100,
			settings: {
				gravity: 3,
				scalingRatio: 8,
				slowDown: 4,
				barnesHutOptimize: true,
				adjustSizes: true,
			},
		});

		loadGraph(graph);
	}, [loadGraph, data, dark]);

	return null;
}

function ForceLayout() {
	const sigma = useSigma();
	const animRef = useRef<number>(0);

	useEffect(() => {
		const graph = sigma.getGraph();
		if (graph.order === 0) return;

		// Graph is already pre-settled (100 iterations in LoadGraphData).
		// Run a lighter pass to fine-tune with increasing slowDown.
		let iteration = 0;
		const maxIterations = 120;

		function tick() {
			if (iteration >= maxIterations) return;
			forceAtlas2.assign(graph, {
				iterations: 1,
				settings: {
					gravity: 3,
					scalingRatio: 6,
					slowDown: 6 + iteration * 0.1,
					barnesHutOptimize: true,
					adjustSizes: true,
				},
			});
			iteration++;
			sigma.refresh();
			animRef.current = requestAnimationFrame(tick);
		}

		const timer = setTimeout(() => {
			animRef.current = requestAnimationFrame(tick);
		}, 50);

		return () => {
			clearTimeout(timer);
			cancelAnimationFrame(animRef.current);
		};
	}, [sigma]);

	return null;
}

function HullOverlay({ dark, canvasRef }: { dark: boolean; canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
	const sigma = useSigma();

	useEffect(() => {
		const handler = () => {
			const graph = sigma.getGraph();
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const { width, height } = sigma.getDimensions();
			const dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			// Group nodes by PARA category
			const groups = new Map<string, { points: Pt[]; color: string }>();

			graph.forEachNode((nodeId, attrs) => {
				const para = attrs.para as string;
				if (!para) return;
				const pos = sigma.graphToViewport({ x: attrs.x as number, y: attrs.y as number });
				if (!groups.has(para)) {
					groups.set(para, { points: [], color: attrs.tierColor as string });
				}
				groups.get(para)!.points.push([pos.x, pos.y]);
			});

			ctx.save();
			ctx.clearRect(0, 0, width, height);

			for (const [para, { points, color }] of groups) {
				if (points.length < 1) continue;

				const hex = hexForColor(color, dark);
				const fillAlpha = dark ? 0.08 : 0.06;
				const strokeAlpha = dark ? 0.2 : 0.15;

				const hull = paddedHull(points, 40);
				ctx.beginPath();
				drawSmoothHull(ctx, hull);

				ctx.fillStyle = hex + Math.round(fillAlpha * 255).toString(16).padStart(2, '0');
				ctx.fill();
				ctx.strokeStyle = hex + Math.round(strokeAlpha * 255).toString(16).padStart(2, '0');
				ctx.lineWidth = 1.5;
				ctx.stroke();

				// Draw PARA label at centroid
				const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
				const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
				const minY = Math.min(...points.map((p) => p[1]));

				ctx.font = 'bold 11px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillStyle = hex + Math.round((dark ? 0.5 : 0.4) * 255).toString(16).padStart(2, '0');
				ctx.fillText(para, cx, minY - 20);
			}

			ctx.restore();
		};

		sigma.on('afterRender', handler);
		return () => {
			sigma.off('afterRender', handler);
		};
	}, [sigma, dark]);

	return null;
}

function GraphInteractions() {
	const sigma = useSigma();
	const graph = sigma.getGraph();
	const registerEvents = useRegisterEvents();
	const setSettings = useSetSettings();
	const [hoveredNode, setHoveredNode] = useState<string | null>(null);
	const dragRef = useRef<{ node: string; startX: number; startY: number } | null>(null);

	useEffect(() => {
		registerEvents({
			enterNode: (e) => setHoveredNode(e.node),
			leaveNode: () => setHoveredNode(null),
			downNode: (e) => {
				const pos = sigma.viewportToGraph(e.event);
				dragRef.current = { node: e.node, startX: pos.x, startY: pos.y };
				sigma.getCamera().disable();
			},
			mousemovebody: (e) => {
				if (!dragRef.current) return;
				const pos = sigma.viewportToGraph(e);
				graph.setNodeAttribute(dragRef.current.node, 'x', pos.x);
				graph.setNodeAttribute(dragRef.current.node, 'y', pos.y);
			},
			mouseup: () => {
				if (dragRef.current) {
					sigma.getCamera().enable();
					dragRef.current = null;
				}
			},
			clickNode: (e) => {
				if (dragRef.current) {
					const pos = sigma.viewportToGraph(e.event);
					const dist = Math.hypot(
						pos.x - dragRef.current.startX,
						pos.y - dragRef.current.startY,
					);
					if (dist > 5) return;
				}
				const slug = e.node
					.split('/')
					.map(encodeURIComponent)
					.join('/');
				window.location.href = `/tags/${slug}/`;
			},
		});
	}, [registerEvents, sigma, graph]);

	useEffect(() => {
		if (!hoveredNode) {
			setSettings({ nodeReducer: undefined, edgeReducer: undefined });
			return;
		}

		const neighbors = new Set(graph.neighbors(hoveredNode));
		neighbors.add(hoveredNode);

		setSettings({
			nodeReducer: (node: string, data: Record<string, unknown>) => {
				if (neighbors.has(node)) {
					return { ...data, highlighted: true, zIndex: 1 };
				}
				return { ...data, color: '#94a3b8', highlighted: false, label: '', zIndex: 0 };
			},
			edgeReducer: (edge: string, data: Record<string, unknown>) => {
				const source = graph.source(edge);
				const target = graph.target(edge);
				if (neighbors.has(source) && neighbors.has(target)) {
					return { ...data, size: ((data.size as number) ?? 1) * 2, zIndex: 1 };
				}
				return { ...data, color: 'rgba(148,163,184,0.08)', zIndex: 0 };
			},
		});
	}, [hoveredNode, setSettings, graph]);

	return null;
}

/* ── Main ── */

export default function TagGraph({ data }: { data: GraphData }) {
	const [dark, setDark] = useState(false);
	const hullCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		setDark(document.documentElement.classList.contains('dark'));
		const observer = new MutationObserver(() => {
			setDark(document.documentElement.classList.contains('dark'));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	}, []);

	return (
		<div
			className="w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative"
			style={{ height: '500px' }}
		>
			<canvas
				ref={hullCanvasRef}
				className="absolute inset-0 pointer-events-none"
				style={{ zIndex: 1 }}
			/>
			<SigmaContainer
				style={{ width: '100%', height: '100%', background: 'transparent' }}
				settings={{
					renderLabels: true,
					labelDensity: 0.15,
					labelRenderedSizeThreshold: 4,
					labelSize: 12,
					labelWeight: 'bold',
					labelColor: { color: dark ? '#e2e8f0' : '#1e293b' },
					defaultNodeColor: dark ? '#60a5fa' : '#3b82f6',
					defaultEdgeColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
					defaultEdgeType: 'line',
					enableEdgeEvents: false,
					zIndex: true,
					minCameraRatio: 0.3,
					maxCameraRatio: 3,
				}}
			>
				<LoadGraphData data={data} dark={dark} />
				<ForceLayout />
				<HullOverlay dark={dark} canvasRef={hullCanvasRef} />
				<GraphInteractions />
			</SigmaContainer>
		</div>
	);
}
