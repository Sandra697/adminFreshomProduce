import { Button } from "@/components/ui/button"
import { ProductsOverview } from "@/components/dashboard/products-overview"

export default function ProductsPage() {
  return (
    <div className="flex-1 space-y-4 bg-white text-gray-700 font-medium text-[0.75rem]  p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-[0.8rem] font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button>Export</Button>
        </div>
      </div>
      <ProductsOverview />
    </div>
  )
}
