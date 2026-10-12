import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const scope={window:{}};
vm.createContext(scope);
const catalogSource=readFileSync(new URL('static/course-artwork-catalog.js',root),'utf8');
vm.runInContext(catalogSource,scope);
const origin=process.argv[2]||'https://aulatpchile.cl';
const courses=Object.values(scope.window.AulaCourseArtworkData.courses);
const images=courses.flatMap(course=>[{course:course.title,module:null,...course.cover},...course.modules.map(module=>({course:course.title,module:module.title,...module.photo}))]);
const results=[];
let cursor=0;
async function worker(){
  while(cursor<images.length){
    const photo=images[cursor++];
    try {
      let response;
      for(let attempt=0;attempt<3;attempt++){
        try{response=await fetch(new URL(photo.image,origin),{method:'HEAD',signal:AbortSignal.timeout(20000)});break;}
        catch(error){if(attempt===2)throw error;}
      }
      const type=response.headers.get('content-type')||'';
      const bytes=Number(response.headers.get('content-length'));
      const localBytes=readFileSync(new URL(photo.image.slice(1),root)).length;
      results.push({course:photo.course,module:photo.module,image:photo.image,status:response.status,type,bytes,ok:response.ok&&type.startsWith('image/')&&bytes===localBytes});
    }catch(error){results.push({course:photo.course,module:photo.module,image:photo.image,ok:false,error:error.message});}
    if(results.length%100===0)console.log(JSON.stringify({checked:results.length,passed:results.filter(result=>result.ok).length}));
  }
}
await Promise.all(Array.from({length:6},worker));
const failed=results.filter(result=>!result.ok);
const report={checkedAt:new Date().toISOString(),catalogHash:createHash('sha256').update(catalogSource).digest('hex'),origin,courses:courses.length,modules:images.length-courses.length,images:images.length,passed:results.length-failed.length,failed:failed.length,results};
const folder=new URL('reports/course-artwork-20261011/',root);
mkdirSync(folder,{recursive:true});
writeFileSync(new URL('production-audit.json',folder),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({origin,courses:report.courses,modules:report.modules,images:report.images,passed:report.passed,failed}));
if(failed.length)process.exitCode=1;
