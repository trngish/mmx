import { useState } from 'react'
import { useSettingsStore } from './store/settingsStore'
import Sidebar from './components/Sidebar/Sidebar'
import TopBar from './components/TopBar/TopBar'
import ChatArea from './components/Chat/ChatArea'
import MultimodalInput from './components/Input/MultimodalInput'
import SettingsPanel from './components/Settings/SettingsPanel'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const theme = useSettingsStore((state) => state.theme)

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex h-screen bg-[var(--bg-primary)]`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        <ChatArea />
        <MultimodalInput />
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
