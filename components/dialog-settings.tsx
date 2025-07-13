import { DarkModeToggle } from "./dark-mode-toggle";
import { Separator } from "./ui/separator";

export default function DiaglogSettings() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span>Interface theme</span>
                    <span className="text-muted-foreground text-sm">Customize your application theme</span>
                </div>
                <DarkModeToggle />
            </div>
            <Separator />
            </div>
    )
}