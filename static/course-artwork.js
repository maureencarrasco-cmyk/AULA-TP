'use strict';
const courseArtworkRows = Object.values(window.AulaCourseArtworkData?.courses || {});
const courseArtworkFold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const courseContextExcludedFiles = new Set([
  'welding-1f1488510aef.jpg', 'metallurgy-60136274d7f7.jpg',
  'electronics-2a1e77c7e66d.jpg', 'electronics-a67ecad40744.jpg',
  'firstaid-05b77ba1bcb4.jpg', 'packaging-88ad01efa02e.jpg',
  'tools-53225ac8fdea.jpg', 'tiles-25f5fd35cfff.jpg',
  'tiles-2cbe9bacc4ad.jpg', 'safety-0704deb5e956.jpg',
  'packaging-31da584ac032.jpg', 'waste-b75c884467c0.jpg',
  'welding-b31e7f47391e.jpg', 'metallurgy-bf8c217d4332.jpg',
  'silviculture.jpg', 'accounting.jpg'
]);
function courseContextPhotoAllowed(photo) {
  const file = String(photo?.image || photo?.file || '').split('?')[0].split('/').pop();
  return Boolean(file) && !courseContextExcludedFiles.has(file);
}
function courseArtworkRecord(course) {
  const title = courseArtworkFold(course?.title || course?.course_title);
  const byId = window.AulaCourseArtworkData?.courses?.[course?.id || course?.course_id];
  if (byId && (!title || courseArtworkFold(byId.title) === title)) return byId;
  return courseArtworkRows.find(row => courseArtworkFold(row.title) === title) || null;
}
function courseArtworkPhoto(course) {
  return courseArtworkRecord(course)?.cover || null;
}
function moduleArtworkPhoto(course, moduleOrIndex) {
  const record = courseArtworkRecord(course);
  if (!record) return null;
  const module = typeof moduleOrIndex === 'number' ? course?.modules?.[moduleOrIndex] : moduleOrIndex;
  const position = module?.position || (typeof moduleOrIndex === 'number' ? moduleOrIndex + 1 : null);
  const title = courseArtworkFold(module?.title);
  const match = record.modules.find(row => module?.id && row.id === Number(module.id)
      && (title ? courseArtworkFold(row.title) === title : row.position === Number(position)))
    || record.modules.find(row => module?.title && courseArtworkFold(row.title) === courseArtworkFold(module.title))
    || record.modules.find(row => row.position === Number(position));
  return match?.photo || null;
}
function courseArtworkCredit(photo) {
  if (!photo?.source || !/^https:\/\/commons\.wikimedia\.org\//.test(photo.source)) return '';
  const text = `${photo.author} \u00b7 ${photo.license}`;
  return `<a class="course-artwork-credit" href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer" title="${esc(text)}" aria-label="Cr\u00e9dito de la fotograf\u00eda: ${esc(text)}">${esc(text)}</a>`;
}
function stationArtworkPhotos(course, module) {
  const record=courseArtworkRecord(course);
  const main=moduleArtworkPhoto(course,module);
  if(!record||!main)return [];
  const cases=typeof situationPhotoSet==='function'?situationPhotoSet(module,course).filter(Boolean):[];
  const first=(module.content?.encargos?.items||[]).find(item=>Number(item.station)===2);
  let learning=null;
  if(first&&typeof encargoRealPhoto==='function')learning=encargoRealPhoto(first,course,module.title);
  const fallback=[...cases,...record.modules.map(row=>row.photo),record.cover];
  const preferred=[main,learning,cases[0],cases[2],record.cover];
  const used=new Set(),photos=[];
  for(const choice of preferred){
    const photo=[choice,...fallback].find(candidate=>candidate&&courseContextPhotoAllowed(candidate)
      &&!used.has(candidate.fingerprint||candidate.source||candidate.image));
    if(!photo)return [];
    used.add(photo.fingerprint||photo.source||photo.image);photos.push(photo);
  }
  return photos;
}
function stationArtworkPhoto(course,module,n){
  return stationArtworkPhotos(course,module)[Number(n)-1]||null;
}
