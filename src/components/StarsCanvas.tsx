import { useEffect, useRef } from "react";

export default function StarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const stars = Array.from({ length: 1000 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      offset: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      stars.forEach((star) => {
        const opacity = 0.3 + Math.sin(time * 0.001 * star.speed + star.offset) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
