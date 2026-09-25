import { NextRequest, NextResponse } from 'next/server';
import { getStudentProgress } from '@/lib/climatizacion-lms-store';
import { getSessionStudentId } from '@/lib/climatizacion-auth';
import { ESTACIONES_M1 } from '@/lib/m1-planos-estaciones';
import { ESTACIONES_M2 } from '@/lib/m2-medicion-estaciones';
import { ESTACIONES_M3 } from '@/lib/m3-redes-estaciones';
import { ESTACIONES_M4 } from '@/lib/m4-equipos-estaciones';
import { ESTACIONES_M5 } from '@/lib/m5-puesta-estaciones';
import { ESTACIONES_M6 } from '@/lib/m6-diagnostico-estaciones';
import { ESTACIONES_M7 } from '@/lib/m7-mantencion-estaciones';
import { ESTACIONES_M8 } from '@/lib/m8-reciclaje-estaciones';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
 const id = getSessionStudentId(req) || req.nextUrl.searchParams.get('studentId');
 if (!id) return NextResponse.json({error:'Selecciona un estudiante'}, {status:400});
 const data=getStudentProgress(id);
 if (!data.student) return NextResponse.json({error:'Estudiante no encontrado'}, {status:404});
 const lists=[ESTACIONES_M1,ESTACIONES_M2,ESTACIONES_M3,ESTACIONES_M4,ESTACIONES_M5,ESTACIONES_M6,ESTACIONES_M7,ESTACIONES_M8];
 const modules=lists.map((stations,i)=>{
  const done=new Set(data.progress.modules[String(i+1)]?.completedStationIds || []);
  const completed=stations.filter(s=>done.has(s.id)).length;
  const next=stations.find(s=>!done.has(s.id));
  return {numero:i+1,completed,total:stations.length,pct:Math.round(completed/stations.length*100),nextSlug:next?.slug,nextTitle:next?.titulo};
 });
 const level = /^\s*([34])\s*[°º]/.exec(data.student.curso)?.[1];
 const scoped = modules.filter(m=>!level || (level==='3' ? m.numero<=4 : m.numero>=5));
 const completed=scoped.reduce((sum,m)=>sum+m.completed,0);
 const total=scoped.reduce((sum,m)=>sum+m.total,0);
 const next=scoped.find(m=>m.completed<m.total);
 return NextResponse.json({studentId:id,modules,overview:{
   studentName:data.student.name,curso:data.student.curso,
   especialidad:'Refrigeración y Climatización',nivel:level?`${level}° Medio`:'No informado',
   periodo:null,programa:'Formación diferenciada técnico-profesional',
   scope:level==='3'?'3° medio · M1–M4':level==='4'?'4° medio · M5–M8':'Curso completo · M1–M8',
   completed,total,pct:total?Math.round(completed/total*100):0,
   completedModules:scoped.filter(m=>m.completed===m.total).length,totalModules:scoped.length,
   nextModule:next?.numero,nextSlug:next?.nextSlug,nextTitle:next?.nextTitle,
 }},{headers:{'Cache-Control':'no-store'}});
}
