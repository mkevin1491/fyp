// components/ui/nav.tsx

"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
    href: string;
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathName = usePathname();
  return (
    <TooltipProvider>
      <div
        className={`flex flex-col gap-4 py-2 ${
          isCollapsed ? "items-center" : "px-4"
        }`}
      >
        <nav className={`grid gap-1 ${isCollapsed ? "justify-center" : ""}`}>
          {links.map((link, index) => (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={link.href}>
                  <Button
                    variant={link.href === pathName ? "default" : "ghost"}
                    size={isCollapsed ? "icon" : "default"}
                    className={cn(
                      "w-full flex items-center gap-4",
                      isCollapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <>
                        {link.title}
                        {link.label && (
                          <span className="ml-auto text-muted-foreground">
                            {link.label}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  {link.label && (
                    <span className="ml-auto text-muted-foreground">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  );
}
