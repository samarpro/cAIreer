from fastapi import FastAPI

app = FastAPI(title="cAIreer API")


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}
