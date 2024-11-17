import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://wiki.mta.ro/" target="_blank" rel="noopener noreferrer">
          ATMFISH
        </a>
        <span className="ms-1">&copy; 2024-2025.</span>
      </div>
     
    </CFooter>
  )
}

export default React.memo(AppFooter)
