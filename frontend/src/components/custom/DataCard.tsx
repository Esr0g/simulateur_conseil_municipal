import { ChartLine, MapPin } from "lucide-react";
import { type Commune, type CSP } from "@/models/commune";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import population from "@/assets/population.svg"
import elu from "@/assets/elu.svg"
import scase from "@/assets/case.svg"
import building from "@/assets/building.svg"
import home from "@/assets/home.svg"
import CustomPie from "./CustomPie";
import { Progress } from "../ui/progress";

export default function DataCard({ data }: { data: Commune | null }) {

    return (
        <>
            <Card className="sm:w-1/3 py-2 mt-4 bg-primary text-primary-foreground text-md">
                <CardContent className="flex items-center gap-2">
                    <MapPin />
                    <div>
                        <CardTitle className="font-normal mt-2">Commune Selectionnée</CardTitle>
                        <span className="font-extrabold text-xl inline-block my-1">{data ? ` ${data.libelle} (${data.code_commune.slice(0, 2)})` : " —"}</span>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 w-full my-2 gap-6 text-md mb-4">
                <Card className="py-4 bg-primary text-primary-foreground">
                    <CardHeader className="flex items-center gap-2">
                        <img src={population} alt="Population Municipale" className="w-7 h-7" />
                        <CardTitle className="font-normal">Population municipale</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-3 mb-2">
                        <span className="font-extrabold text-4xl">
                            {data ? data.population_municipale?.toLocaleString("fr-FR") : " —"}
                        </span>
                    </CardContent>
                </Card>
                <Card className="bg-[#F4EFD5] py-4 text-primary-foreground">
                    <CardHeader className="flex items-center gap-2">
                        <img src={elu} alt="conseillers.ères municipaux" className="w-6 h-6" />
                        <CardTitle className="font-normal">Nombre de conseillers.ères municipaux</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-3 mb-2">
                        <span className="font-extrabold text-4xl">
                            {data ? data.total_conseillers : " —"}
                        </span>
                    </CardContent>
                </Card>
                <Card className="bg-card pt-4">
                    <CardHeader className="flex items-center gap-2">
                        <img src={scase} alt="Ouvriers" className="w-7 h-7" />
                        <CardTitle>Ouvriers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={50} color="bg-[#1DAFDB]" />
                        {data && <CustomPie
                            data={data.csp.find((c) => c.code_csp === "6")}
                            nb_conseillers={data.total_conseillers}
                            color1="#1DAFDB"
                            color2="#F4EFD5" />}
                    </CardContent>
                </Card>
                <Card className="bg-card pt-4">
                    <CardHeader className="flex items-center gap-2">
                        <img src={building} alt="Employés" className="w-7 h-7" />
                        <CardTitle>Employés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && <CustomPie
                            data={data.csp.find((c) => c.code_csp === "5")}
                            nb_conseillers={data.total_conseillers}
                            color1="#2649AB"
                            color2="#F4EFD5" />}
                    </CardContent>
                </Card>
                <Card className="bg-card pt-4">
                    <CardHeader className="flex items-center gap-2">
                        <ChartLine size={30} color="#FFB863" />
                        <CardTitle>Sous le seuil de pauvreté</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && data.taux_pauvrete && data.total_conseillers && <CustomPie
                            data={{
                                code_csp: "",
                                libelle_csp: "Sous le seuil de pauvreté",
                                nb_conseillers_csp: Math.round(data.taux_pauvrete * data.total_conseillers / 100),
                                population_csp: 0
                            } satisfies CSP}
                            nb_conseillers={data.total_conseillers}
                            color1="#FFB863"
                            color2="#F4EFD5" />}
                    </CardContent>
                </Card>
                <Card className="bg-card pt-4">
                    <CardHeader className="flex items-center gap-2">
                        <img src={home} alt="Locataire" className="w-7 h-7" />
                        <CardTitle>Locataires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && data.total_locataires && data.total_conseillers && data.total_loc_et_prop && <CustomPie
                            data={{
                                code_csp: "",
                                libelle_csp: "Locataires",
                                nb_conseillers_csp: Math.round(data.total_conseillers * data.total_locataires / data.total_loc_et_prop),
                                population_csp: 0
                            } satisfies CSP}
                            nb_conseillers={data.total_conseillers}
                            color1="#5AD192"
                            color2="#F4EFD5" />}
                    </CardContent>
                </Card>
            </div >
        </>
    )
    // return (
    //     <div
    //         className="flex flex-col w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border sm:mb-4 ">
    //         <h3 className="scroll-m-20 text-xl tracking-tight mx-4 mt-2 mb-2">
    //             <Building2 className="inline-block mr-2" size={20} />
    //             Commune sélectionnée :
    //             <span className="font-bold text-(--color-foreground)">
    //                 {data ? ` ${data.libelle} (${data.code_commune.slice(0, 2)})` : " —"}
    //             </span>
    //         </h3>
    //         <div className="grid grid-cols-1 sm:grid-cols-2 border-t text-lg">
    //             <div className="px-4 py-2 sm:border-r">
    //                 <h4 className="mb-2">Population municipale</h4>
    //                 {data && data.population_municipale && <span className="font-bold">
    //                     {data.population_municipale.toLocaleString("fr-FR")}
    //                 </span>}
    //                 {data && !data.population_municipale && <span className="italic">
    //                     Aucune donnée disponible pour cette commune.
    //                 </span>}
    //                 {!data && <span className="text-base font-bold ">&nbsp;—</span>}
    //             </div>
    //             <div className="px-4 py-2 border-t sm:border-none text-lg">
    //                 <h4 className="mb-2">
    //                     Nombre de conseillers municipaux
    //                     <HoverInfos>
    //                         Le nombre de conseillers municipaux par commune a été calculé à partir du&nbsp;
    //                         <a className="underline" href="https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE" target="_blank">
    //                             Recensement de la population - Population de référence&nbsp;
    //                         </a>
    //                         et la clé de réparition issue du&nbsp;
    //                         <a className="underline" href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/" target="_blank">
    //                             code des collectivités territoriales.
    //                         </a>
    //                     </HoverInfos>
    //                 </h4>
    //                 {data && data.total_conseillers && <span className="font-bold">{data.total_conseillers}</span>}
    //                 {data && !data.total_conseillers && <span className="italic">Aucune donnée disponible pour cette commune.</span>}
    //                 {!data && <span className="font-bold text-base">&nbsp;—</span>}
    //             </div>
    //         </div>
    //         <CSPTable data={data} />
    //         {!data && <span className="text-base italic text-(--color-secondary-foreground) text-center mt-4 mx-4">
    //             Aucune commune sélectionnée : veuillez en choisir une pour voir la répartition des élu.e.s par CSP.
    //         </span>}
    //         {data && data.csp.length === 0 && <span className="text-base text-(--color-secondary-foreground) text-center mt-4 mx-4">
    //             Aucune donnée disponible pour cette commune.
    //         </span>}
    //         <Separator className="my-4" />
    //         <div className="flex sm:flex-row text-lg flex-col justify-around mx-4 mb-4 gap-4">
    //             <div className="bg-(--color-background) rounded-xl flex-1 p-2">
    //                 <h4 className="mb-2">Taux de pauvreté</h4>
    //                 {data ? (data.taux_pauvrete && data.total_conseillers ?
    //                     <span className="font-bold inline-block w-full text-center">
    //                         {data.taux_pauvrete} % soit {Math.round(data.taux_pauvrete * data.total_conseillers / 100)} élu.e.s
    //                     </span> :
    //                     <span className="italic text-base">
    //                         Aucune donnée disponible pour cette commune.</span>) :
    //                     <span className="font-bold text-base inline-block w-full text-center">&nbsp;—</span>}
    //             </div>
    //             <div className=" bg-(--color-background) rounded-xl flex-1 p-2">
    //                 <h4 className="mb-2">Proportion de locataires</h4>
    //                 {data ? (data.total_locataires && data.total_loc_et_prop && data.total_conseillers ?
    //                     <span className="font-bold inline-block w-full text-center">
    //                         {(data.total_locataires * 100 / data.total_loc_et_prop).toFixed(2)} % soit {Math.round(data.total_locataires / data.total_loc_et_prop * data.total_conseillers)} élu.e.s
    //                     </span> :
    //                     <span className="italic text-base">
    //                         Aucune donnée disponible pour cette commune.</span>) :
    //                     <span className="font-bold text-base inline-block w-full text-center">&nbsp;—</span>}
    //             </div>
    //         </div >
    //     </div >
    // )
}