import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = name => fs.readFileSync(new URL(`../static/${name}`, import.meta.url), 'utf8');
const documentStub = () => ({readyState:'complete', body:{}, addEventListener(){}, querySelectorAll(){return [];}});

function narration(extra={}) {
  const scope=vm.createContext({window:{}, document:documentStub(), ...extra});
  vm.runInContext(source('narration.js'), scope);
  return scope.window.AulaNarration;
}

test('Voice timing reads both native timestamp forms and preserves all eight tracks',()=>{
  const api=narration();
  for(const name of ['m1','m2','m3','m4','general','electricidad','enfermeria','climate']){
    const text=source(`media/${name}-secuencia.vtt`);
    const cues=api.parseVtt(text);
    const technical=/^m\d$/.test(name);
    assert.equal(cues.length, technical?4:3);
    assert.equal(cues.at(-1).end, technical?60:15);
  }
  const cues=api.parseVtt('WEBVTT\n\nidentifier\n00:59:59.000 --> 01:00:00.000 align:start\nOriginal caption\n123\n');
  assert.equal(cues[0].start,3599);
  assert.equal(cues[0].end,3600);
  assert.equal(cues[0].text,'Original caption 123');
  assert.equal(api.parseVtt('WEBVTT\n\n00:45.000 --> 00:60.000\nInvalid').length,0);
  assert.equal(api.parseVtt('WEBVTT\n\nNOTE ignored\n00:00.000 --> 00:05.000\nComment').length,0);
});

test('Captions still update when speech is unavailable and playback events do not throw',async()=>{
  const events=new Map(), caption={textContent:''}, button={disabled:false,textContent:'',setAttribute(){},addEventListener(){}};
  const video={dataset:{},currentTime:2,paused:false,
    querySelector:()=>({getAttribute:()=>'/test.vtt'}),
    closest:()=>({querySelector:selector=>selector==='.vis-voice-cue'?caption:button}),
    addEventListener:(name,fn)=>events.set(name,fn)};
  const api=narration({fetch:async()=>({ok:true,text:async()=> 'WEBVTT\n\n00:00.000 --> 00:05.000\nOriginal caption'})});
  api.hydrate({querySelectorAll:()=>[video]});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(button.disabled,true);
  events.get('timeupdate')();
  assert.equal(caption.textContent,'Original caption');
  assert.doesNotThrow(()=>events.get('pause')());
  video.currentTime=5;
  assert.doesNotThrow(()=>events.get('ended')());
  assert.equal(caption.textContent,'');
});

test('Video posters use the current module artwork without changing the resource or subtitles',()=>{
  const course={id:6,title:'Gastronomia'},current={course_id:6,id:55};
  const scope=vm.createContext({window:{},document:documentStub(),MutationObserver:class{observe(){}},current,courses:[course],
    esc:value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;'),
    moduleArtworkPhoto:(c,m)=>c===course&&m===current?{image:'/static/situation-photos/kitchen.jpg'}:null,
    courseArtworkPhoto:()=>({image:'/static/cover.jpg'})});
  vm.runInContext(source('visual-sim.js'),scope);
  vm.runInContext(source('media-fallback.js'),scope);
  const exp={video:'/original.mp4',vtt:'/original.vtt',caption:'Original caption'};
  const before=JSON.stringify(exp), html=scope.window.AulaVisual.videoFigure(exp);
  assert.match(html,/poster="\/static\/situation-photos\/kitchen.jpg"/);
  assert.match(html,/preload="metadata"/);
  assert.match(html,/src="\/original.mp4"/);
  assert.match(html,/src="\/original.vtt"/);
  assert.equal(JSON.stringify(exp),before);
  scope.moduleArtworkPhoto=()=>null;
  assert.equal(scope.window.AulaMediaFallback.posterFor(course),'/static/cover.jpg');
  scope.courseArtworkPhoto=()=>null;
  assert.equal(scope.window.AulaMediaFallback.posterFor(course),'');
  assert.doesNotMatch(scope.window.AulaVisual.videoFigure(exp),/poster=/);
  assert.match(scope.window.AulaVisual.videoFigure({...exp,poster:'/approved.jpg'}),/poster="\/approved.jpg"/);
});
