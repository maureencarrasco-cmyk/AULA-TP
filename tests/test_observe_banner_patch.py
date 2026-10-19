import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'city-panel'))
import deploy_observe_banner


class ObserveBannerPatchTests(unittest.TestCase):
    def test_adds_phase_station_context_to_verified_renderer(self):
        source=deploy_observe_banner.WORLD_HOOK.encode()
        fixture=b'prefix;'+source+b';suffix'
        result=deploy_observe_banner.add_phase_station_context(fixture)
        self.assertTrue(result.startswith(b'prefix;'))
        self.assertTrue(result.endswith(b';suffix'))
        self.assertIn(b'phaseStations:i6',result)
        self.assertNotIn(source,result)

    def test_rejects_missing_or_ambiguous_hooks(self):
        anchor=deploy_observe_banner.WORLD_HOOK.encode()
        for source in (b'unknown',anchor+anchor):
            with self.assertRaises(ValueError):
                deploy_observe_banner.add_phase_station_context(source)

    def test_rejects_an_unknown_renderer(self):
        with self.assertRaises(ValueError):
            deploy_observe_banner.patch_world(b'unknown world build')

    def test_quiz_stage_signs_are_hidden_without_removing_navigation(self):
        source=(ROOT/'city-panel/native-route.js').read_text(encoding='utf-8')
        self.assertIn('function hideQuizPhaseSigns(ctx)',source)
        self.assertIn('node.visible=false',source)
        self.assertNotIn('function createPhaseBanner(',source)
        self.assertNotIn('assets/quiz-observe-stage.png',source)
        self.assertIn("phaseStations||[]",source)
        self.assertIn('const arrows=[]',source)
        self.assertIn('function path(ctx,target)',source)

    def test_each_quiz_station_gets_a_numbered_glowing_interaction_marker(self):
        source=(ROOT/'city-panel/native-route.js').read_text(encoding='utf-8')
        self.assertIn('function createQuizMarkers(ctx)',source)
        self.assertIn('Quiz ${index+1}',source)
        self.assertIn("c.fillText('E',932,164)",source)
        self.assertIn('marker.sign.rotation.y=Math.atan2',source)
        self.assertIn('station.equipment||station.name',source)
        self.assertIn('markerHaloGeometry=new T.bdM(1.28,1.28)',source)
        self.assertIn('depthTest:false,depthWrite:false',source)
        styles=(ROOT/'city-panel/city-panel.css').read_text(encoding='utf-8')
        self.assertIn('.city-native-route-active .city-native-guide>strong,.city-native-route-active .city-native-guide>kbd { display:none!important; }',styles)


if __name__=='__main__':unittest.main()
