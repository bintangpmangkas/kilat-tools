import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { tools, categories } from './mock';
import * as Icons from 'lucide-react';
import { cn } from './lib/utils';
import ToolLayout from './components/ToolLayout';

// Mock Pages
const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 border-b pb-8">
        <h1 className="text-6xl font-bold tracking-tight mb-4 flex items-center gap-4">
          <Icons.Zap className="w-16 h-16" strokeWidth={1.5} />
          Kilat Tools
        </h1>
        <p className="text-xl text-muted-foreground mb-4">
          A bunch of useful tools that requires no sign-in
        </p>
        <div className="prose prose-zinc dark:prose-invert">
          <p>
            Zero-tracking and absolute privacy. All tools works independently on your very own browsers.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            All files are processed locally in your browser.
          </p>
        </div>
      </div>

      {/* Greatest Hits (Random 4 tools) */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 border-b pb-2">
          <Icons.Star className="w-4 h-4 fill-current" />
          <span>Greatest Hits</span>
          <span className="text-xs font-normal">4</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.slice(0, 4).map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* All Tools */}
      <div>
        <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
          All Tools <span className="text-xs font-normal ml-1">{tools.length}</span>
        </div>
        
        {categories.map(category => {
          const categoryTools = tools.filter(t => t.category === category);
          if (categoryTools.length === 0) return null;
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 border-b pb-2">
                <span>{category}</span>
                <span className="text-xs font-normal">{categoryTools.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border rounded-md overflow-hidden bg-card">
                {categoryTools.map((tool, index) => (
                  <div key={tool.id} className={cn(
                    "border-r border-b",
                    "last:border-r-0 lg:[&:nth-child(4n)]:border-r-0",
                    index >= Math.floor((categoryTools.length - 1) / 4) * 4 ? "border-b-0" : ""
                  )}>
                    <ToolCard tool={tool} variant="compact" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ToolCard = ({ tool, variant = 'default' }) => {
  const Icon = Icons[tool.icon] || Icons.Wrench;
  
  if (variant === 'compact') {
    return (
      <Link 
        to={`/tools/${tool.slug}`}
        className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors h-full group"
      >
        <Icon className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            {tool.name}
            {tool.isBeta && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Beta</span>}
            {tool.isNew && <span className="text-[10px] border px-1.5 py-0.5 rounded text-muted-foreground">New</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/tools/${tool.slug}`}
      className="block p-4 border rounded-md hover:bg-muted/50 transition-colors bg-card group h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        <h3 className="font-medium text-sm flex items-center gap-2">
          {tool.name}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground flex-grow">
        {tool.description}
      </p>
      <div className="mt-3 flex gap-2">
        {tool.isBeta && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Beta</span>}
        {tool.isNew && <span className="text-[10px] border px-1.5 py-0.5 rounded text-muted-foreground">New</span>}
      </div>
    </Link>
  );
};

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  
  const filteredTools = React.useMemo(() => {
    return search 
      ? tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
      : tools;
  }, [search]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <div className={cn(
        "fixed md:sticky top-0 z-50 w-72 md:w-64 border-l md:border-l-0 md:border-r bg-background md:bg-muted/20 h-screen flex flex-col text-sm transform transition-transform duration-200 ease-in-out",
        "right-0 md:left-0 md:right-auto",
        isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b bg-card flex justify-between items-center">
          <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2 font-bold text-lg md:mb-4">
            <Icons.Zap className="w-5 h-5 hidden md:block" fill="currentColor" />
            <span className="hidden md:block">Kilat</span>
            <span className="md:hidden">Navigation</span>
          </Link>
          <button 
            className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md -mr-2"
            onClick={() => setIsMobileOpen(false)}
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b bg-card pt-0 md:pt-4">
          <div className="relative mt-4 md:mt-0">
            <Icons.Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tools..." 
              className="w-full bg-background border rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <nav className="space-y-6">
          <div>
            <Link 
              to="/" 
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors",
                location.pathname === '/' ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              <Icons.Home className="w-4 h-4" />
              Home
            </Link>
          </div>
          
          {search ? (
            <div>
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Search Results
              </div>
              <ul className="space-y-0.5">
                {filteredTools.map(tool => (
                  <li key={tool.id}>
                    <Link 
                      to={`/tools/${tool.slug}`}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-xs",
                        location.pathname === `/tools/${tool.slug}` ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icons.CornerDownRight className="w-3 h-3 opacity-50" />
                      {tool.name}
                    </Link>
                  </li>
                ))}
                {filteredTools.length === 0 && (
                  <li className="px-2 py-1.5 text-xs text-muted-foreground italic">No tools found.</li>
                )}
              </ul>
            </div>
          ) : (
            categories.map(category => (
              <div key={category}>
                <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 truncate">
                  {category}
                </div>
                <ul className="space-y-0.5">
                  {tools.filter(t => t.category === category).map(tool => {
                    const Icon = Icons[tool.icon] || Icons.Wrench;
                    return (
                      <li key={tool.id}>
                        <Link 
                          to={`/tools/${tool.slug}`}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-xs",
                            location.pathname === `/tools/${tool.slug}` ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 opacity-70" />
                          <span className="truncate">{tool.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>
      </div>

      <div className="p-4 border-t text-xs text-muted-foreground space-y-3 bg-card">
        <div>
          <p>No logins. No tracking.</p>
          <p>It run locally in your browser</p>
        </div>
        <div>
          <a 
            href="mailto:bepekerja@gmail.com?subject=Bug Report - Kilat Tools" 
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icons.Bug className="w-3.5 h-3.5" />
            <span>Report an issue</span>
          </a>
        </div>
      </div>
    </div>
    </>
  );
};

function App() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col min-h-screen">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-30">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <Icons.Zap className="w-5 h-5" fill="currentColor" />
              Kilat
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="p-2 border rounded-md hover:bg-muted bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm"
                title="Toggle Theme"
              >
                <Icons.SunMoon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 border rounded-md hover:bg-muted bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm"
                title="Open Menu"
              >
                <Icons.Menu className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Theme Toggle */}
          <div className="hidden md:flex absolute top-4 right-4 z-10 gap-2">
            <button 
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="p-2 border rounded-md hover:bg-muted bg-card transition-colors text-muted-foreground hover:text-foreground"
              title="Toggle Theme"
            >
              <Icons.SunMoon className="w-4 h-4" />
            </button>
          </div>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/:slug" element={<ToolLayout />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;