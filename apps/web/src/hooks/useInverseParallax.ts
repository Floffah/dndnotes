import { useEffect } from "react";

export function useInverseParallax(opts: {
    maxBias?: number;

    onUpdate: (x: number, y: number) => void;
}) {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const xBias =
                (e.clientX / window.innerWidth - 0.5) * (opts.maxBias ?? 20);
            const yBias =
                (e.clientY / window.innerHeight - 0.5) * (opts.maxBias ?? 20);

            opts.onUpdate(-xBias, -yBias);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [opts]);
}
