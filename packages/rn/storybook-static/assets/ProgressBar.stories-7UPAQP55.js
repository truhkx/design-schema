import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./decorators-Dl4455ZU.js";import{n as r,t as i}from"./ProgressBar-CSxdk7B0.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{r(),n(),a={title:`ProgressBar/React Native`,component:i,decorators:[t()],args:{label:`Uploading photos`,value:42,min:0,max:100,showValue:!0,hideLabel:!1,tone:`neutral`,announce:`complete`}},o={},s={args:{tone:`neutral`}},c={args:{tone:`success`,value:100,label:`Photos uploaded`}},l={args:{tone:`danger`,value:58,label:`Upload failed`}},u={args:{announce:`none`}},d={args:{announce:`milestones`}},f={args:{announce:`complete`}},p={args:{value:void 0}},m={args:{hideLabel:!0}},h={args:{showValue:!1}},g={args:{label:`Uploading photos`,value:42}},_={args:{label:`Importing contacts`,value:10,announce:`milestones`}},v={args:{label:`Export`,value:100,tone:`success`}},y={args:{label:`Rendering preview`,value:60,hideLabel:!0,showValue:!1}},b={args:{label:`Importing contacts`,value:3,min:0,max:12,formatValue:(e,t,n)=>`${e} of ${n} files`}},x=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneDanger`,`AnnounceNone`,`AnnounceMilestones`,`AnnounceComplete`,`Indeterminate`,`HideLabel`,`HideValue`,`Upload`,`LongImport`,`Finished`,`InACard`,`FormatValue`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    value: 100,
    label: 'Photos uploaded'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    value: 58,
    label: 'Upload failed'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'none'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'milestones'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'complete'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: undefined
  }
}`,...p.parameters?.docs?.source},description:{story:"No `value` — the end is unknown yet. Sweeps continuously and reports `aria-busy` via `accessibilityState`.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Uploading photos',
    value: 42
  }
}`,...g.parameters?.docs?.source},description:{story:`A determinate bar with the value text beside the label.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Importing contacts',
    value: 10,
    announce: 'milestones'
  }
}`,..._.parameters?.docs?.source},description:{story:`A long task that announces every 25%, for a user who may leave and come back.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Export',
    value: 100,
    tone: 'success'
  }
}`,...v.parameters?.docs?.source},description:{story:`A completed bar recolored to success, with the text that says so beside it.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Rendering preview',
    value: 60,
    hideLabel: true,
    showValue: false
  }
}`,...y.parameters?.docs?.source},description:{story:`A bar whose Card heading already says what is happening, so the label is hidden and the value left off.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Importing contacts',
    value: 3,
    min: 0,
    max: 12,
    formatValue: (value: number, _min: number, max: number) => \`\${value} of \${max} files\`
  }
}`,...b.parameters?.docs?.source},description:{story:"`formatValue` renders units other than a percentage.",...b.parameters?.docs?.description}}}})))()}S();export{f as AnnounceComplete,d as AnnounceMilestones,u as AnnounceNone,o as Default,v as Finished,b as FormatValue,m as HideLabel,h as HideValue,y as InACard,p as Indeterminate,_ as LongImport,l as ToneDanger,s as ToneNeutral,c as ToneSuccess,g as Upload,x as __namedExportsOrder,a as default};