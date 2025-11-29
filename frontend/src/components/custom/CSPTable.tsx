import type { Commune } from "@/models/commune";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import HoverInfos from "@/components/custom/HoverInfos";
import { useEffect, useState } from "react";

export default function CSPTable({ data }: { data: Commune | null }) {
    const [totPopCSP, setTotPopCSP] = useState(0);

    // Somme des CSP pour calculer le ratio des conseillers et le poids
    useEffect(() => {
        if (!data) return;
        if (data.csp.length === 0) return;

        let somme = 0;
        for (const d of data.csp) {
            somme += d.population_csp;
        }
        setTotPopCSP(somme);
    }, [data])

    return (
        <Table className="text-sm w-full table-fixed sm:table-auto">
            <TableHeader>
                <TableRow className="bg-(--color-background) hover:bg-(--color-background)">
                    <TableHead className="wrap-break-word whitespace-normal w-1/3 sm:w-auto pl-4">
                        Catégories socio-professionnelles
                    </TableHead>
                    <TableHead className="text-center wrap-break-word whitespace-normal">
                        Poids dans le population
                    </TableHead>
                    <TableHead className="text-center wrap-break-word whitespace-normal">
                        Nombre d'élu.e.s
                        <HoverInfos>
                            Le ratio des CSP dans la population ne concerne que les personnes de 15 ans ou plus d'après&nbsp;
                            <a href="https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP" target="_blank" className="underline">
                                Recensement de la population - Exploitation complémentaire
                            </a>
                        </HoverInfos>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data && data.csp && data.csp.map((csp) => (
                    <TableRow key={csp.code_csp}>
                        <TableCell className="text-[0.75rem] sm:text-sm wrap-break-word whitespace-normal pl-4">{csp.libelle_csp}</TableCell>
                        <TableCell className="text-[0.75rem] sm:text-sm text-center">{(csp.population_csp / totPopCSP * 100).toFixed(2)} %</TableCell>
                        <TableCell className="text-[0.75rem] sm:text-sm text-center">{csp.nb_conseillers_csp}</TableCell>
                    </TableRow>))}
            </TableBody>
        </Table>
    )
}