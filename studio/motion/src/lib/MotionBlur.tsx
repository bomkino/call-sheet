import type React from "react";
import {
  AbsoluteFill,
  Freeze,
  getRemotionEnvironment,
  HtmlInCanvas,
  type HtmlInCanvasOnPaint,
  isHtmlInCanvasSupported,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Sub-frame motion blur, after @remotion/motion-blur's HtmlInCanvasMotionBlur,
// with one change: samples are averaged in half-float, with weights that add up
// exactly. That component sums them in 8-bit and rounds every sample, so
// colours drift as the count grows (the pink #f7a3d3 renders as #ffc4ff at 64
// samples).
const Sample: React.FC<{
  readonly children: React.ReactNode;
  readonly offset: number;
  readonly first: boolean;
  readonly width: number;
  readonly height: number;
}> = ({ children, offset, first, width, height }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const at = Math.min(durationInFrames - 1, Math.max(0, frame + offset));
  return (
    <div
      {...(first ? {} : { drawable: "" })}
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        isolation: "isolate",
      }}
    >
      <Freeze frame={at}>{children}</Freeze>
    </div>
  );
};

// Each sample is drawn at full strength into the 8-bit paint target, then added
// into a half-float accumulator, so the only rounding is the final copy back.
let accumulator: OffscreenCanvas | null = null;

// Chrome rounds globalAlpha to whole 1/255 steps, so a 1/N weight per sample
// doesn't add up to 1: 48 samples sum to 94% brightness and 96 to 113%.
// Instead each sample gets a whole number of steps, spread evenly, that add up
// to exactly 255.
const weights = (n: number) => {
  if (n > 255) throw new Error("MotionBlur: use at most 255 samples");
  return Array.from(
    { length: n },
    (_, i) => Math.floor(((i + 1) * 255) / n) - Math.floor((i * 255) / n),
  );
};

const onPaint: HtmlInCanvasOnPaint = ({ canvas, element, elementImage }) => {
  const ctx = canvas.getContext("2d");
  const layout = element.parentElement;
  if (!ctx || !(layout instanceof HTMLCanvasElement)) {
    throw new Error("MotionBlur: the HTML-in-canvas layout is not ready");
  }
  if (
    !accumulator ||
    accumulator.width !== canvas.width ||
    accumulator.height !== canvas.height
  ) {
    accumulator = new OffscreenCanvas(canvas.width, canvas.height);
  }
  const sum = accumulator.getContext("2d", {
    colorType: "float16",
  } as CanvasRenderingContext2DSettings);
  if (!sum) throw new Error("MotionBlur: no half-float canvas");
  const samples = Array.from(layout.children);
  const steps = weights(samples.length);
  sum.reset();
  sum.globalCompositeOperation = "lighter";
  samples.forEach((sample, i) => {
    const image = i === 0 ? elementImage : layout.captureElementImage(sample);
    try {
      ctx.reset();
      ctx.drawElementImage(image, 0, 0);
      sum.globalAlpha = steps[i] / 255;
      sum.drawImage(canvas, 0, 0);
    } finally {
      if (i !== 0) image.close();
    }
  });
  ctx.reset();
  ctx.drawImage(accumulator, 0, 0);
};

export const MotionBlur: React.FC<{
  readonly children: React.ReactNode;
  readonly width: number;
  readonly height: number;
  readonly samples: number;
  readonly shutterAngle: number;
}> = ({ children, width, height, samples, shutterAngle }) => {
  // The Studio preview runs in your own browser, which can only draw HTML into
  // a canvas from Chrome 149 with chrome://flags/#canvas-draw-element on.
  // Without it the preview plays unblurred; renders always blur, in Remotion's
  // own Chromium.
  if (!getRemotionEnvironment().isRendering && !isHtmlInCanvasSupported()) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  // Samples spread evenly across a shutter centred on the frame.
  const layers = Array.from({ length: samples }, (_, i) => (
    <Sample
      key={i}
      offset={((i + 0.5) / samples - 0.5) * (shutterAngle / 360)}
      first={i === 0}
      width={width}
      height={height}
    >
      {children}
    </Sample>
  ));
  return (
    <HtmlInCanvas
      width={width}
      height={height}
      onPaint={onPaint}
      _remotionInternalCanvasSiblings={layers.slice(1)}
    >
      {layers[0]}
    </HtmlInCanvas>
  );
};
