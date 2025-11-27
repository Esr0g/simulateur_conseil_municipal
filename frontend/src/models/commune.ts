import axios from "axios";
import { z } from "zod";
import { createApiResponseSchema } from "./api";

const API_URL = import.meta.env.VITE_API_URL;

const communeBaseSchema = z.object({
    code_commune: z.string().length(5),
    libelle: z.string(),
    code_postal: z.string().array()
})

export const communeBaseResponseSchema = createApiResponseSchema(z.array(communeBaseSchema));
export type BaseCommune = z.infer<typeof communeBaseSchema>

const cspSchema = z.object({
    code_csp: z.string().length(1),
    libelle_csp: z.string(),
    population_csp: z.number(),
    nb_conseillers_csp: z.number(),
})

const communeSchema = communeBaseSchema.extend({
    population_municipale: z.number().nullable(),
    total_conseillers: z.number().nullable(),
    total_loc_et_prop: z.number().nullable(),
    total_locataires: z.number().nullable(),
    taux_pauvrete: z.number().nullable(),
    csp: z.array(cspSchema)
});

export const communeResponseSchema = createApiResponseSchema(communeSchema);
export type Commune = z.infer<typeof communeSchema>;


export async function fetchBaseCommunes(inputValue: string): Promise<BaseCommune[]> {
    const response = await axios.get(`${API_URL}communes`, {
        params: { nom: inputValue }
    });

    if (!response.data.success) {
        throw new Error("Les données reçues ne sont pas valides");
    }

    const parsed = communeBaseResponseSchema.parse(response.data);

    return parsed.data;
}

export async function fetchCommuneData(code: string): Promise<Commune | null> {
    const response = await axios.get(`${API_URL}communes/${code}`);

    if (!response.data.success) {
        throw new Error("Erreur : " + response.data.error);
    }

    const parsed = communeResponseSchema.parse(response.data);

    return parsed.data || null;
}