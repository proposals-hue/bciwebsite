import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bci_product_pipeline as p


class ProductPipelineTests(unittest.TestCase):
    def test_yes_item_with_category_publishes(self):
        rows = [
            {
                "item_code": "FG-1",
                "item_name": "BC Test WHITE 20 KG PAIL",
                "item_group": p.FG_GROUP,
                "workflow_state": "Approved",
                "custom_bci_website_sync": "Yes",
                "custom_bci_website_category": "Waterproofing & Roofing",
                "custom_packaging": "Pail",
                "custom_packaging_in_kg": 20,
                "description": "BC Test is a waterproofing product for concrete roofs.",
                "image": "/files/test.png",
                "custom_tdsattachement": "/private/files/BC Test.pdf",
            }
        ]
        families, summary = p.group_items(rows)
        self.assertEqual(summary["families"], 1)
        self.assertEqual(families[0]["slug"], "waterproofing-roofing")
        self.assertEqual(families[0]["sizes"], ["20 kg pail"])
        self.assertEqual(families[0]["colors"], ["White"])

    def test_no_item_does_not_publish(self):
        rows = [
            {
                "item_code": "FG-2",
                "item_name": "BC Hidden 20 KG",
                "item_group": p.FG_GROUP,
                "custom_bci_website_sync": "No",
                "custom_bci_website_category": "Waterproofing & Roofing",
            }
        ]
        families, summary = p.group_items(rows)
        self.assertEqual(families, [])
        self.assertEqual(summary["skipped"]["not_yes"], 1)

    def test_yes_without_category_is_skipped_for_review(self):
        rows = [
            {
                "item_code": "FG-3",
                "item_name": "BC Needs Category",
                "item_group": p.FG_GROUP,
                "custom_bci_website_sync": "Yes",
                "custom_bci_website_category": "",
            }
        ]
        families, summary = p.group_items(rows)
        self.assertEqual(families, [])
        self.assertEqual(summary["missing_category"], ["FG-3"])

    def test_component_row_only_enriches_matching_published_family(self):
        rows = [
            {
                "item_code": "FG-4",
                "item_name": "BC 237 POLYUREA SYSTEM GREY 30 KG",
                "item_group": p.FG_GROUP,
                "custom_bci_website_sync": "Yes",
                "custom_bci_website_category": "Polyurea & Elastomeric Membranes",
                "custom_packaging_in_kg": 30,
                "custom_packaging": "Set",
            },
            {
                "item_code": "CMP-4",
                "item_name": "BC 237 POLYOL A 15 KG",
                "item_group": p.COMPONENT_GROUP,
                "custom_packaging_in_kg": 15,
                "custom_packaging": "Pail",
                "custom_tdsattachement": "/private/files/BC 237.pdf",
            },
        ]
        families, summary = p.group_items(rows)
        self.assertEqual(summary["families"], 1)
        self.assertIn("15 kg pail", families[0]["sizes"])
        self.assertEqual(families[0]["n_tds"], 1)

    def test_equal_length_family_descriptions_are_deterministic(self):
        rows = [
            {
                "item_code": "FG-5A",
                "item_name": "BC Stable 100 KG",
                "item_group": p.FG_GROUP,
                "custom_bci_website_sync": "Yes",
                "custom_bci_website_category": "Waterproofing & Roofing",
                "description": "ZZZZ",
            },
            {
                "item_code": "FG-5B",
                "item_name": "BC Stable 200 KG",
                "item_group": p.FG_GROUP,
                "custom_bci_website_sync": "Yes",
                "custom_bci_website_category": "Waterproofing & Roofing",
                "description": "AAAA",
            },
        ]
        families, _summary = p.group_items(rows)
        self.assertEqual(families[0]["desc"], "AAAA")

    def test_explicit_color_field_takes_precedence(self):
        row = {
            "item_name": "BC Coating WHITE BLACK",
            "custom_color_selection": "traffic blue; dark grey",
        }
        self.assertEqual(p.colors_for_record(row), ["Dark Grey", "Traffic Blue"])

    def test_private_tds_becomes_public_files_url(self):
        self.assertEqual(
            p.tds_url("/private/files/BC Test Sheet.pdf"),
            "https://apcv14.lynx.sa/files/BC%20Test%20Sheet.pdf",
        )


if __name__ == "__main__":
    unittest.main()
