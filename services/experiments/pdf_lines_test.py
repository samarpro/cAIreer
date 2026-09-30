import unittest
from pathlib import Path

from pdf_lines import extract_lines, group_fragments


class GroupFragmentsTest(unittest.TestCase):
    def test_same_y_joins_left_to_right(self):
        lines = group_fragments(
            [
                (1, 10.0, 700.0, "Jane"),
                (1, 40.0, 700.5, "Doe"),
                (1, 10.0, 680.0, "Engineer"),
            ]
        )
        self.assertEqual([line.text for line in lines], ["Jane Doe", "Engineer"])
        self.assertEqual(lines[0].y, 700.0)

    @unittest.skipUnless(Path("fixtures/hello.pdf").exists(), "Local PDF fixture not supplied")
    def test_fixture_pdf_has_one_line(self):
        lines = extract_lines(Path("fixtures/hello.pdf"))
        self.assertEqual([line.text for line in lines], ["Hello cAIreer"])
        self.assertEqual(lines[0].page, 1)

    @unittest.skipUnless(Path("fixtures/001Sam_KanuResume-5 copy.pdf").exists(), "Local private PDF fixture not supplied")
    def test_resume_drops_full_page_blob(self):
        lines = extract_lines(Path("fixtures/001Sam_KanuResume-5 copy.pdf"))
        self.assertGreater(len(lines), 20)
        self.assertLess(max(len(line.text) for line in lines), 800)


if __name__ == "__main__":
    unittest.main()
