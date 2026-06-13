"use client";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { DealCard } from "@/components/deals/DealCard";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { DealStage } from "@/types/enums";
import type { Deal } from "@/types/database";

const STAGES = Object.values(DealStage);

interface DealsKanbanProps {
  deals: Deal[];
  onStageChange: (dealId: string, stage: DealStage) => void;
}

export function DealsKanban({ deals, onStageChange }: DealsKanbanProps) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const newStage = result.destination.droppableId as DealStage;
    if (newStage === result.source.droppableId) return;
    onStageChange(result.draggableId, newStage);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.dealStage === stage);
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{DEAL_STAGE_LABELS[stage]}</h3>
                <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
              </div>
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[100px] flex-1 flex-col gap-2 rounded-md border border-discord-border p-2 ${
                      snapshot.isDraggingOver ? "bg-discord-card" : "bg-discord-sidebar"
                    }`}
                  >
                    {stageDeals.map((deal, index) => (
                      <DealCard key={deal.id} deal={deal} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
