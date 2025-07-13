import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

export function ExpeditionsTableSkeleton() {
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Ruína</TableHead>
                        <TableHead>País</TableHead>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim/Progresso</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(10)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell></TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-28" />
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, avatarIndex) => (
                                            <Skeleton key={avatarIndex} className="h-6 w-6 rounded-full" />
                                        ))}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-16 rounded-full" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-8 rounded" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 