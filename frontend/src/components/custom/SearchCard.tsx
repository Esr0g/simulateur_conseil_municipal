import { fetchCommuneData, type BaseCommune, type Commune } from "@/models/commune";
import { useEffect, useState, type FormEvent } from "react";
import { SearchBar } from "@/components/custom/SearchBar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function SearchCard({ onDataSet, data }: { onDataSet: (data: Commune | null) => void, data: Commune | null }) {
    const [commune, setCommune] = useState<BaseCommune | null>(null);
    // SearchBar garde sa saisie et sa sélection en interne. Quand on remet
    // `commune` à null sur un échec, changer cette clé la remonte pour vider le
    // champ : sans ça le champ affichait toujours "Lyon" alors que le bouton
    // Simuler était grisé, sans moyen de réessayer.
    const [cleSearchBar, setCleSearchBar] = useState(0);
    const navigate = useNavigate();
    const { code } = useParams<{ code?: string }>();

    const reinitialiserSelection = () => {
        setCommune(null);
        setCleSearchBar((cle) => cle + 1);
        onDataSet(null);
        navigate("/", { replace: true });
    };

    // L'url est la seule source de vérité : cet effet charge la commune dès que
    // le code change, qu'il vienne d'un lien partagé ou du bouton "Simuler".
    useEffect(() => {
        if (!code) return;

        // Retire de l'url un code qui n'a pas le format attendu
        if (!/^[0-9]{5}$/.test(code)) {
            navigate("/", { replace: true });
            return;
        }

        let annule = false;
        setCommune({ libelle: "", code_commune: code, code_postal: [] });

        (async () => {
            try {
                const resultat = await fetchCommuneData(code);
                if (annule) return;

                if (!resultat) {
                    reinitialiserSelection();
                    return;
                }

                setCommune({
                    libelle: resultat.libelle,
                    code_commune: resultat.code_commune,
                    code_postal: resultat.code_postal,
                });
                onDataSet(resultat);
            } catch {
                // Code inexistant ou API injoignable : sans ce catch, la promesse
                // rejetée laissait l'utilisateur sur une page vide, code toujours
                // dans l'url.
                if (annule) return;
                reinitialiserSelection();
            }
        })();

        return () => { annule = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, navigate, onDataSet]);

    // Le bouton se contente de mettre le code dans l'url ; le chargement est fait
    // par l'effet ci-dessus. Évite les deux appels API que déclenchait chaque
    // simulation (un ici, un via la navigation qui suivait).
    const lancerSimulation = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (!commune) return;
        navigate(`/${commune.code_commune}`, { replace: true });
    };

    const isButtonDisabled = (): boolean => {
        if (!commune) return true;
        if (data && data.code_commune === commune.code_commune) return true;
        return false;
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Enter") return;
            if (!commune || (data && data.code_commune === commune.code_commune)) return;

            navigate(`/${commune.code_commune}`, { replace: true });
            event.preventDefault();
            event.stopPropagation();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [commune, data, navigate]);

    return (
        <div className="flex flex-col gap-1 w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border px-4 py-2.5">
            <h3 className="scroll-m-20 text-lg tracking-tight">Sélectionner une commune</h3>
            <form className="flex flex-col sm:flex-row sm:gap-4 sm:items-center" onSubmit={lancerSimulation}>
                <SearchBar key={cleSearchBar} onChange={setCommune} />
                <Button
                    type="submit"
                    variant="default"
                    className="self-center text-base mt-2 sm:mt-0  sm:mr"
                    disabled={isButtonDisabled()}
                    size="lg">
                    <Play /> Simuler
                </Button>
            </form>
        </div>
    )
}
