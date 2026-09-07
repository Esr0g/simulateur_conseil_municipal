import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { communeResponseSchema, communeBaseResponseSchema, fetchBaseCommunes, fetchCommuneData } from './commune'

vi.mock('axios')
const axiosMock = vi.mocked(axios, true)

const reponseDetail = {
    success: true,
    error: null,
    message: null,
    data: {
        code_commune: '75056',
        libelle: 'Paris',
        code_postal: ['75001', '75002'],
        population_municipale: 2113705,
        total_conseillers: 163,
        total_loc_et_prop: 2072416,
        total_locataires: 1351056,
        taux_pauvrete: 16,
        csp: [{ code_csp: '1', libelle_csp: 'Agriculteurs', population_csp: 438, nb_conseillers_csp: 0 }],
    },
}

describe('schemas de reponse', () => {
    it('accepte une reponse conforme au contrat du backend', () => {
        expect(() => communeResponseSchema.parse(reponseDetail)).not.toThrow()
    })

    it('accepte les indicateurs absents renvoyes en null', () => {
        const sansDonnees = {
            ...reponseDetail,
            data: { ...reponseDetail.data, taux_pauvrete: null, total_locataires: null },
        }
        expect(() => communeResponseSchema.parse(sansDonnees)).not.toThrow()
    })

    it('accepte une valeur nulle, qui reste une donnee valide', () => {
        const zero = { ...reponseDetail, data: { ...reponseDetail.data, population_municipale: 0 } }
        expect(communeResponseSchema.parse(zero).data.population_municipale).toBe(0)
    })

    it('rejette un code commune qui n a pas cinq caracteres', () => {
        const invalide = { ...reponseDetail, data: { ...reponseDetail.data, code_commune: '750' } }
        expect(() => communeResponseSchema.parse(invalide)).toThrow()
    })

    it('rejette un code postal qui n est pas un tableau', () => {
        const invalide = { ...reponseDetail, data: { ...reponseDetail.data, code_postal: '75001' } }
        expect(() => communeResponseSchema.parse(invalide)).toThrow()
    })

    it('accepte une liste de communes vide', () => {
        expect(() => communeBaseResponseSchema.parse({
            success: true, error: null, message: null, data: [],
        })).not.toThrow()
    })
})

describe('appels a l API', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('transmet la saisie en parametre de recherche', async () => {
        axiosMock.get.mockResolvedValue({
            data: { success: true, error: null, message: null, data: [] },
        })

        await fetchBaseCommunes('paris')

        expect(axiosMock.get).toHaveBeenCalledWith(
            expect.stringContaining('communes'),
            { params: { nom: 'paris' } },
        )
    })

    it('renvoie les donnees validees de la commune', async () => {
        axiosMock.get.mockResolvedValue({ data: reponseDetail })

        const commune = await fetchCommuneData('75056')

        expect(commune?.libelle).toBe('Paris')
        expect(commune?.csp).toHaveLength(1)
    })

    it('leve une erreur quand le backend signale un echec', async () => {
        axiosMock.get.mockResolvedValue({
            data: { success: false, error: 'Not Found', message: 'Ressource introuvable', data: null },
        })

        await expect(fetchCommuneData('99999')).rejects.toThrow()
    })
})
