'use strict';

function activityNumberPrefix(text){
 return text.match(/^\s*(\d+\.\d+)(?=\s|$)/);
}

// Wrap existing labels for presentation only; never calculate or replace numbers.
function activityNumberBadges(html){
 const template=document.createElement('template');template.innerHTML=html;
 const selectors='.az-guided h3,.az-guided h4,.az-guided legend,.az-identify dt,.az-written-question>label,.cn-selects>label,.cg-proof dt';
 for(const el of template.content.querySelectorAll(selectors)){
  if(el.closest('.cn-learning-list,details,.activity-number-badge'))continue;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   if(node.parentElement.closest('svg,textarea,select'))continue;
   if(!node.nodeValue.trim())continue;
   if(node.parentElement.closest('.az-result-title>span,.activity-number-badge'))break;
   const match=activityNumberPrefix(node.nodeValue);
   if(match){
    const token=node.splitText(match[0].length-match[1].length);
    token.splitText(match[1].length);
    const badge=document.createElement('span');badge.className='activity-number-badge';badge.textContent=match[1];
    token.parentNode.replaceChild(badge,token);
   }
   break;
  }
 }
 return template.innerHTML;
}
