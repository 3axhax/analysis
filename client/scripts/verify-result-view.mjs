// Synthetic render check only: no patient data, browser state or saved result IDs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const load=(path,modules={})=>{
  const source=readFileSync(new URL(path,import.meta.url),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const module={exports:{}};
  new Function('require','module','exports',js)(name=>name in modules?modules[name]:require(name),module,module.exports);
  return module.exports;
};
const {unitLabel}=load('../src/entities/units/lib/unit-label.ts');
const rows=[
  {id:1,point:{name:'synthetic-normal',translationRu:'Синтетический показатель'},value:33,pointUnit:{id:16,name:'g/dl'},sourceUnitText:'г/дл',minValue:30,maxValue:38,pointDataStatus:'-1',calculation:{value:'330',unitId:2,unit:'g/l'}},
  {id:2,point:{name:'synthetic-no-reference',translationRu:'Показатель без норматива'},value:1,pointUnit:{id:7,name:'10^9/l'},sourceUnitText:'х10^3/мкл',minValue:null,maxValue:null,pointDataStatus:null,interpretationWarning:'no_convertible_reference_range'},
];
const {AnalysisPointDataList}=load('../src/widgets/analysisPointdataList/ui/AnalysisPointDataList.tsx',{
  '@shared/store/hooks.ts':{useAppSelector:selector=>selector({})},
  'react-i18next':{useTranslation:()=>({t:key=>key})},
  '@entities/analysisResult':{SelectAnalysisResultPointData:()=>rows},
  '@entities/units':{unitLabel},
  '@shared/ui':{Table:'table-fixture'},
  '@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx':{AnalysisPointDataListStatus:'status-fixture'},
  '@entities/analysisResult/model/types.ts':{StatusValue:{NORMAL:'-1',LOW:'0',HIGH:'1'}},
  '@heroicons/react/24/outline':{InformationCircleIcon:'icon-fixture'},
  'react-tooltip':{Tooltip:'tooltip-fixture'},
});
const find=(node,predicate)=>{
  if(!node||typeof node!=='object')return undefined;
  if(predicate(node))return node;
  for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}
};
const tree=AnalysisPointDataList({resultId:'synthetic'});
const table=find(tree,node=>node.type==='table-fixture');
assert.equal(table.props.tableData.rows.length,2);
const rendered=table.props.tableData.rows;
assert.equal(rendered[1].find(cell=>cell.name==='interval').data,'Нет подходящего норматива');
const missingValue=rendered[1].find(cell=>cell.name==='value').data;
assert.ok(missingValue.props.children.includes('1 х10^3/мкл'));
assert.equal(find(missingValue,node=>node.type==='status-fixture').props.status,null);
assert.equal(find(missingValue,node=>node.props?.['aria-label']==='Значение в расчётных единицах'),undefined);
assert.equal(rendered[0].find(cell=>cell.name==='interval').data,'30 - 38 г/дл');
assert.equal(find(rendered[0].find(cell=>cell.name==='value').data,node=>node.props?.['aria-label']==='Значение в расчётных единицах').props.title,'Для расчёта: 330 г/л');
console.log(JSON.stringify({allRowsRendered:true,missingReferenceExplicit:true,sourceUnitAndValueVisible:true,noFalseStatus:true,convertedReferenceConsistent:true}));
