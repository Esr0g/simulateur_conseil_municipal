import { useEffect, useState } from "react"
import { type BaseCommune, fetchBaseCommunes } from "@/models/commune"

import { AutoComplete } from "@/components/ui/autocomplete"


export function SearchBar({ onChange }: { onChange: (val: BaseCommune) => void }) {
    const [selectedCommune, SetSelectedCommune] = useState<BaseCommune | undefined>();
    const [communes, setCommunes] = useState<BaseCommune[]>([]);
    const [inputValue, setInputValue] = useState(selectedCommune?.libelle || "");

    useEffect(() => {
        if (!inputValue) {
            setCommunes([]);
            return;
        };

        // debounce pour éviter de spamer le back
        const handler = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const data = await fetchBaseCommunes(inputValue);
                    setCommunes(data);
                } catch {
                    // API injoignable : liste vide plutôt qu'une promesse rejetée
                    // non traitée, qui remontait en erreur dans la console.
                    setCommunes([]);
                }
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
