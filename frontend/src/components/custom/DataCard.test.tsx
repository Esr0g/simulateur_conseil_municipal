import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataCard from './DataCard'
import type { Commune } from '@/models/commune'

const commune = (surcharge: Partial<Commune> = {}): Commune => ({
    code_commune: '55039',
    libelle: 'Beaumont-en-Verdunois',
    code_postal: ['55100'],
    population_municipale: 1000,
    total_conseillers: 15,
    total_loc_et_prop: 400,
    total_locataires: 100,
    taux_pauvrete: 12,
    csp: [],
    ...surcharge,
})

describe('DataCard', () => {
    it('affiche les valeurs de la commune', () => {
        render(<DataCard data={commune()} />)
        expect(screen.getByText('Beaumont-en-Verdunois (55)', { exact: false })).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('affiche un tiret quand aucune commune n est selectionnee', () => {
        render(<DataCard data={null} />)
        expect(screen.getByText(/Aucune commune sélectionnée/)).toBeInTheDocument()
    })

    it('signale une donnee reellement absente', () => {
        render(<DataCard data={commune({ population_municipale: null })} />)
        expect(screen.getAllByText(/Aucune donnée disponible/).length).toBeGreaterThan(0)
    })

    // Les six communes détruites en 1914-18 ont une population réelle de 0 :
    // elle doit s'afficher, et non être confondue avec une absence de donnée.
    it('affiche zero comme une valeur et non comme une absence de donnee', () => {
        render(<DataCard data={commune({ population_municipale: 0, total_conseillers: 0 })} />)
        expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })

    it('ne divise pas par zero quand le parc de logements est vide', () => {
        render(<DataCard data={commune({ total_loc_et_prop: 0, total_locataires: 0 })} />)
        expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
    })
})
