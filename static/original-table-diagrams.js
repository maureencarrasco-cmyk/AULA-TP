'use strict';
(function(){
  let pending=null,originals=new Set(),records=[];
  const fold=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const key=(course,module,table)=>JSON.stringify([fold(course),fold(module),table]);
  const xml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

  function setCatalog(catalog){
    records=catalog?.records||[];
    originals=new Set(records.map(row=>key(row.course,row.module,row.table)));
  }
  function ensure(){
    if(pending)return pending;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),3000);
    pending=fetch('/static/original-table-catalog.json?v=20261012-original-data-v1',{signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error('Diagram catalog unavailable');return response.json();})
      .then(setCatalog).catch(()=>{pending=null;}).finally(()=>clearTimeout(timeout));
    return pending;
  }
  function eligible(table){
    return Array.isArray(table)&&table.length>=2&&table.length<=13
      &&Array.isArray(table[0])&&table[0].length>=2&&table[0].length<=5
      &&table.every(row=>Array.isArray(row)&&row.length===table[0].length
        &&row.every(cell=>cell===null||['string','number','boolean'].includes(typeof cell)));
  }
  function lines(text,max=42){
    const words=String(text??'').split(/\s+/),output=[];
    let line='';
    for(const word of words){
      if(word.length>max)return null;
      if(line&&line.length+word.length+1>max){output.push(line);line=word;}
      else line+=(line?' ':'')+word;
    }
    output.push(line);
    return output;
  }
  function svg(table){
    if(!eligible(table))return '';
    const blocks=table.slice(1).map(row=>row.map((value,i)=>lines(i?`${table[0][i]}: ${value??''}`:value)));
    if(blocks.some(block=>block.some(text=>!text)))return '';
    const sizes=blocks.map(block=>32+block.reduce((n,text)=>n+text.length*24+8,0));
    const width=1000,gap=24,padding=24,cellWidth=(width-padding*2-gap)/2;
    let y=padding,body='';
    for(let i=0;i<blocks.length;i+=2){
      const height=Math.max(sizes[i],sizes[i+1]||0);
      for(let j=i;j<Math.min(i+2,blocks.length);j++){
        const x=padding+(j%2)*(cellWidth+gap);
        body+=`<rect x="${x}" y="${y}" width="${cellWidth}" height="${height}" rx="6" fill="#f2f9fc" stroke="#83bdce"/>`;
        let baseline=y+30;
        blocks[j].forEach((text,index)=>{
          for(const line of text){body+=`<text x="${x+18}" y="${baseline}" font-size="18" font-weight="${index?'400':'700'}" fill="#123957">${xml(line)}</text>`;baseline+=24;}
          baseline+=8;
        });
      }
      y+=height+gap;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}" font-family="Arial,sans-serif"><title>Datos de la tabla original</title>${body}</svg>`;
  }
  function figure(exp){
    if(!exp?.phase||typeof current==='undefined'||typeof courses==='undefined'||!window.AulaVisual)return '';
    const course=courses.find(item=>item.id===current?.course_id);
    if(!course)return '';
    let table=exp.table;
    if(table){
      if(!originals.has(key(course.title,current.title,table)))return '';
      if(typeof ae!=='number'||!records.some(row=>key(row.course,row.module,row.table)===key(course.title,current.title,table)
        &&row.locations?.some(location=>location.aeIndex===ae)))return '';
    }else if(typeof ae==='number'&&typeof step==='number'){
      table=records.find(row=>fold(row.course)===fold(course.title)&&fold(row.module)===fold(current.title)
        &&row.locations?.some(location=>location.aeIndex===ae&&location.experienceIndex===step))?.table;
    }
    const image=svg(table);
    if(!image)return '';
    const alt=table.map(row=>row.map(cell=>String(cell??'')).join(' · ')).join('; ');
    return window.AulaVisual.figure('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(image),{
      alt,role:'evidence',caption:'Representación documental, sin escala. Datos de la tabla original.',zoom:true
    });
  }
  window.AulaOriginalDiagrams={ensure,figure,setCatalog,svg};
})();
