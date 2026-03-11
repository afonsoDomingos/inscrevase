/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface WhiteboardProps {
    isMentor: boolean;
    color: string;
    brushSize: number;
    isEraser: boolean;
    socket: any;
    formId: string;
    undoTrigger?: number;
    tool: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'laser' | 'text' | 'select';
    isDark?: boolean;
    backgroundImage?: string | null;
}

const Whiteboard = forwardRef(({
    isMentor,
    color,
    brushSize,
    isEraser,
    socket,
    formId,
    undoTrigger,
    tool,
    isDark = false,
    backgroundImage = null
}: WhiteboardProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const bgContextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState<number>(-1);
    const historyRef = useRef<any[]>([]);
    const currentStrokeIdRef = useRef<string>('');

    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const redrawHistoryRef = useRef<() => void>(() => { });

    const drawData = useCallback((data: any) => {
        const context = contextRef.current;
        if (!context) return;

        const { type, x0, y0, x1, y1, color, size, text, src } = data;

        context.save();
        context.beginPath();
        if (type === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
            context.strokeStyle = 'rgba(0,0,0,1)';
            context.fillStyle = 'rgba(0,0,0,1)';
        } else {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = color;
            context.fillStyle = color;
        }

        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        if (!type || type === 'pen' || type === 'eraser') {
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
        } else if (type === 'rectangle') {
            context.strokeRect(x0, y0, (x1 - x0) || 5, (y1 - y0) || 5);
        } else if (type === 'circle') {
            const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
            context.arc(x0, y0, radius, 0, Math.PI * 2);
            context.stroke();
        } else if (type === 'arrow') {
            const headlen = 15;
            const angle = Math.atan2(y1 - y0, x1 - x0);
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6), y1 - headlen * Math.sin(angle - Math.PI / 6));
            context.moveTo(x1, y1);
            context.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6), y1 - headlen * Math.sin(angle + Math.PI / 6));
            context.stroke();
        } else if (type === 'text' && text) {
            context.font = `bold ${size * 6}px system-ui, -apple-system, sans-serif`;
            context.textBaseline = 'top';
            context.fillText(text, x0, y0);
            context.closePath();
        } else if (type === 'image' && src) {
            if (!imageCache.current.has(src)) {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    imageCache.current.set(src, img);
                    redrawHistoryRef.current();
                };
            } else {
                const cachedImg = imageCache.current.get(src);
                if (cachedImg) {
                    context.drawImage(cachedImg, x0, y0, (x1 - x0) || cachedImg.width, (y1 - y0) || cachedImg.height);
                }
            }
        }

        context.restore();
    }, []);

    const redrawHistory = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        context.clearRect(0, 0, width, height);
        historyRef.current.forEach(drawData);

        // Draw selection UI
        if (selectedShapeIndex >= 0 && isMentor && tool === 'select') {
            const item = historyRef.current[selectedShapeIndex];
            if (item) {
                context.save();
                context.strokeStyle = '#0ea5e9';
                context.lineWidth = 2;
                context.setLineDash([5, 5]);

                let x = item.x0, y = item.y0, w = (item.x1 - item.x0), h = (item.y1 - item.y0);
                if (item.type === 'text') {
                    w = (item.text?.length || 0) * item.size * 3;
                    h = item.size * 5;
                } else if (item.type === 'circle') {
                    const radius = Math.sqrt(Math.pow(item.x1 - item.x0, 2) + Math.pow(item.y1 - item.y0, 2));
                    x = item.x0 - radius;
                    y = item.y0 - radius;
                    w = radius * 2;
                    h = radius * 2;
                }

                context.strokeRect(x - 5, y - 5, (w || 200) + 10, (h || 200) + 10);

                if (item.type === 'image' || item.type === 'rectangle' || item.type === 'circle' || item.type === 'arrow') {
                    context.setLineDash([]);
                    context.fillStyle = '#0ea5e9';
                    context.fillRect(x + (w || 200), y + (h || 200), 12, 12);
                }
                context.restore();
            }
        }
    }, [drawData, selectedShapeIndex, isMentor, tool]);

    useEffect(() => {
        redrawHistoryRef.current = redrawHistory;
    }, [redrawHistory]);

    useImperativeHandle(ref, () => ({
        addExternalItem: (data: any) => {
            if (historyRef.current.some(item => item.strokeId === data.strokeId)) return;
            historyRef.current.push(data);
            drawData(data);
            if (data.type === 'image') redrawHistory();
        }
    }));

    const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const dotSize = 1.2;
        const spacing = 40;
        const dpr = window.devicePixelRatio || 1;

        ctx.save();
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        for (let x = spacing; x < width / dpr; x += spacing) {
            for (let y = spacing; y < height / dpr; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }, [isDark]);

    const redrawBg = useCallback(() => {
        const canvas = bgCanvasRef.current;
        const context = bgContextRef.current;
        if (!context || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        context.clearRect(0, 0, width, height);
        context.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
        context.fillRect(0, 0, width, height);

        if (backgroundImage) {
            const img = new Image();
            img.src = backgroundImage;
            img.onload = () => {
                const ratio = Math.min(width / img.width, height / img.height);
                const x = (width - img.width * ratio) / 2;
                const y = (height - img.height * ratio) / 2;
                context.drawImage(img, x, y, img.width * ratio, img.height * ratio);
                drawGrid(context, canvas.width, canvas.height);
            };
        } else {
            drawGrid(context, canvas.width, canvas.height);
        }
    }, [drawGrid, backgroundImage, isDark]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        const dpr = window.devicePixelRatio || 1;
        context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        historyRef.current = [];
        redrawHistory();

        if (isMentor) {
            socket.emit('live_board:action', { formId, action: 'clear' });
        }
    }, [formId, isMentor, socket, redrawHistory]);

    const undoAction = useCallback(() => {
        const arr = historyRef.current;
        if (arr.length > 0) {
            const lastItem = arr[arr.length - 1];
            if (lastItem.strokeId) {
                while (arr.length > 0 && arr[arr.length - 1].strokeId === lastItem.strokeId) {
                    arr.pop();
                }
            } else {
                arr.pop();
            }
        }
        redrawHistory();
        if (isMentor) {
            socket.emit('live_board:action', { formId, action: 'undo' });
        }
    }, [formId, isMentor, socket, redrawHistory]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setCanvasSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                const dpr = window.devicePixelRatio || 1;

                const bgCanvas = bgCanvasRef.current;
                if (bgCanvas) {
                    bgCanvas.width = rect.width * dpr;
                    bgCanvas.height = rect.height * dpr;
                    bgCanvas.style.width = `${rect.width}px`;
                    bgCanvas.style.height = `${rect.height}px`;
                    const bgCtx = bgCanvas.getContext('2d');
                    if (bgCtx) {
                        bgCtx.scale(dpr, dpr);
                        bgContextRef.current = bgCtx;
                    }
                }

                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                const context = canvas.getContext('2d', { alpha: true });
                if (context) {
                    context.scale(dpr, dpr);
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = color;
                    context.lineWidth = brushSize;
                    contextRef.current = context;

                    redrawBg();
                    redrawHistory();
                }
            }
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        if (socket) {
            socket.on('live_board:draw', (data: any) => {
                if (historyRef.current.some(item => item.strokeId === data.strokeId)) return;
                historyRef.current.push(data);
                drawData(data);
                if (data.type === 'image') redrawHistory();
            });

            socket.on('live_board:laser', (data: any) => {
                showLaser(data.x, data.y);
            });

            socket.on('live_board:action', (action: string) => {
                if (action === 'clear') clearCanvas();
                else if (action === 'undo') undoAction();
            });

            socket.on('live_board:history', (history: any[]) => {
                historyRef.current = history;
                redrawHistory();
            });

            socket.on('live_board:history_replace', (history: any[]) => {
                historyRef.current = history;
                redrawHistory();
            });
        }

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            if (socket) {
                socket.off('live_board:draw');
                socket.off('live_board:laser');
                socket.off('live_board:action');
                socket.off('live_board:history');
                socket.off('live_board:history_replace');
            }
        };
    }, [socket, isMentor, clearCanvas, drawData, redrawHistory, redrawBg, undoAction, color, brushSize, isDark, formId]);

    useEffect(() => {
        redrawBg();
    }, [redrawBg]);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    useEffect(() => {
        if (undoTrigger) undoAction();
    }, [undoTrigger, undoAction]);

    const lastPointRef = useRef<{ x: number, y: number } | null>(null);
    const [laserPos, setLaserPos] = useState<{ x: number, y: number } | null>(null);
    const [textInput, setTextInput] = useState<{ x: number, y: number } | null>(null);
    const laserTimeoutRef = useRef<any>(null);

    const showLaser = (x: number, y: number) => {
        setLaserPos({ x, y });
        if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
        laserTimeoutRef.current = setTimeout(() => setLaserPos(null), 1000);
    };

    const handleTextSubmit = (text: string) => {
        if (!textInput || !text) {
            setTextInput(null);
            return;
        }
        const data = {
            type: 'text',
            strokeId: Math.random().toString(36).substring(7),
            x0: textInput.x,
            y0: textInput.y,
            text,
            color,
            size: brushSize
        };
        drawData(data);
        historyRef.current.push(data);
        socket.emit('live_board:draw', { formId, data });
        setTextInput(null);
    };

    const selectedShapeIndexRef = useRef<number>(-1);
    const initialDragPosRef = useRef<{ x: number, y: number } | null>(null);

    const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isMentor) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);

        if (tool === 'text') {
            setTextInput({ x: offsetX, y: offsetY });
            return;
        }

        if (tool === 'select') {
            selectedShapeIndexRef.current = -1;
            setSelectedShapeIndex(-1);
            for (let i = historyRef.current.length - 1; i >= 0; i--) {
                const item = historyRef.current[i];
                let isHit = false;

                if (item.type === 'circle') {
                    const radius = Math.sqrt(Math.pow(item.x1 - item.x0, 2) + Math.pow(item.y1 - item.y0, 2));
                    const dist = Math.sqrt(Math.pow(offsetX - item.x0, 2) + Math.pow(offsetY - item.y0, 2));
                    if (dist <= radius + 15) isHit = true;
                } else if (['rectangle', 'arrow'].includes(item.type)) {
                    const minX = Math.min(item.x0, item.x1);
                    const maxX = Math.max(item.x0, item.x1);
                    const minY = Math.min(item.y0, item.y1);
                    const maxY = Math.max(item.y0, item.y1);
                    if (offsetX >= minX - 15 && offsetX <= maxX + 15 && offsetY >= minY - 15 && offsetY <= maxY + 15) isHit = true;
                } else if (item.type === 'text') {
                    const width = (item.text?.length || 0) * item.size * 3;
                    const height = item.size * 6;
                    if (offsetX >= item.x0 - 15 && offsetX <= item.x0 + width + 15 && offsetY >= item.y0 - 15 && offsetY <= item.y0 + height + 15) isHit = true;
                } else if (item.type === 'image') {
                    const width = (item.x1 - item.x0) || 200;
                    const height = (item.y1 - item.y0) || 200;
                    if (offsetX >= item.x0 - 15 && offsetX <= item.x0 + width + 15 && offsetY >= item.y0 - 15 && offsetY <= item.y0 + height + 15) {
                        isHit = true;
                        const isResizing = offsetX >= item.x0 + (width || 200) - 30 && offsetY >= item.y0 + (height || 200) - 30;
                        (selectedShapeIndexRef as any).isResizing = isResizing;
                    }
                }

                if (isHit) {
                    selectedShapeIndexRef.current = i;
                    setSelectedShapeIndex(i);
                    initialDragPosRef.current = { x: offsetX, y: offsetY };
                    setIsDrawing(true);
                    return;
                }
            }
            return;
        }

        currentStrokeIdRef.current = Math.random().toString(36).substring(7);
        setIsDrawing(true);
        lastPointRef.current = { x: offsetX, y: offsetY };

        if (tool === 'pen' || tool === 'eraser') {
            contextRef.current?.beginPath();
            contextRef.current?.moveTo(offsetX, offsetY);
        } else if (tool === 'laser') {
            showLaser(offsetX, offsetY);
            socket.emit('live_board:laser', { formId, x: offsetX, y: offsetY });
        }
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isMentor) return;
        const { offsetX, offsetY } = getCoordinates(event.nativeEvent);

        if (tool === 'laser') {
            if (event.type === 'touchmove') event.preventDefault();
            showLaser(offsetX, offsetY);
            socket.emit('live_board:laser', { formId, x: offsetX, y: offsetY });
            return;
        }

        if (!isDrawing) return;
        if (event.type === 'touchmove') event.preventDefault();

        if (tool === 'select' && selectedShapeIndexRef.current >= 0 && initialDragPosRef.current) {
            const dx = offsetX - initialDragPosRef.current.x;
            const dy = offsetY - initialDragPosRef.current.y;
            const shape = historyRef.current[selectedShapeIndexRef.current];
            const isResizing = (selectedShapeIndexRef as any).isResizing;

            let updatedShape;
            if (isResizing) {
                updatedShape = { ...shape, x1: (shape.x1 ?? (shape.x0 + 200)) + dx, y1: (shape.y1 ?? (shape.y0 + 200)) + dy };
            } else {
                updatedShape = { ...shape, x0: shape.x0 + dx, y0: shape.y0 + dy };
                if (shape.x1 !== undefined && shape.y1 !== undefined) {
                    updatedShape.x1 = shape.x1 + dx;
                    updatedShape.y1 = shape.y1 + dy;
                }
            }
            historyRef.current[selectedShapeIndexRef.current] = updatedShape;
            initialDragPosRef.current = { x: offsetX, y: offsetY };
            redrawHistory();
            return;
        }

        const context = contextRef.current;
        if (!context || !lastPointRef.current) return;

        if (tool === 'pen' || tool === 'eraser') {
            const data = {
                type: tool,
                strokeId: currentStrokeIdRef.current,
                x0: lastPointRef.current.x,
                y0: lastPointRef.current.y,
                x1: offsetX,
                y1: offsetY,
                color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
                size: tool === 'eraser' ? brushSize * 2 : brushSize
            };
            drawData(data);
            historyRef.current.push(data);
            socket.emit('live_board:draw', { formId, data });
            lastPointRef.current = { x: offsetX, y: offsetY };
        } else {
            redrawHistory();
            drawData({ type: tool, x0: lastPointRef.current.x, y0: lastPointRef.current.y, x1: offsetX, y1: offsetY, color, size: brushSize });
        }
    };

    const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isMentor || !isDrawing) return;

        if (tool === 'select') {
            setIsDrawing(false);
            if (selectedShapeIndexRef.current >= 0) {
                socket.emit('live_board:history_replace', { formId, history: historyRef.current });
            }
            return;
        }

        if (tool !== 'pen' && tool !== 'eraser' && tool !== 'laser' && lastPointRef.current) {
            const { offsetX, offsetY } = getCoordinates(event.nativeEvent);
            const data = { type: tool, strokeId: currentStrokeIdRef.current, x0: lastPointRef.current.x, y0: lastPointRef.current.y, x1: offsetX, y1: offsetY, color, size: brushSize };
            historyRef.current.push(data);
            socket.emit('live_board:draw', { formId, data });
            redrawHistory();
        }

        setIsDrawing(false);
        lastPointRef.current = null;
        currentStrokeIdRef.current = '';
        contextRef.current?.closePath();
    };

    const getCoordinates = (event: MouseEvent | TouchEvent | any) => {
        if ((event as any).touches) {
            const rect = canvasRef.current?.getBoundingClientRect();
            return {
                offsetX: (event as any).touches[0].clientX - (rect?.left || 0),
                offsetY: (event as any).touches[0].clientY - (rect?.top || 0)
            };
        }
        return { offsetX: (event as any).offsetX, offsetY: (event as any).offsetY };
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: isDark ? '#1a1a1a' : '#fff' }}>
            <canvas ref={bgCanvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }} />
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: isMentor ? (tool === 'laser' ? 'none' : (tool === 'select' ? 'default' : (isEraser ? 'crosshair' : 'pencil'))) : 'default',
                    display: 'block',
                    touchAction: 'none'
                }}
            />
            {laserPos && (
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ position: 'absolute', left: laserPos.x - 10, top: laserPos.y - 10, width: '20px', height: '20px', borderRadius: '50%', background: '#ff4757', boxShadow: '0 0 15px #ff4757, 0 0 30px #ff4757', pointerEvents: 'none', zIndex: 100 }}
                />
            )}
            {textInput && (
                <div style={{ position: 'absolute', left: textInput.x, top: textInput.y, zIndex: 200 }}>
                    <input
                        autoFocus
                        style={{ background: 'transparent', border: '1px dashed #ccc', color: color, font: `bold ${brushSize * 6}px system-ui, sans-serif`, outline: 'none', padding: '2px' }}
                        onBlur={(e) => handleTextSubmit(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTextSubmit(e.currentTarget.value);
                            if (e.key === 'Escape') setTextInput(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard;
