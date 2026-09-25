import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">cAIreer app</h1>
          <p>Product application. No product features yet.</p>
          <Button className="mt-2">Button</Button>
        </div>
      </div>
    </div>
  )
}
