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

    const redrawHistory = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas) return;

        context.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        historyRef.current.forEach(drawData);
    }, [drawData]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;
        context.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        historyRef.current = [];
        if (isMentor) {
            socket.emit('live_board:action', { formId, action: 'clear' });
        }
    }, [formId, isMentor, socket]);

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

    const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isMentor) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        setIsDrawing(true);
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
    };

    const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isMentor) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        const context = contextRef.current;
        if (!context) return;

        const lastPoint = historyRef.current[historyRef.current.length - 1];
        const prevX = lastPoint ? lastPoint.x1 : offsetX;
        const prevY = lastPoint ? lastPoint.y1 : offsetY;

        const data = {
            x0: prevX,
            y0: prevY,
            x1: offsetX,
            y1: offsetY,
            color: isEraser ? '#ffffff' : color,
            size: brushSize
        };

        drawData(data);
        historyRef.current.push(data);
        socket.emit('live_board:draw', { formId, data });
    };

    const stopDrawing = () => {
        if (!isMentor) return;
        setIsDrawing(false);
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
