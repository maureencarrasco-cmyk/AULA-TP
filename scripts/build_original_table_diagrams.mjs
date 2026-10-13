import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

if(!process.argv[2])throw new Error('Provide the read-only original catalog export.');
const source=readFileSync(process.argv[2],'utf8');
const catalog=JSON.parse(source);
const records=new Map();
for(const module of catalog.modules){
  for(const [aeIndex,ae] of (module.raw?.aes||[]).entries()){
    for(const [experienceIndex,exp] of (ae.experiences||[]).entries()){
      const table=exp.table;
      if(!Array.isArray(table)||table.length<2||!table.every(row=>Array.isArray(row)))continue;
      const key=JSON.stringify([module.course_title,module.title,table]);
      const record=records.get(key)||{course:module.course_title,module:module.title,table,locations:[]};
      record.locations.push({moduleId:module.id,aeIndex,experienceIndex});
      records.set(key,record);
    }
  }
}
const output={version:1,sourceSha256:createHash('sha256').update(source).digest('hex'),records:[...records.values()]};
writeFileSync(new URL('../static/original-table-catalog.json',import.meta.url),JSON.stringify(output)+'\n');
console.log(JSON.stringify({records:records.size,locations:output.records.reduce((n,r)=>n+r.locations.length,0)}));
