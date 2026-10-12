'use strict';
const courseArtworkRows = Object.values(window.AulaCourseArtworkData?.courses || {});
const courseArtworkFold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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
  const match = record.modules.find(row => module?.id && row.id === Number(module.id))
    || record.modules.find(row => module?.title && courseArtworkFold(row.title) === courseArtworkFold(module.title))
    || record.modules.find(row => row.position === Number(position));
  return match?.photo || null;
}
function courseArtworkCredit(photo) {
  if (!photo?.source || !/^https:\/\/commons\.wikimedia\.org\//.test(photo.source)) return '';
  const text = `${photo.author} \u00b7 ${photo.license}`;
  return `<a class="course-artwork-credit" href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer" title="${esc(text)}" aria-label="Cr\u00e9dito de la fotograf\u00eda: ${esc(text)}">${esc(text)}</a>`;
}
