// Synthetic component check without PDF/corpus fixtures or a browser session.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const labelSource=readFileSync(new URL('../src/entities/units/lib/unit-label.ts',import.meta.url),'utf8');
const labelJs=ts.transpileModule(labelSource,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const labelModule={exports:{}};
new Function('module','exports',labelJs)(labelModule,labelModule.exports);
const {unitLabel}=labelModule.exports;
for(const unit of ['%','g/l','g/dl','10^12/l','10^9/l','µmol/l','fl','pg','mm/hour','mkg/l','mg/dl','mmole/l','unit/l','mkUnit/l','ng/ml','mUnit/l']){
 assert.ok(!/[a-z]/i.test(unitLabel(unit)),`Latin unit label: ${unit}`);
}
assert.equal(unitLabel('g/dl','g/dL'),'г/дл');
assert.equal(unitLabel('g/l','г/дл'),'г/дл');
assert.equal(unitLabel('mkg/l','ng/ml'),'нг/мл');
assert.equal(unitLabel('10^9/l','х10^3/мкл'),'х10^3/мкл');
assert.equal(unitLabel('new-unit'),'new-unit');
const source=readFileSync(new URL('../src/features/analysisPointList/ui/AnalysisPointSelectedItem.tsx',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const hookValues=[],effectDeps=[];let hookIndex=0,effectIndex=0,effects=[],dirty=false;
const point={id:1,name:'synthetic',translationRu:'Synthetic',units:['g/l','g/dl']};
let stored={name:'synthetic',value:12.7,units:'g/dl',sourceUnitText:'г/дл'};
const hooks={
 useState(initial){const index=hookIndex++;if(!(index in hookValues))hookValues[index]=initial;return [hookValues[index],value=>{if(hookValues[index]!==value){hookValues[index]=value;dirty=true;}}];},
 useEffect(callback,deps){const index=effectIndex++;if(!effectDeps[index]||deps.some((d,i)=>d!==effectDeps[index][i])){effectDeps[index]=deps;effects.push(callback);}},
};
const dispatch=action=>{
 if(action.type==='add'){
   const previous=stored;
   stored={...action.payload,sourceUnitText:previous?.units===action.payload.units?previous.sourceUnitText:undefined};
 }else if(action.type==='remove')stored=undefined;
 dirty=true;
};
const modules={
 react:hooks,
 'react/jsx-runtime':require('react/jsx-runtime'),
 '@shared/store/hooks.ts':{useAppDispatch:()=>dispatch,useAppSelector:selector=>selector({})},
 '@entities/analysisPoint':{selectAnalysisPointById:()=>point},
 '@entities/units':{unitLabel},
 'react-i18next':{useTranslation:()=>({t:(key,options)=>options?.defaultValue??key})},
 '@heroicons/react/16/solid':{TrashIcon:()=>null},
 '@shared/ui':{SelectUI:'select-fixture'},
 '@entities/analysisResult':{
   addPointData:payload=>({type:'add',payload}),removePointData:()=>({type:'remove'}),removeSelectedPoint:()=>({type:'selection'}),
   SelectAnalysisResultPrepareDataPointDataByName:()=>stored,
 },
};
const module={exports:{}};
new Function('require','module','exports',js)(name=>{if(!(name in modules))throw Error('Unexpected component dependency');return modules[name];},module,module.exports);
const Component=module.exports.AnalysisPointSelectedItem;
const render=()=>{
 let tree;
 for(let n=0;n<20;n++){
   dirty=false;hookIndex=0;effectIndex=0;effects=[];tree=Component({pointId:1});for(const run of effects)run();if(!dirty)return tree;
 }
 throw Error('Unstable render loop');
};
const find=(tree,predicate)=>{
 if(!tree||typeof tree!=='object')return undefined;
 if(predicate(tree))return tree;
 for(const child of [tree.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}
};
let tree=render();let select=find(tree,node=>node.props?.name==='unitSelect');
assert.equal(stored.units,'g/dl');assert.equal(select.props.value,'g/dl');assert.equal(select.props.options[1].label,'г/дл');
select.props.onChange('g/l');tree=render();assert.equal(stored.value,12.7);assert.equal(stored.units,'g/l');assert.equal(stored.sourceUnitText,undefined);
point.units=['g/l'];tree=render();
assert.equal(find(tree,node=>node.props?.name==='unitSelect'),undefined);
assert.ok(find(tree,node=>node.type==='span'&&node.props.children==='г/л'));
assert.equal(stored.value,12.7);assert.equal(stored.units,'g/l');
stored={name:'synthetic',value:12.7,units:''};tree=render();
assert.equal(find(tree,node=>node.props?.name==='unitSelect'),undefined);assert.equal(stored.units,'');
const confirm=find(tree,node=>node.type==='button'&&Array.isArray(node.props.children)&&node.props.children[0]==='Выбрать ');
assert.ok(confirm);confirm.props.onClick();tree=render();assert.equal(stored.units,'g/l');assert.equal(stored.value,12.7);
stored={name:'synthetic',value:0,units:'g/l'};tree=render();assert.equal(find(tree,node=>node.type==='input').props.value,'0');assert.equal(find(tree,node=>node.props?.name==='unitSelect'),undefined);
point.units=[];tree=render();assert.equal(find(tree,node=>node.props?.name==='unitSelect'),undefined);
const input=find(tree,node=>node.type==='input');input.props.onInput({preventDefault(){},target:{value:''}});render();assert.equal(stored,undefined);
console.log(JSON.stringify({pdfUnitPreserved:true,decimalNotTruncated:true,noValueConversionOnUnitChange:true,singleUnitNoSelect:true,unknownUnitExplicitConfirmation:true,cyrillicLabels:true,zeroPreserved:true,clearNotZero:true}));
