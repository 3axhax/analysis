import json
import unittest

from fastapi import HTTPException

from app import clean_table, group_words_by_rows, parse_pages, parse_table_settings


class ParserOptionsTest(unittest.TestCase):
    def test_clamps_processing_to_five_pages(self):
        self.assertEqual(parse_pages("1-5"), [1, 2, 3, 4, 5])
        with self.assertRaises(HTTPException) as error:
            parse_pages("1-6")
        self.assertEqual(error.exception.status_code, 422)

    def test_rejects_unknown_table_settings(self):
        with self.assertRaises(HTTPException) as error:
            parse_table_settings(json.dumps({"explicit_vertical_lines": [1]}))
        self.assertEqual(error.exception.status_code, 422)

    def test_rows_are_ordered_top_to_bottom(self):
        words = [
            {"text": "bottom", "top": 100, "x0": 0},
            {"text": "right", "top": 10, "x0": 50},
            {"text": "top", "top": 10, "x0": 0},
        ]
        self.assertEqual(group_words_by_rows(words), [["top right"], ["bottom"]])

    def test_clean_table_keeps_ragged_rows_without_private_text_output(self):
        self.assertEqual(clean_table([[None, "  "], ["marker", " 1.2 "]]), [["marker", "1.2"]])


if __name__ == "__main__":
    unittest.main()
