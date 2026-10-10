'use strict';

function feedbackFourOptionGroups(root){
  if(!root)return [];
  const parents=new Map();
  root.querySelectorAll('input[type="radio"],input[type="checkbox"]').forEach(input=>{
    const label=input.closest('label');
    if(!label||label.querySelectorAll('input[type="radio"],input[type="checkbox"]').length!==1)return;
    const parent=label.parentElement;
    if(!parents.has(parent))parents.set(parent,new Map());
    const key=input.type==='radio'?`radio:${input.name}`:'checkbox';
    const groups=parents.get(parent);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({input,label});
  });
  return [...parents].flatMap(([parent,groups])=>[...groups.values()]
    .filter(items=>items.length===4).map(items=>({parent,items})));
}

function enhanceFeedbackFourOptions(root){
  feedbackFourOptionGroups(root).forEach(({parent,items})=>{
    parent.classList.add('s6-four-option-group');
    items.forEach(({input,label},index)=>{
      if(label.classList.contains('s6-option-card'))return;
      label.classList.add('s6-option-card',`s6-option-tone-${index}`);
      let symbol=label.querySelector('.az-review-icon,.cn-verify-icon');
      if(symbol)symbol.classList.add('s6-option-symbol');
      else{
        symbol=document.createElement('span');
        symbol.className='s6-option-symbol';
        symbol.setAttribute('aria-hidden','true');
        symbol.innerHTML=icon(['book','book','chart','check'][index]);
        input.after(symbol);
      }
      const copy=document.createElement('span');
      copy.className='s6-option-copy';
      // Move only the existing copy; keep the original input and its listeners.
      [...label.childNodes].filter(node=>node!==input&&node!==symbol)
        .forEach(node=>copy.appendChild(node));
      label.appendChild(copy);
    });
  });
}
