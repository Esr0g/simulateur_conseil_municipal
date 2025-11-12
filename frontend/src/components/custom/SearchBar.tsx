import { useEffect, useState } from "react"
import { type BaseCommune, fetchCommunes, type BaseCommuneResponse } from "@/models/commune"

import { AutoComplete } from "@/components/ui/autocomplete"


export function SearchBar({ onChange }: { onChange: (val: BaseCommune) => void }) {
    const [selectedCommune, SetSelectedCommune] = useState<BaseCommune | undefined>();
    const [communes, setCommunes] = useState<BaseCommuneResponse>([]);
    const [inputValue, setInputValue] = useState(selectedCommune?.nom || "");

    useEffect(() => {
        if (!inputValue) {
            setCommunes([]);
            return;
        };

        // debounce pour éviter de spamer le back
        const handler = setTimeout(() => {
            const fetchData = async () => {
                const data = await fetchCommunes(inputValue);
                setCommunes(data);
            }
            fetchData();
        }, 250);


        return () => {
            clearTimeout(handler);
        };

    }, [inputValue])

    const handleValueOnChange = (commune: BaseCommune) => {
        SetSelectedCommune(commune);
        onChange(commune);
    }


    return (
        <AutoComplete
            options={communes}
            onValueChange={handleValueOnChange}
            inputValue={inputValue}
            setInputValue={setInputValue}
            value={selectedCommune}
            emptyMessage="Aucune commune trouvée."
            placeholder="Tapez pour rechercher une commune..." />
    )
}
