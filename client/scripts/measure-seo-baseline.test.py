"""Synthetic isolation tests; no public API or visitor data accessed."""
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('baseline', Path(__file__).with_name('measure-seo-baseline.py'))
b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)

class BaselineChecks(unittest.TestCase):
    def test_unknown_canonical_is_redacted(self):
        p = b.Head(); p.feed('<link rel="canonical" href="https://proanalize.ru/result/synthetic?token=test">')
        self.assertEqual(p.canonical, 'unexpected_redacted')
    def test_quota_is_not_zero_performance(self):
        with patch.object(b, 'fetch', return_value=(429, {}, b'')):
            data = b.psi('mobile')
        self.assertEqual(data['status'], 'unavailable')
        self.assertNotIn('lab_performance_score', data)
    def test_only_aggregate_psi_fields_retained(self):
        import json
        payload = {'id': 'sensitive-not-retained', 'lighthouseResult': {'audits': {
            'largest-contentful-paint': {'numericValue': 1234, 'details': 'sensitive-not-retained'},
            'other': {'numericValue': 99}}, 'categories': {'performance': {'score': 0.8}}}}
        with patch.object(b, 'fetch', return_value=(200, {}, json.dumps(payload).encode())):
            data = b.psi('desktop')
        self.assertEqual(data['lab_metrics']['largest-contentful-paint'], 1234)
        self.assertNotIn('sensitive-not-retained', json.dumps(data))
        self.assertEqual(data['field_cwv_assessment'], 'not_established_by_this_snapshot')

if __name__ == '__main__': unittest.main()
