import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange?: (tabId: string) => void
  children?: ReactNode
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? '')
  const currentTab = activeTab ?? internalActive

  const handleClick = (tabId: string) => {
    if (onChange) {
      onChange(tabId)
    } else {
      setInternalActive(tabId)
    }
  }

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              currentTab === tab.id
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
