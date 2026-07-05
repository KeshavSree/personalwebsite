import { MosaicBottomStrip, MosaicHill } from "@/app/components/mosaic";

// Interior-page background: the cultural mosaic laid as a quiet edge frame.
// A full-width bottom strip plus two asymmetric side hills, placed where the old
// botanical sprays sat (top-right + bottom-left). The top edge stays clear.
export function InteriorMosaicFrame() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <MosaicBottomStrip />
      <MosaicHill
        variant="a"
        side="right"
        className="right-[12px] top-24 hidden h-[340px] w-[75px] sm:block md:top-28"
      />
      <MosaicHill
        variant="b"
        side="left"
        className="bottom-40 left-[12px] hidden h-[320px] w-[71px] sm:block"
      />
    </div>
  );
}
