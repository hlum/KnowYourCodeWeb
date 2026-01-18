import { useEffect, useRef } from 'react';

export function ThreadsBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas size
		const setCanvasSize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		setCanvasSize();
		window.addEventListener('resize', setCanvasSize);

		// Thread configuration
		const threads: Array<{
			x: number;
			y: number;
			length: number;
			angle: number;
			speed: number;
			color: string;
			width: number;
		}> = [];

		const colors = [
			'rgba(139, 92, 246, 0.1)', // purple
			'rgba(236, 72, 153, 0.1)', // pink
			'rgba(59, 130, 246, 0.1)', // blue
			'rgba(34, 211, 238, 0.1)', // cyan
		];

		// Create threads
		for (let i = 0; i < 50; i++) {
			threads.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				length: Math.random() * 200 + 100,
				angle: Math.random() * Math.PI * 2,
				speed: Math.random() * 0.5 + 0.2,
				color: colors[Math.floor(Math.random() * colors.length)],
				width: Math.random() * 2 + 1,
			});
		}

		let animationFrameId: number;

		const animate = () => {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			threads.forEach((thread) => {
				// Update position
				thread.x += Math.cos(thread.angle) * thread.speed;
				thread.y += Math.sin(thread.angle) * thread.speed;

				// Wrap around edges
				if (thread.x < 0) thread.x = canvas.width;
				if (thread.x > canvas.width) thread.x = 0;
				if (thread.y < 0) thread.y = canvas.height;
				if (thread.y > canvas.height) thread.y = 0;

				// Slowly change angle
				thread.angle += (Math.random() - 0.5) * 0.05;

				// Draw thread
				ctx.beginPath();
				ctx.moveTo(thread.x, thread.y);
				const endX = thread.x + Math.cos(thread.angle) * thread.length;
				const endY = thread.y + Math.sin(thread.angle) * thread.length;
				ctx.lineTo(endX, endY);
				ctx.strokeStyle = thread.color;
				ctx.lineWidth = thread.width;
				ctx.lineCap = 'round';
				ctx.stroke();
			});

			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener('resize', setCanvasSize);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ opacity: 0.4 }} />;
}
