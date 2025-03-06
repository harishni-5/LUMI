import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export function TrelloIntegration() {
  const openTrello = () => {
    window.open('https://trello.com', '_blank');
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Trello</h3>
        </div>

        <Button onClick={openTrello} className="w-fit">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Trello
        </Button>
      </div>
    </Card>
  );
} 