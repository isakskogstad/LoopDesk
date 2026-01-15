"use client";

import { useTools } from "./ToolProvider";
import { AllabolagTool } from "./allabolag/AllabolagTool";
import { BolagsverketTool } from "./bolagsverket/BolagsverketTool";
import { VinnovaTool } from "./vinnova/VinnovaTool";
import { KungorelserTool } from "./kungorelser/KungorelserTool";
import { RssTool } from "./rss/RssTool";

export function ToolHost() {
  const { activeTool, closeTool } = useTools();

  if (!activeTool) return null;

  const toolComponents = {
    allabolag: AllabolagTool,
    bolagsverket: BolagsverketTool,
    vinnova: VinnovaTool,
    kungorelser: KungorelserTool,
    rss: RssTool,
  };

  const ToolComponent = toolComponents[activeTool];

  if (!ToolComponent) return null;

  return <ToolComponent onClose={closeTool} />;
}
