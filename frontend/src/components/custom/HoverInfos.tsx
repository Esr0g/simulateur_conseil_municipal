import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircleIcon } from "lucide-react";
import { useState } from "react";

export default function HoverInfos({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <HoverCard open={open} onOpenChange={setOpen}>
            <HoverCardTrigger onClick={() => setOpen(!open)}><HelpCircleIcon className="inline-block mx-1" size={16} /></HoverCardTrigger>
            <HoverCardContent className="mx-4">
                {children}
            </HoverCardContent>
        </HoverCard>
    )
}