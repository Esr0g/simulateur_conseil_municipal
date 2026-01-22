import { fetchCommuneData, type BaseCommune, type Commune } from "@/models/commune";
import { useEffect, useState, type FormEvent } from "react";
import { SearchBar } from "@/components/custom/SearchBar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Card } from "../ui/card";

export default function SearchCard({ onDataSet }: { onDataSet: (data: Commune | null) => void }) {
    let navigate = useNavigate();
    const { code } = useParams<{ code?: string }>();

    // Récupère les communes soit quand un code est présent dans l'url soit lorque le bouton "simuler" est pressé
    const fetchData = async (code_com: string, e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!code_com && !code) return;

        const data_tmp = await fetchCommuneData(code_com || "")
        if (data_tmp === null) {
            navigate("/", { replace: true });
            return;
        }

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

        fetchData(code);
    }, [code, navigate])

    const handleOnChange = (com: BaseCommune | null) => {
        if (com && com.code_commune) fetchData(com?.code_commune)
    }

    return <SearchBar onChange={handleOnChange} />
}