import { useState } from 'react'
import { useSettingsStore } from './store/settingsStore'
import { SettingsPanel } from './components/SettingsPanel'

function Sidebar() {
  return <div className="w-64 bg-[var(--bg-sidebar)] backdrop-blur-20 border-r border-[var(--border-color)]">Sidebar</div>
}

function TopBar({ onSettingsClick }: { onSettingsClick?: () => void }) {
  return (
    <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-4">
      <span className="text-sm font-semibold">MiniMax</span>
      <button
        onClick={onSettingsClick}
        className="text-xs px-3 py-1 rounded hover:bg-[var(--bg-secondary)]"
      >
        Settings
      </button>
    </div>
  )
}

function ChatArea() {
  return <div className="flex-1 overflow-auto">ChatArea</div>
}

function MultimodalInput() {
  return <div className="h-20 border-t border-[var(--border-color)]">MultimodalInput</div>
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const theme = useSettingsStore((state) => state.theme)

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex h-screen bg-[var(--bg-primary)]`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        <ChatArea />
        <MultimodalInput />
      </div>
      {settingsOpen && (
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
