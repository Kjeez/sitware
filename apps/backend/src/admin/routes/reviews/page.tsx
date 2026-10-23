import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Table, Tabs, Text, toast } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type ReviewStatus = "pending" | "approved" | "rejected"

type Review = {
  id: string
  product_id: string
  customer_name: string
  rating: number
  title: string | null
  content: string
  status: ReviewStatus
  verified_purchase: boolean
  created_at: string
}

const STATUS_COLOR: Record<ReviewStatus, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    throw new Error((await res.json().catch(() => ({})))?.message || "Request failed")
  }
  return res.json()
}

const ReviewsPage = () => {
  const [status, setStatus] = useState<ReviewStatus>("pending")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", status],
    queryFn: () => request<{ reviews: Review[] }>(`/admin/reviews?status=${status}`),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) =>
      request(`/admin/reviews/${input.id}`, {
        method: "POST",
        body: JSON.stringify({ status: input.status }),
      }),
    onSuccess: (_, input) => {
      toast.success(`Review ${input.status}`)
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const reviews = data?.reviews ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Product reviews</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            New reviews stay hidden on the store until approved.
          </Text>
        </div>
      </div>
      <div className="px-6 py-4">
        <Tabs value={status} onValueChange={(v) => setStatus(v as ReviewStatus)}>
          <Tabs.List>
            <Tabs.Trigger value="pending">Pending</Tabs.Trigger>
            <Tabs.Trigger value="approved">Approved</Tabs.Trigger>
            <Tabs.Trigger value="rejected">Rejected</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>
      {isLoading ? (
        <Text className="px-6 py-8">Loading...</Text>
      ) : reviews.length === 0 ? (
        <Text className="px-6 py-8 text-ui-fg-subtle">No {status} reviews.</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Rating</Table.HeaderCell>
              <Table.HeaderCell>Review</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.map((review) => (
              <Table.Row key={review.id}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <span>{review.customer_name}</span>
                    {review.verified_purchase && (
                      <span className="text-ui-fg-subtle text-xs">Verified buyer</span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{"★".repeat(review.rating)}</Table.Cell>
                <Table.Cell className="max-w-md whitespace-normal py-3">
                  {review.title && <div className="font-medium">{review.title}</div>}
                  <div className="text-ui-fg-subtle">{review.content}</div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={STATUS_COLOR[review.status]}>{review.status}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2 justify-end">
                    {review.status !== "approved" && (
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => mutate({ id: review.id, status: "approved" })}
                      >
                        Approve
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="small"
                        variant="danger"
                        disabled={isPending}
                        onClick={() => mutate({ id: review.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
