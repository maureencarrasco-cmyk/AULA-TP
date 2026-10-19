import hashlib
import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('native_route_patch',Path(__file__).resolve().parents[1]/'city-panel/deploy_native_route.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class NativeRoutePatchTests(unittest.TestCase):
    def test_only_one_fingerprinted_anchor_is_replaced(self):
        source=b'before;ac.render(as,af),r9();after'
        digest=hashlib.sha256(source).hexdigest()
        result=module.patch(source,digest,module.WORLD_ANCHOR,module.WORLD_HOOK)
        self.assertTrue(result.startswith(b'before;'))
        self.assertTrue(result.endswith(b';after'))
        self.assertIn(b'colliders:i3',result)
        self.assertEqual(result.count(b'ac.render(as,af),r9()'),1)

    def test_unknown_build_is_rejected(self):
        with self.assertRaises(ValueError):
            module.patch(b'unknown','0'*64,module.WORLD_ANCHOR,module.WORLD_HOOK)

    def test_ambiguous_anchor_is_rejected(self):
        source=(module.WORLD_ANCHOR*2).encode()
        with self.assertRaises(ValueError):
            module.patch(source,hashlib.sha256(source).hexdigest(),module.WORLD_ANCHOR,module.WORLD_HOOK)

    def test_progress_hook_keeps_the_original_save_and_does_not_grade(self):
        self.assertTrue(module.LEARNING_HOOK.startswith(module.LEARNING_ANCHOR))
        self.assertIn('answers:N.answers',module.LEARNING_HOOK)
        self.assertNotIn('correct=',module.LEARNING_HOOK)

if __name__=='__main__':unittest.main()
