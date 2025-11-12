import { Building2 } from "lucide-react";
import { type CommuneCSP } from "@/models/commune";
import HoverInfos from "./HoverInfos";
import CSPTable from "./CSPTable";

export default function DataCard({ data }: { data: CommuneCSP }) {

    return (
        <div className="flex flex-col w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border sm:mb-4">
            <h3 className="scroll-m-20 text-md tracking-tight mx-4 mt-2 mb-2">
                <Building2 className="inline-block mr-2" size={15} />
                Commune sélectionnée :
                <span className="font-bold text-(--color-foreground)">
                    {data.length > 0 ? ` ${data[0].nom} (${data[0].code.slice(0, 2)})` : " —"}
                </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t text-sm">
                <div className="px-4 py-2 sm:border-r">
                    <h4 className="mb-2">Population municipale</h4>
                    <span className="font-extrabold text-base"> {(data && data.length > 0) ? data[0].pop_municipale.toLocaleString("fr-FR") : " —"}</span>
                </div>
                <div className="px-4 py-2 border-t sm:border-none">
                    <h4 className="mb-2">
                        Nombre de conseillers municipaux
                        <HoverInfos>
                            Le nombre de conseillers municipaux par commune a été calculé à partir du&nbsp;
                            <a className="underline" href="https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE" target="_blank">
                                Recensement de la population - Population de référence&nbsp;
                            </a>
                            et la clé de réparition issue du&nbsp;
                            <a className="underline" href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/" target="_blank">
                                code des collectivités territoriales.
                            </a>
                        </HoverInfos>
                    </h4>
                    <span className="font-extrabold text-base"> {(data && data.length > 0) ? data[0].nb_conseillers : " —"}</span>
                </div>
            </div>
            <CSPTable data={data} />
            {!data && <span className="text-[0.6rem] text-(--color-secondary-foreground) text-center m-4">
                Aucune commune sélectionnée veuillez en choisir une pour voir la répartition des élu.e.s par CSP.
            </span>}
        </div>
    )
}