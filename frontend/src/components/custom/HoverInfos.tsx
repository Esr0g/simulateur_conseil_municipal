import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircleIcon } from "lucide-react";

export default function HoverInfos({ children }: { children: React.ReactNode }) {

    return (
        <HoverCard>
            <HoverCardTrigger><HelpCircleIcon className="inline-block mx-1" size={13} /></HoverCardTrigger>
            <HoverCardContent className="text-[0.6rem]">
                {children}
            </HoverCardContent>
        </HoverCard>
    )
}