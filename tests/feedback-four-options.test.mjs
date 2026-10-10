import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

function fixture(sizes){
  const classes=()=>{const set=new Set();return {add:(...names)=>names.forEach(n=>set.add(n)),contains:n=>set.has(n)};};
  const parent={classList:classes()},labels=[],inputs=[];
  for(const [name,count] of sizes)for(let i=0;i<count;i++){
    const label={parentElement:parent,classList:classes(),childNodes:[],querySelector:()=>null};
    const input={type:name==='checks'?'checkbox':'radio',name,value:String(i),checked:i===1,disabled:i===2,listeners:{change:()=>i},closest:()=>label};
    input.after=node=>label.childNodes.splice(label.childNodes.indexOf(input)+1,0,node);
    label.childNodes=[input,{text:`Original option ${name} ${i}`}];
    label.querySelectorAll=()=>[input];
    label.appendChild=node=>{const old=label.childNodes.indexOf(node);if(old>=0)label.childNodes.splice(old,1);label.childNodes.push(node);};
    labels.push(label);inputs.push(input);
  }
  const document={createElement:()=>({children:[],setAttribute(){},appendChild(node){
    for(const label of labels){const i=label.childNodes.indexOf(node);if(i>=0)label.childNodes.splice(i,1);}
    this.children.push(node);
  }})};
  const scope=vm.createContext({document,icon:name=>`<svg data-icon="${name}"></svg>`});
  vm.runInContext(fs.readFileSync('static/feedback-four-options.js','utf8'),scope);
  return {scope,labels,inputs,root:{querySelectorAll:()=>inputs}};
}

test('Only groups of exactly four receive the reference presentation',()=>{
  for(const count of [2,3,4,5,6]){
    const {scope,root,labels}=fixture([['choices',count]]);
    scope.enhanceFeedbackFourOptions(root);
    assert.equal(labels.filter(l=>l.classList.contains('s6-option-card')).length,count===4?4:0);
  }
  const {scope,root,labels}=fixture([['four',4],['three',3],['checks',4]]);
  assert.equal(scope.feedbackFourOptionGroups(root).length,2);
  scope.enhanceFeedbackFourOptions(root);
  assert.equal(labels.filter(l=>l.classList.contains('s6-option-card')).length,8);
});

test('Decoration preserves original inputs, listeners, values, disabled states and copy',()=>{
  const {scope,root,labels,inputs}=fixture([['choices',4]]);
  const before=inputs.map(input=>({...input,listeners:input.listeners}));
  scope.enhanceFeedbackFourOptions(root);
  labels.forEach((label,i)=>{
    assert.equal(label.childNodes[0],inputs[i]);
    for(const key of ['value','checked','disabled','listeners'])assert.equal(inputs[i][key],before[i][key]);
    assert.equal(label.childNodes.at(-1).children[0].text,`Original option choices ${i}`);
    assert.ok(label.classList.contains(`s6-option-tone-${i}`));
  });
  const lengths=labels.map(label=>label.childNodes.length);
  scope.enhanceFeedbackFourOptions(root);
  assert.deepEqual(labels.map(label=>label.childNodes.length),lengths);
});
