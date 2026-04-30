import { useSettingsStore } from './store/settingsStore'

function Sidebar() {
  return <div className="w-64 bg-[var(--bg-sidebar)] backdrop-blur-20 border-r border-[var(--border-color)]">Sidebar</div>
}

function TopBar() {
  return <div className="h-12 border-b border-[var(--border-color)]">TopBar</div>
}

function ChatArea() {
  return <div className="flex-1 overflow-auto">ChatArea</div>
}

function MultimodalInput() {
  return <div className="h-20 border-t border-[var(--border-color)]">MultimodalInput</div>
}

export default function App() {
  const theme = useSettingsStore((state) => state.theme)

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex h-screen bg-[var(--bg-primary)]`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <ChatArea />
        <MultimodalInput />
      </div>
    </div>
  )
}
