"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Archive, Check, X, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDateTime } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type SupportTicket = {
  id: number
  message: string
  status: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
    phone: string
  }
  responses: Array<{
    id: number
    message: string
    respondedBy: string
    createdAt: string
  }>
}

export default function SupportPage() {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("new")
  const [closeAfterReply, setCloseAfterReply] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchSupportTickets()
  }, [])

  const fetchSupportTickets = async () => {
    try {
      const response = await fetch("/api/support")
      const data = await response.json()
      setSupportTickets(data)
    } catch (error) {
      console.error("Error fetching support tickets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      // Fetch fresh ticket data and update status if necessary
      const response = await fetch(`/api/support/${ticket.id}`)
      if (!response.ok) throw new Error("Failed to fetch ticket details")
      
      const updatedTicket = await response.json()
      setSelectedTicket(updatedTicket)
      setResponseMessage("")
      setDialogOpen(true)
      
      // Refresh the ticket list to reflect any status changes
      fetchSupportTickets()
    } catch (error) {
      console.error("Error viewing ticket:", error)
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive",
      })
    }
  }

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return

    setSubmitting(true)

    try {
      // Send response
      const responseRes = await fetch(`/api/support/${selectedTicket.id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: responseMessage,
          respondedBy: "Admin", // This should be the logged-in admin's name in a real app
          closeTicket: closeAfterReply, // Whether to close the ticket after reply
        }),
      })

      if (!responseRes.ok) {
        throw new Error("Failed to send response")
      }

      toast({
        title: "Success",
        description: closeAfterReply 
          ? "Response sent and ticket closed" 
          : "Response sent successfully",
      })

      // Refresh support tickets list
      fetchSupportTickets()
      setDialogOpen(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error("Error handling support ticket:", error)
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleArchiveTicket = async () => {
    if (!selectedTicket) return

    try {
      const response = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ARCHIVED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to archive ticket")
      }

      toast({
        title: "Success",
        description: "Ticket archived successfully",
      })

      // Refresh support tickets list
      fetchSupportTickets()
      setDialogOpen(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error("Error archiving ticket:", error)
      toast({
        title: "Error",
        description: "Failed to archive ticket",
        variant: "destructive",
      })
    }
  }

  const handleCloseTicket = async () => {
    if (!selectedTicket) return

    try {
      const response = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CLOSED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to close ticket")
      }

      toast({
        title: "Success",
        description: "Ticket closed successfully",
      })

      // Refresh support tickets list
      fetchSupportTickets()
      setDialogOpen(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error("Error closing ticket:", error)
      toast({
        title: "Error",
        description: "Failed to close ticket",
        variant: "destructive",
      })
    }
  }

  const filteredTickets = supportTickets.filter((ticket) => {
    if (activeTab === "new") return ticket.status === "NEW"
    if (activeTab === "open") return ticket.status === "OPEN" || ticket.status === "PROCESSING"
    if (activeTab === "closed") return ticket.status === "CLOSED"
    if (activeTab === "archived") return ticket.status === "ARCHIVED"
    return true
  })

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800"
      case "OPEN":
        return "bg-green-100 text-green-800"
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      case "ARCHIVED":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 text-[0.75rem] pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-[0.9rem] font-bold tracking-tight">Support Center</h2>
      </div>

      <Tabs defaultValue="new" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">New Tickets</TabsTrigger>
          <TabsTrigger value="open">Open Tickets</TabsTrigger>
          <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "new"
                  ? "New Support Tickets"
                  : activeTab === "open"
                  ? "Open Support Tickets"
                  : activeTab === "closed"
                  ? "Closed Support Tickets"
                  : "Archived Support Tickets"}
              </CardTitle>
              <CardDescription>View and respond to customer support requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">Loading support tickets...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-[0.75rem] bg-gray-100 ">
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No {activeTab} tickets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="text-[0.75rem] ">
                          <TableCell className="font-medium">{ticket.user.name}</TableCell>
                          <TableCell>
                            {ticket.user.email}
                            <br />
                            <span className="text-[0.75rem] text-muted-foreground">{ticket.user.phone || "—"}</span>
                          </TableCell>
                          <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeStyle(ticket.status)}`}
                            >
                              {ticket.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button className="bg-gray-400" variant="ghost" size="sm" onClick={() => handleViewTicket(ticket)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] font-medium text-gray-700 bg-white">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Support Ticket #{selectedTicket.id}</DialogTitle>
                <DialogDescription>
                  From: {selectedTicket.user.name} ({selectedTicket.user.email})
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="rounded-md bg-gray-50 p-4 ">
                  <p className="text-[0.75rem]">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[0.75rem] font-medium">Previous Responses:</h4>
                    {selectedTicket.responses.map((response) => (
                      <div key={response.id} className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                        <p className="text-[0.75rem]">{response.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {response.respondedBy} on {formatDateTime(response.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "ARCHIVED" && (
                  <div className="space-y-2">
                    <label className="text-[0.75rem] font-medium">Reply to customer:</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-[0.75rem]"
                      placeholder="Type your response here..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                    ></textarea>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="close-ticket"
                        checked={closeAfterReply}
                        onCheckedChange={setCloseAfterReply}
                      />
                      <Label htmlFor="close-ticket">Close ticket after reply</Label>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "ARCHIVED" && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleArchiveTicket}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-500 text-gray-100"
                        onClick={handleCloseTicket}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    </>
                  )}
                </div>
                {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "ARCHIVED" && (
                  <Button
                    type="submit"
                    onClick={handleSendResponse}
                    disabled={!responseMessage.trim() || submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Sending..." : closeAfterReply ? "Send & Close" : "Send Reply"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}