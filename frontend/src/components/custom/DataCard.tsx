import { Building2 } from "lucide-react";
import { type Commune } from "@/models/commune";
import HoverInfos from "./HoverInfos";
import CSPTable from "./CSPTable";
import { Separator } from "@/components/ui/separator";

export default function DataCard({ data }: { data: Commune | null }) {

    return (
        <div className="flex flex-col w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border sm:mb-4">
            <h3 className="scroll-m-20 text-md tracking-tight mx-4 mt-2 mb-2">
                <Building2 className="inline-block mr-2" size={15} />
                Commune sélectionnée :
                <span className="font-bold text-(--color-foreground)">
                    {data ? ` ${data.libelle} (${data.code_commune.slice(0, 2)})` : " —"}
                </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t text-sm">
                <div className="px-4 py-2 sm:border-r">
                    <h4 className="mb-2">Population municipale</h4>
                    {data && data.population_municipale && <span className="font-extrabold text-base">
                        {data.population_municipale.toLocaleString("fr-FR")}
                    </span>}
                    {data && !data.population_municipale && <span className="text-base italic text-[0.6rem]">
                        Aucune donnée disponible pour cette commune.
                    </span>}
                    {!data && <span className="text-base font-extrabold ">&nbsp;—</span>}
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
                    {data && data.total_conseillers && <span className="font-extrabold text-base">{data.total_conseillers}</span>}
                    {data && !data.total_conseillers && <span className="text-base italic text-[0.6rem]">Aucune donnée disponible pour cette commune.</span>}
                    {!data && <span className="font-extrabold text-base">&nbsp;—</span>}
                </div>
            </div>
            <CSPTable data={data} />
            {!data && <span className="text-[0.6rem] text-(--color-secondary-foreground) text-center mt-4 mx-4">
                Aucune commune sélectionnée : veuillez en choisir une pour voir la répartition des élu.e.s par CSP.
            </span>}
            {data && data.csp.length === 0 && <span className="text-[0.6rem] text-(--color-secondary-foreground) text-center mt-4 mx-4">
                Aucune donnée disponible pour cette commune.
            </span>}
            <Separator className="my-4" />
            <div className="flex sm:flex-row flex-col justify-around mx-4 mb-4 gap-4">
                <div className="text-sm bg-(--color-background) rounded-xl flex-1 p-2">
                    <h4 className="mb-2">Taux de pauvreté</h4>
                    {data ? (data.taux_pauvrete && data.total_conseillers ?
                        <span className="font-extrabold text-base inline-block w-full text-center">
                            {data.taux_pauvrete} % soit {Math.round(data.taux_pauvrete * data.total_conseillers / 100)} élu.e.s
                        </span> :
                        <span className="italic text-[0.6rem]">
                            Aucune donnée disponible pour cette commune.</span>) :
                        <span className="font-extrabold text-base inline-block w-full text-center">&nbsp;—</span>}
                </div>
                <div className="text-sm bg-(--color-background) rounded-xl flex-1 p-2">
                    <h4 className="mb-2">Proportion de locataires</h4>
                    {data ? (data.total_locataires && data.total_loc_et_prop && data.total_conseillers ?
                        <span className="font-extrabold text-base inline-block w-full text-center">
                            {(data.total_locataires * 100 / data.total_loc_et_prop).toFixed(2)} % soit {Math.round(data.total_locataires / data.total_loc_et_prop * data.total_conseillers)} élu.e.s
                        </span> :
                        <span className="italic text-[0.6rem]">
                            Aucune donnée disponible pour cette commune.</span>) :
                        <span className="font-extrabold text-base inline-block w-full text-center">&nbsp;—</span>}
                </div>
            </div >
        </div >
    )
}