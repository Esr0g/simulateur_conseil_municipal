import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CSPTable from './CSPTable'
import type { Commune } from '@/models/commune'

const avecCsp = (csp: Commune['csp']): Commune => ({
    code_commune: '75056',
    libelle: 'Paris',
    code_postal: ['75001'],
    population_municipale: 2113705,
    total_conseillers: 163,
    total_loc_et_prop: 2072416,
    total_locataires: 1351056,
    taux_pauvrete: 16,
    csp,
})

describe('CSPTable', () => {
    it('calcule le poids de chaque CSP dans la population', () => {
        render(<CSPTable data={avecCsp([
            { code_csp: '1', libelle_csp: 'Agriculteurs', population_csp: 250, nb_conseillers_csp: 5 },
            { code_csp: '2', libelle_csp: 'Ouvriers', population_csp: 750, nb_conseillers_csp: 15 },
        ])} />)

        expect(screen.getByText('25.00 %')).toBeInTheDocument()
        expect(screen.getByText('75.00 %')).toBeInTheDocument()
    })

    // Le total était calculé dans un effet : la première passe de rendu
    // divisait par 0 et affichait "NaN %".
    it('n affiche jamais NaN au premier rendu', () => {
        render(<CSPTable data={avecCsp([
            { code_csp: '1', libelle_csp: 'Agriculteurs', population_csp: 100, nb_conseillers_csp: 3 },
        ])} />)

        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
        expect(screen.getByText('100.00 %')).toBeInTheDocument()
    })

    it('ne divise pas par zero si toutes les populations sont nulles', () => {
        render(<CSPTable data={avecCsp([
            { code_csp: '1', libelle_csp: 'Agriculteurs', population_csp: 0, nb_conseillers_csp: 0 },
        ])} />)

        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
        expect(screen.getByText('0.00 %')).toBeInTheDocument()
    })

    it('n affiche aucune ligne de donnees sans commune', () => {
        render(<CSPTable data={null} />)
        // Seule la ligne d'en-tête subsiste.
        expect(screen.queryByText('Agriculteurs')).not.toBeInTheDocument()
        expect(screen.getAllByRole('row')).toHaveLength(1)
    })
})
