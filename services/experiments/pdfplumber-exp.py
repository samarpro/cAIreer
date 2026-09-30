import pdfplumber

with pdfplumber.open("/Users/samkanu/Projects/AI/cAIreer/services/experiments/fixtures/001Sam_KanuResume-5 copy.pdf") as pdf:
    first_page = pdf.pages[0]
    print(first_page.)


