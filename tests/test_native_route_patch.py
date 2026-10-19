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

    def test_runtime_remaps_the_active_chunk_not_the_vanilla_hash(self):
        runtime=b'prefix;259:"fff471c2cc046aa1",335:"2d5507b1c96ec82d";suffix'
        result=module.remap_runtime(runtime,'259','a'*16,{'0a20356fd918231b','fff471c2cc046aa1'})
        self.assertIn(b'259:"aaaaaaaaaaaaaaaa"',result)
        self.assertIn(b'335:"2d5507b1c96ec82d"',result)

    def test_runtime_rejects_a_missing_active_chunk(self):
        with self.assertRaises(ValueError):
            module.remap_runtime(b'259:"fff471c2cc046aa1"','259','a'*16,{'0a20356fd918231b'})

    def test_progress_hook_keeps_the_original_save_and_does_not_grade(self):
        self.assertTrue(module.LEARNING_HOOK.startswith(module.LEARNING_ANCHOR))
        self.assertIn('answers:N.answers',module.LEARNING_HOOK)
        self.assertNotIn('correct=',module.LEARNING_HOOK)

if __name__=='__main__':unittest.main()
