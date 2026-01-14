"use client";

import { useState } from "react";
import Link from "next/link";
import { useWidgetProps } from "../hooks";

export default function RandomNumberPage() {
  const toolOutput = useWidgetProps<{
    min?: number;
    max?: number;
    result?: number;
    structuredContent?: {
      min?: number;
      max?: number;
      result?: number;
    };
  }>();

  const data = toolOutput?.structuredContent || toolOutput;
  const initialMin = data?.min ?? 1;
  const initialMax = data?.max ?? 100;
  const initialResult = data?.result;

  const [number, setNumber] = useState<number | null>(initialResult ?? null);

  const generateNumber = () => {
    const newNumber = Math.floor(Math.random() * (initialMax - initialMin + 1)) + initialMin;
    setNumber(newNumber);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-black tracking-tight">Random Number</h1>
        <p className="font-mono text-sm/6 text-center sm:text-left tracking-[-.01em] max-w-xl">
          Generate a random number between {initialMin} and {initialMax}.
        </p>

        <div className="font-mono text-6xl font-bold tracking-tight text-center w-full">
          {number !== null ? number : "—"}
        </div>

        <button
          onClick={generateNumber}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"
        >
          Generate
        </button>

        <Link
          href="/"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Go to the main page
        </Link>
      </main>
    </div>
  );
}
