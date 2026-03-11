/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WhiteboardProps {
    isMentor: boolean;
    color: string;
    brushSize: number;
    isEraser: boolean;
    socket: any;
    formId: string;
    undoTrigger?: number;
}

export default function Whiteboard({
    isMentor,
    color,
    brushSize,
    isEraser,
    socket,
    formId,
    undoTrigger
}: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const historyRef = useRef<any[]>([]);

    const drawData = useCallback((data: any) => {
        const context = contextRef.current;
        if (!context) return;

        const { x0, y0, x1, y1, color, size } = data;
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = size;
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        context.closePath();
    }, []);

    const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const dotSize = 1.5;
        const spacing = 35;
        const dpr = window.devicePixelRatio || 1;

        ctx.save();
        ctx.fillStyle = '#e5e7eb'; // Light gray for dots

        for (let x = spacing; x < width / dpr; x += spacing) {
            for (let y = spacing; y < height / dpr; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }, []);

    const redrawHistory = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        context.clearRect(0, 0, width, height);

        // Draw Grid
        drawGrid(context, canvas.width, canvas.height);

        historyRef.current.forEach(drawData);
    }, [drawData, drawGrid]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        const dpr = window.devicePixelRatio || 1;
        context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        historyRef.current = [];
        redrawHistory(); // To redraw grid

        if (isMentor) {
            socket.emit('live_board:action', { formId, action: 'clear' });
        }
    }, [formId, isMentor, socket, redrawHistory]);

    const undoAction = useCallback(() => {
        historyRef.current.pop();
        redrawHistory();
        if (isMentor) {
            socket.emit('live_board:action', { formId, action: 'undo' });
        }
    }, [formId, isMentor, socket, redrawHistory]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle high DPI displays
        const setCanvasSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                const context = canvas.getContext('2d');
                if (context) {
                    context.scale(dpr, dpr);
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = color;
                    context.lineWidth = brushSize;
                    contextRef.current = context;

                    // Redraw history if resized
                    redrawHistory();
                }
            }
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Socket listeners for participants
        if (!isMentor && socket) {
            socket.on('live_board:draw', (data: any) => {
                historyRef.current.push(data);
                drawData(data);
            });

            socket.on('live_board:action', (action: string) => {
                if (action === 'clear') {
                    clearCanvas();
                } else if (action === 'undo') {
                    undoAction();
                }
            });

            socket.on('live_board:history', (history: any[]) => {
                historyRef.current = history;
                redrawHistory();
            });
        }

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            if (socket) {
                socket.off('live_board:draw');
                socket.off('live_board:action');
                socket.off('live_board:history');
            }
        };
    }, [socket, isMentor, clearCanvas, drawData, redrawHistory, undoAction, color, brushSize]);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = isEraser ? '#ffffff' : color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize, isEraser]);

    useEffect(() => {
        if (undoTrigger) undoAction();
    }, [undoTrigger, undoAction]);

    const lastPointRef = useRef<{ x: number, y: number } | null>(null);

    const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isMentor) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        setIsDrawing(true);
        lastPointRef.current = { x: offsetX, y: offsetY };
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isMentor) return;

        // Prevent scrolling while drawing on mobile
        if (event.type === 'touchmove') {
            event.preventDefault();
        }

        const { offsetX, offsetY } = getCoordinates(event.nativeEvent);
        const context = contextRef.current;
        if (!context || !lastPointRef.current) return;

        const data = {
            x0: lastPointRef.current.x,
            y0: lastPointRef.current.y,
            x1: offsetX,
            y1: offsetY,
            color: isEraser ? '#ffffff' : color,
            size: brushSize
        };

        drawData(data);
        historyRef.current.push(data);
        socket.emit('live_board:draw', { formId, data });

        // Update last point to current point for next segment
        lastPointRef.current = { x: offsetX, y: offsetY };
    };

    const stopDrawing = () => {
        if (!isMentor) return;
        setIsDrawing(false);
        lastPointRef.current = null;
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
        return {
            offsetX: (event as any).offsetX,
            offsetY: (event as any).offsetY
        };
    };

    return (
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
                cursor: isMentor ? (isEraser ? 'crosshair' : 'pencil') : 'default',
                background: '#fff',
                display: 'block'
            }}
        />
    );
}
