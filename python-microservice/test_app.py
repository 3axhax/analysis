import json
import unittest

from fastapi import HTTPException

from app import (
    clean_table,
    group_words_by_rows,
    is_probable_encoding_artifact,
    normalize_mixed_script_codes,
    parse_pages,
    parse_table_settings,
    strip_leading_encoding_artifact,
    trim_ocr_label,
)


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

    def test_clean_table_removes_long_punctuation_encoding_artifact(self):
        artifact = '! \\\\ " # $ % & ’ % ( ) * ( + , ’ ( - $ ( ( * . / ) 0 1 2 3 4 5'

        self.assertTrue(is_probable_encoding_artifact(artifact))
        self.assertEqual(
            clean_table([[artifact], ["marker", "1.2"]]),
            [["marker", "1.2"]],
        )

    def test_clean_table_keeps_numeric_ranges_and_short_units(self):
        table = [["0.01 - 0.20", "1.00 - 2.00"], ["12.3", "%"]]

        self.assertFalse(is_probable_encoding_artifact(" ".join(table[0])))
        self.assertEqual(clean_table(table), table)

    def test_clean_table_strips_artifact_prefix_but_keeps_numeric_tail(self):
        artifact = '! \\\\ " # $ % & ’ % ( ) * ( + , ’ ( - $ ( ( * . / ) 0 1 2 3 4 5'
        corrupted = f"{artifact} 7.89 unit 1 - 9"

        self.assertEqual(
            strip_leading_encoding_artifact(corrupted),
            "7.89 unit 1 - 9",
        )
        self.assertEqual(clean_table([[corrupted]]), [["7.89 unit 1 - 9"]])

    def test_trim_ocr_label_removes_numeric_tail_after_parenthetical_code(self):
        self.assertEqual(
            trim_ocr_label("Synthetic label (ABC) 7.89 unit 1 - 9"),
            "Synthetic label (ABC)",
        )
        self.assertIsNone(trim_ocr_label("Synthetic label without code 7.89"))

    def test_clean_table_removes_artifact_split_across_leading_cells(self):
        table = [[
            "! \\\\ # $ %",
            "& ’ % ( ) *",
            "+ , ’ ( - $ ( ( * . / ) 0 1 2 3",
            "7.89 unit",
        ]]

        self.assertEqual(clean_table(table), [["", "", "", "7.89 unit"]])

    def test_normalizes_mixed_script_codes_to_latin(self):
        self.assertEqual(
            normalize_mixed_script_codes("МСHС (ср. конц.)"),
            "MCHC (ср. конц.)",
        )
        self.assertEqual(normalize_mixed_script_codes("Р-LCR"), "P-LCR")
        self.assertEqual(
            clean_table([["МСHС", "7.89 unit"]]),
            [["MCHC", "7.89 unit"]],
        )

    def test_mixed_script_normalization_preserves_non_target_text(self):
        samples = ["MCHC", "СОЭ", "Обычный русский текст", "СмешанныйText"]

        for sample in samples:
            with self.subTest(sample=sample):
                self.assertEqual(normalize_mixed_script_codes(sample), sample)


if __name__ == "__main__":
    unittest.main()
