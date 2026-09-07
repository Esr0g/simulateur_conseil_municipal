import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Sans `globals: true`, testing-library n'enregistre pas son nettoyage
// automatique : le DOM d'un test fuirait dans le suivant.
afterEach(() => {
    cleanup()
})
