import { getInvolvements } from "@/data/involvementData";
import { InvolvementClient } from "./InvolvementClient";
import { HashScroller } from "@/app/components/HashScroller";

export default function InvolvementPage() {
  const involvements = getInvolvements();
  return (
    <>
      <HashScroller />
      <InvolvementClient involvements={involvements} />
    </>
  );
}
