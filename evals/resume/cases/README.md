# Labelled cases

Add one JSON file per redistributable resume using the format in the parent README. These tracked case files can point to `fixtures/public`.

For a personal or otherwise non-redistributable resume, keep both the PDF and its case JSON together in the ignored `fixtures/private` directory. Run that JSON directly with the evaluation CLI. This keeps extracted contact details and resume text out of Git as well as the source PDF.

Do not add a case until a person has checked the expected text, reading order, semantic kind, and box coordinates.
