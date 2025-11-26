import { fetchCommuneData, type BaseCommune, type Commune } from "@/models/commune";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/custom/SearchBar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function SearchCard({ onDataSet, data }: { onDataSet: (data: Commune | null) => void, data: Commune | null }) {
    const [commune, setCommune] = useState<BaseCommune | null>(null);
    let navigate = useNavigate();
    const { code } = useParams<{ code?: string }>();

    // Récupère les communes soit quand un code est présent dans l'url soit lorque le bouton "simuler" est pressé
    const fetchData = async () => {
        if (!commune && !code) return;

        const data_tmp = await fetchCommuneData(commune?.code_commune || code || "")
        if (data_tmp === null) {
            navigate("/", { replace: true });
            return;
        }

        setCommune({ libelle: data_tmp.libelle, code_commune: data_tmp.code_commune, code_postal: data_tmp.code_postal })
        onDataSet(data_tmp);

        navigate(`/${data_tmp.code_commune}`, { replace: true })
    }

    // Permet de retirer de l'url le code si invalide
    useEffect(() => {
        if (!code) return;

        if (!/^[0-9]{5}$/.test(code)) {
            navigate("/");
            return;
        }

        setCommune({ libelle: "", code_commune: code, code_postal: [] })
        fetchData();
    }, [code, navigate])

    const isButtonDisabled = (): boolean => {
        if (!commune) return true;
        if (data && data.code_commune === commune.code_commune) return true;
        return false;
    }

    return (
        <div className="flex flex-col gap-1 w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border px-4 py-2.5">
            <h3 className="scroll-m-20 text-md tracking-tight">Sélectionner une commune</h3>
            <div className="flex flex-col sm:flex-row sm:gap-4 sm:items-center">
                <SearchBar onChange={setCommune} />
                <Button variant="default" className="self-center mt-2 sm:mt-0  sm:mr" onClick={fetchData} disabled={isButtonDisabled()}>
                    <Play /> Simuler
                </Button>
            </div>
        </div>
    )
}