import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'city-panel'))
import deploy_observe_banner


class ObserveBannerPatchTests(unittest.TestCase):
    def test_verified_renderer_already_exposes_phase_station_context(self):
        source=deploy_observe_banner.WORLD_HOOK.encode()
        fixture=b'prefix;'+source+b';suffix'
        result=deploy_observe_banner.add_phase_station_context(fixture)
        self.assertTrue(result.startswith(b'prefix;'))
        self.assertTrue(result.endswith(b';suffix'))
        self.assertIn(b'phaseStations:i6',result)
        self.assertEqual(result,fixture)

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
        self.assertIn('phases.some(phase=>name.includes(phase))',source)
        self.assertIn('roomPosition.x+station.x,roomPosition.z+station.z',source)
        self.assertIn('first.width<1.1||first.width>7||first.height<.15||first.height>2.2',source)
        self.assertNotIn('function createPhaseBanner(',source)
        self.assertNotIn('assets/quiz-observe-stage.png',source)
        self.assertIn("phaseStations||[]",source)
        self.assertIn('const arrows=[]',source)
        self.assertIn('function path(ctx,target)',source)

    def test_each_quiz_station_gets_the_specialty_hologram_and_interaction_marker(self):
        source=(ROOT/'city-panel/native-route.js').read_text(encoding='utf-8')
        self.assertIn('function createQuizMarkers(ctx)',source)
        self.assertIn('Quiz ${index+1}',source)
        self.assertNotIn("c.fillText('E',",source)
        self.assertIn('marker.sign.rotation.y=facing',source)
        self.assertIn('station.equipment||station.name',source)
        self.assertIn('stageAnchors.push({x:position.x,y:position.y,z:position.z})',source)
        self.assertIn('anchorCenterX+.9+mobileShiftX+(anchor.x-anchorCenterX)*1.3',source)
        self.assertIn('Math.sign(playerZ-anchorCenterZ)*5.9',source)
        self.assertIn('(anchor?.z??z)+forward',source)
        self.assertNotIn('legacySigns.get(index)',source)
        self.assertIn('function drawQuizSpecialtyIcon(c,name,cx,cy)',source)
        self.assertIn('drawQuizSpecialtyIcon(c,ctx.specialty.name,220,171)',source)
        self.assertIn('markerGeometry=new T.bdM(3.65,1.04)',source)
        self.assertIn('markerImageGeometry=new T.bdM(2.05,1.37)',source)
        self.assertIn('markerHaloGeometry=new T.bdM(2.8,2.8)',source)
        self.assertIn('halo.position.set(displayX,floorY,displayZ)',source)
        self.assertIn('markerBeamGeometry=new T.bdM(2.12,2.32)',source)
        self.assertIn('markerScale=Math.min(.9,Math.max(.7,window.innerWidth/1500))',source)
        self.assertIn('sign.scale.setScalar(markerScale)',source)
        self.assertIn('markerCylinderGeometry=Cylinder?',source)
        self.assertIn('createStationArtwork(ctx,station,index,token,imageUrl,marker,canvas,displayX,displayZ,floorY,markerScale)',source)
        self.assertIn('function specialtyPhotos(name)',source)
        self.assertIn('const usedImages=new Set()',source)
        self.assertIn('for(const spacing of [3.15,3,2.85])',source)
        self.assertIn('cx+(index-1.5)*spacing',source)
        self.assertIn('mobileShiftX=mobileViewport?-.45:0',source)
        self.assertIn('for(let sparkle=0;sparkle<6;sparkle++)',source)
        self.assertNotIn('c.arc(106,160,68,0,Math.PI*2)',source)
        self.assertIn('depthTest:false,depthWrite:false',source)
        self.assertIn('function hideLegacyQuizFurniture(ctx,hide)',source)
        styles=(ROOT/'city-panel/city-panel.css').read_text(encoding='utf-8')
        self.assertIn('.city-native-route-active .city-quiz-marker-control-layer',styles)


if __name__=='__main__':unittest.main()
