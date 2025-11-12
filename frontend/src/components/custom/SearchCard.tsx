import { fetchCommuneData, type BaseCommune, type CommuneCSP } from "@/models/commune";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/custom/SearchBar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function SearchCard({ onDataSet, data }: { onDataSet: (data: CommuneCSP) => void, data: CommuneCSP }) {
    const [commune, setCommune] = useState<BaseCommune | undefined>();
    let navigate = useNavigate();
    const { code } = useParams<{ code?: string }>();

    const fetchData = async () => {
        if (!commune && !code) return;

        const data = await fetchCommuneData(commune?.code || code || "")
        if (data.length === 0) {
            navigate("/", { replace: true });
            return;
        }

        setCommune({ nom: data[0].nom, code: data[0].code })
        onDataSet(data);

        navigate(`/${data[0].code}`, { replace: true })
    }

    useEffect(() => {
        if (!code) return;

        if (!/^[0-9]{5}$/.test(code)) {
            navigate("/");
            return;
        }

        setCommune({ nom: "", code: code })
        fetchData();
    }, [code, navigate])

    const isButtonDisabled = (): boolean => {
        if (!commune) return true;
        if (data.length > 0 && data[0].code === commune.code) return true;
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