"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

type Product = {
  id: number
  name: string
  category: string
}

type TallyItem = {
  id: number
  quantity: number
  notes: string
  product: Product
}

type TallyEntry = {
  id: number
  date: string
  tallyItems: TallyItem[]
}

type TallyStats = {
  eggs: number
  chickens: number
  manure: number
}

export default function TallyPage() {
  const [isAddTallyOpen, setIsAddTallyOpen] = useState(false)
  const [tallyEntries, setTallyEntries] = useState<TallyEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TallyStats>({
    eggs: 0,
    chickens: 0,
    manure: 0,
  })

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    productId: "",
    quantity: "",
    notes: "",
  })
  const [tallyItems, setTallyItems] = useState<
    Array<{
      productId: number
      productName: string
      quantity: number
      notes: string
    }>
  >([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTallyEntries()
    fetchProducts()
  }, [])

  const fetchTallyEntries = async () => {
    try {
      const response = await fetch("/api/tally")
      const data = await response.json()
      setTallyEntries(data)

      // Calculate stats for today
      calculateTodayStats(data)
    } catch (error) {
      console.error("Error fetching tally entries:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tally entries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const calculateTodayStats = (entries: TallyEntry[]) => {
    const today = new Date().toISOString().split("T")[0]

    const todayEntries = entries.filter((entry) => new Date(entry.date).toISOString().split("T")[0] === today)

    let eggsTotal = 0
    let chickensTotal = 0
    let manureTotal = 0

    todayEntries.forEach((entry) => {
      entry.tallyItems.forEach((item) => {
        if (item.product.category === "eggs") {
          eggsTotal += item.quantity
        } else if (item.product.category === "meat") {
          chickensTotal += item.quantity
        } else if (item.product.category === "prepared") {
          manureTotal += item.quantity
        }
      })
    })

    setStats({
      eggs: eggsTotal,
      chickens: chickensTotal,
      manure: manureTotal,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddItem = () => {
    if (!formData.productId || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please select a product and enter a quantity",
        variant: "destructive",
      })
      return
    }

    const productId = Number.parseInt(formData.productId)
    const product = products.find((p) => p.id === productId)

    if (!product) {
      toast({
        title: "Error",
        description: "Invalid product selected",
        variant: "destructive",
      })
      return
    }

    setTallyItems((prev) => [
      ...prev,
      {
        productId,
        productName: product.name,
        quantity: Number.parseInt(formData.quantity),
        notes: formData.notes,
      },
    ])

    // Reset form fields except date
    setFormData((prev) => ({
      ...prev,
      category: "",
      productId: "",
      quantity: "",
      notes: "",
    }))
  }

  const handleRemoveItem = (index: number) => {
    setTallyItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (tallyItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/tally", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          items: tallyItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add tally entry")
      }

      toast({
        title: "Success",
        description: "Tally entry added successfully",
      })

      // Reset form and close dialog
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        productId: "",
        quantity: "",
        notes: "",
      })
      setTallyItems([])
      setIsAddTallyOpen(false)

      // Refresh tally entries list
      fetchTallyEntries()
    } catch (error) {
      console.error("Error adding tally entry:", error)
      toast({
        title: "Error",
        description: "Failed to add tally entry",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = formData.category
    ? products.filter((product) => product.category === formData.category)
    : products

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
           <h2 className="text-[0.9rem] font-bold tracking-tight">Daily Tally System</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Eggs Production</CardTitle>
            <CardDescription>Total eggs collected today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl ml-3 font-bold">{stats.eggs}</div>
            <p className="text-xs ml-3 text-muted-foreground mt-1">Today's collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Chickens Ready</CardTitle>
            <CardDescription>Chickens ready for sale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl ml-3 font-bold">{stats.chickens}</div>
            <p className="text-xs ml-3 text-muted-foreground mt-1">Today's count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Manure Collected</CardTitle>
            <CardDescription>Kilograms of manure collected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl ml-3 font-bold">{stats.manure}</div>
            <p className="text-xs ml-3 text-muted-foreground mt-1">Today's collection</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between space-y-2">
   

        

        <div className="flex items-center space-x-2">
          
          <Dialog open={isAddTallyOpen} onOpenChange={setIsAddTallyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-h-[90vh] overflow-y-auto ">
              <DialogHeader>
                <DialogTitle>Add Daily Tally Entry</DialogTitle>
                <DialogDescription>Record daily production quantities for tracking.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={formData.date} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eggs">Eggs</SelectItem>
                        <SelectItem value="meat">Chickens</SelectItem>
                        <SelectItem value="prepared">Manure</SelectItem>
                        <SelectItem value="feed">Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productId">Product</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => handleSelectChange("productId", value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger id="productId">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Additional notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Button type="button" variant="outline" onClick={handleAddItem}>
                    Add Item
                  </Button>

                  {tallyItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Items to Add:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow className=" text-[0.75rem] font-medium bg-gray-100 ">
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tallyItems.map((item, index) => (
                            <TableRow key={index} className=" text-[0.75rem] ">
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.notes || "—"}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTallyOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={tallyItems.length === 0 || submitting}>
                    {submitting ? "Saving..." : "Save Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Production Tally</CardTitle>
          <CardDescription>Track daily production quantities for all farm products.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">Loading tally entries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className=" text-[0.75rem] font-medium bg-gray-100 ">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tallyEntries.length === 0 ? (
                  <TableRow className=" text-[0.75rem] font-medium ">
                    <TableCell colSpan={6} className="text-center py-4">
                      No tally entries found. Add your first entry!
                    </TableCell>
                  </TableRow>
                ) : (
                  tallyEntries.flatMap((entry) =>
                    entry.tallyItems.map((item) => (
                      <TableRow key={`${entry.id}-${item.id}`} className=" text-[0.75rem] font-medium ">
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className="capitalize">{item.product.category}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.notes || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )),
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      
    </div>
  )
}
