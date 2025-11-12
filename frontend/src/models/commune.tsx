import axios from "axios";
import { z } from "zod";

const baseCommuneSchema = z.object({
    code: z.string().length(5),
    nom: z.string(),
});

export const baseCommuneResponseSchema = z.array(baseCommuneSchema);

export const fullCommuneSchema = baseCommuneSchema.extend({
    csp_code: z.string().length(1),
    libelle_csp: z.string(),
    nb_conseillers: z.number(),
    pop_municipale: z.number(),
    population_csp: z.number(),
});

export const fullCommuneSchemaResponse = z.array(fullCommuneSchema)

export type BaseCommune = z.infer<typeof baseCommuneSchema>;
export type BaseCommuneResponse = z.infer<typeof baseCommuneResponseSchema>;

export type CommuneCSP = z.infer<typeof fullCommuneSchemaResponse>;

export async function fetchCommunes(inputValue: string): Promise<BaseCommuneResponse> {
    const response = await axios.get("http://localhost:5000/api/communes", {
        params: { nom: inputValue }
    });

    const parsed = baseCommuneResponseSchema.safeParse(response.data);

    if (!parsed.success) {
        throw new Error("Les données reçues ne sont pas valides");
    }

    return parsed.data;
}

export async function fetchCommuneData(code: string): Promise<CommuneCSP> {
    const response = await axios.get(`http://localhost:5000/api/communes/${code}`);

    const parsed = fullCommuneSchemaResponse.safeParse(response.data);

    if (!parsed.success) {
        throw new Error("Les données reçues ne sont pas valides");
    }

    return parsed.data;
}