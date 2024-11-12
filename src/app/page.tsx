import dynamic from 'next/dynamic'

const TopBar = dynamic(() => import('@/components/TopBar'), { ssr: false })
const Canvas = dynamic(() => import('@/components/Canvas'), { ssr: false })
const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), { ssr: false })
const RightSidebar = dynamic(() => import('@/components/RightSidebar'), { ssr: false })

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#e5e5e5]">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 relative">
          <Canvas />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}