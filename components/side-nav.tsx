import Link from "next/link"
import { BarChart3, Package, Users, ShoppingCart, MessageSquare, UserPlus, ClipboardList, Settings } from "lucide-react"

export function SideNav() {
  return (
    <div className="fixed top-0 left-0 bottom-0 z-30 border-r w-64 overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: "url('https://res.cloudinary.com/dunssu2gi/image/upload/v1744553773/blog-images/h3gonmkmzztduj7gvlbg.jpg')" }}
      >
        {/* Overlay for better visibility */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      </div>
      
      <div className="flex h-full max-h-screen flex-col gap-2 pt-4 relative z-20">
        {/* Logo area with more distinct background */}
        <div className="flex h-16 pt-8 items-center justify-center ">
  <Link href="/" className="flex flex-col items-center gap-1">
    <div className="  p-1 mb-1 flex items-center justify-center">
      <img 
        src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744141651/blog-images/alfxgrzskxcl8zidlsvj.png" 
        alt="Freshom Logo" 
        className="h-20 w-40 object-cover"
      />
    </div>

  </Link>
</div>
        
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start px-8 pt-8 text-[0.8rem] font-medium">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/members"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <Users className="h-4 w-4" />
              Members
            </Link>
            <Link
              href="/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <MessageSquare className="h-4 w-4" />
              Support Center
            </Link>
            <Link
              href="/admin-users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <UserPlus className="h-4 w-4" />
              Admin Users
            </Link>
            <Link
              href="/tally"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <ClipboardList className="h-4 w-4" />
              Tally System
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}