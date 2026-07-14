interface CategoryTabsProps {
  categories: string[]
  activeCategory: string
  setActiveCategory: (cat: string) => void
}

export function CategoryTabs({ categories, activeCategory, setActiveCategory }: CategoryTabsProps) {
  return (
    <>
      <div className="mb-6 overflow-x-auto scrollbar-none -mx-6 px-6">
        <div className="flex gap-2.5 pb-2">
          {categories.map((catName) => {
            const isActive = activeCategory === catName
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 backdrop-blur-md ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7F00FF] to-[#b026ff] text-white shadow-[0_0_15px_rgba(127,0,255,0.5)] scale-105 border border-white/20'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {catName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Decorative Diamond Section Header */}
      <div className="relative flex items-center mb-6 mt-2 w-full">
        <div className="flex flex-col w-full">
          <div className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-2 pl-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
            {activeCategory}
          </div>
          <div className="relative flex items-center w-[60%] opacity-80">
            {/* Left empty diamond */}
            <div className="w-2.5 h-2.5 rotate-45 border border-[#b026ff] bg-black shrink-0 -ml-1 shadow-[0_0_5px_#b026ff]"></div>
            {/* Horizontal divider line */}
            <div className="flex-grow h-[1px] bg-gradient-to-r from-[#b026ff] to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  )
}
