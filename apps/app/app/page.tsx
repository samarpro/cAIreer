import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">cAIreer app</h1>
          <p>
            Product integration is paused while resume and browser evaluations are
            built and measured.
          </p>
          <Button className="mt-2" disabled>
            Evaluation in progress
          </Button>
        </div>
      </div>
    </div>
  )
}
