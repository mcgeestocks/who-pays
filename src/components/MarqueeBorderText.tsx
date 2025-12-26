import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

const DEFAULT_TEXT = "TOUCH TO START";
const TEXT_SEPARATOR = " • ";
const FONT_SIZE = 14;
const LETTER_SPACING = 1;
const PATH_INSET = FONT_SIZE + 4;
const TEXT_COLOR = "#94a3b8";
const ANIMATION_SPEED_PX_PER_SECOND = 30;
const FALLBACK_REPEAT_COUNT = 8;

type EdgePosition = "top" | "right" | "bottom" | "left";

type MarqueeBorderTextProps = {
  text?: string;
};

type ContainerSize = {
  width: number;
  height: number;
};

function repeatText(text: string, count: number): string {
  return text.repeat(count);
}

type EdgeStripProps = {
  position: EdgePosition;
  baseText: string;
  edgeLength: number;
};

function EdgeStrip({
  position,
  baseText,
  edgeLength,
}: EdgeStripProps): JSX.Element | null {
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [baseTextWidth, setBaseTextWidth] = useState(0);

  useEffect(() => {
    if (measureRef.current) {
      setBaseTextWidth(measureRef.current.getBoundingClientRect().width);
    }
  }, [baseText]);

  if (edgeLength <= 0) return null;

  const repeatCount =
    baseTextWidth > 0
      ? Math.max(2, Math.ceil((edgeLength * 2) / baseTextWidth) + 1)
      : FALLBACK_REPEAT_COUNT;

  const repeatedText = repeatText(baseText, repeatCount);

  const animationDuration =
    baseTextWidth > 0 ? baseTextWidth / ANIMATION_SPEED_PX_PER_SECOND : 5;

  const isVertical = position === "left" || position === "right";

  const containerClass = `edge-strip edge-strip-${position}`;

  const cssVars = {
    "--animation-duration": `${animationDuration}s`,
    "--base-text-width": `${baseTextWidth}px`,
  } as JSX.CSSProperties;

  return (
    <div className={containerClass} style={cssVars}>
      <span
        ref={measureRef}
        className="edge-strip-measure"
        style={{
          fontSize: FONT_SIZE,
          letterSpacing: LETTER_SPACING,
        }}
      >
        {baseText}
      </span>
      <span
        className="edge-strip-text"
        style={{
          color: TEXT_COLOR,
          fontSize: FONT_SIZE,
          letterSpacing: LETTER_SPACING,
          writingMode: isVertical ? "vertical-lr" : undefined,
        }}
      >
        {repeatedText}
      </span>
    </div>
  );
}

export function MarqueeBorderText({
  text = DEFAULT_TEXT,
}: MarqueeBorderTextProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const updateSize = (): void => {
      const { width, height } = element.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.round(width)),
        height: Math.max(0, Math.round(height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const baseText = `${text}${TEXT_SEPARATOR}`;
  const hasSize = size.width > 0 && size.height > 0;
  const horizontalLength = size.width - PATH_INSET * 2;
  const verticalLength = size.height - PATH_INSET * 2;

  const insetStyle = {
    "--path-inset": `${PATH_INSET}px`,
    "--font-size": `${FONT_SIZE}px`,
  } as JSX.CSSProperties;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={insetStyle}
      aria-hidden="true"
    >
      {hasSize && (
        <>
          <EdgeStrip
            position="top"
            baseText={baseText}
            edgeLength={horizontalLength}
          />
          <EdgeStrip
            position="right"
            baseText={baseText}
            edgeLength={verticalLength}
          />
          <EdgeStrip
            position="bottom"
            baseText={baseText}
            edgeLength={horizontalLength}
          />
          <EdgeStrip
            position="left"
            baseText={baseText}
            edgeLength={verticalLength}
          />
        </>
      )}
    </div>
  );
}
