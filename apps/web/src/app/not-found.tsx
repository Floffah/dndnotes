"use client";

import emptyField from "@public/images/emptyField.png";
import { animated, useSpringValue } from "@react-spring/web";
import Image from "next/image";

import HomeIcon from "~icons/mdi/home";

import { Button } from "@dndnotes/components";

import { useInverseParallax } from "@/hooks/useInverseParallax";

const AnimatedImage = animated(Image);

export default function NotFound() {
    const translateX = useSpringValue(0);
    const translateY = useSpringValue(0);

    useInverseParallax({
        maxBias: 20,
        onUpdate: (x, y) => {
            translateX.start(x);
            translateY.start(y);
        },
    });

    return (
        <div className="fixed -left-5 -top-5 z-10 flex h-[calc(100vh+2.5rem)] w-[calc(100vw+2.5rem)] items-center justify-center">
            <AnimatedImage
                src={emptyField}
                alt="empty field"
                placeholder="blur"
                className="absolute h-full w-full scale-150 object-cover"
                style={{
                    translateX: translateX.to((x) => `${x}px`),
                    translateY: translateY.to((y) => `${y}px`),
                }}
            />

            <div className="absolute inset-0 z-10 h-full w-full bg-black/30" />

            <main className="z-20 flex max-w-md flex-col">
                <h1 className="text-4xl font-semibold">Whoops!</h1>
                <p className="text-lg font-light">
                    Looks like you&apos;re lost
                </p>
                <Button
                    size="md"
                    color="primary"
                    icon={<HomeIcon />}
                    link="/home"
                >
                    Go Home
                </Button>
            </main>
        </div>
    );
}
