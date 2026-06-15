import Link from "next/link"
import { Search, Grid, Bell, User, Settings } from "lucide-react"

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="flex h-14 items-center px-4 md:px-6">
        
        {/* App Switcher Icon (Odoo style grid) */}
        <button className="mr-4 p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
          <Grid className="h-5 w-5" />
          <span className="sr-only">App Switcher</span>
        </button>
        
        {/* Branding */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">
            CyMed Enterprise
          </span>
        </Link>
        
        {/* Global Search Bar */}
        <div className="flex flex-1 items-center space-x-2 justify-center md:justify-start max-w-xl mx-auto">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search patients, invoices, labs..."
              className="w-full bg-primary-foreground/10 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:bg-primary-foreground focus:text-foreground placeholder:text-primary-foreground/70 transition-all"
            />
          </div>
        </div>
        
        {/* User Actions */}
        <div className="flex items-center space-x-2 ml-auto">
          <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </button>
          <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </button>
          <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary-foreground text-primary flex items-center justify-center text-xs font-bold">
              DR
            </div>
            <span className="hidden md:inline-block text-sm font-medium">Dr. Smith</span>
          </button>
        </div>
        
      </div>
    </header>
  )
}
