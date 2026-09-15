import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{p as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),o=[{value:0,label:`Min`},{value:250,label:`$250`},{value:500,label:`Max`}],s={title:`Slider/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`change-end`]}},argTypes:{showValue:{control:`select`,options:[`always`,`hover`,`never`]},range:{control:`boolean`},disabled:{control:`boolean`},snapToMarks:{control:`boolean`},required:{control:`boolean`}},args:{label:`Volume`,name:`volume`,min:0,max:100,step:1,snapToMarks:!1,required:!1,value:void 0,defaultValue:void 0,range:!1,showValue:`always`,marks:void 0,disabled:!1,description:void 0,error:void 0},render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-slider
        label=${e.label}
        name=${e.name}
        min=${e.min}
        max=${e.max}
        step=${e.step}
        ?snapToMarks=${e.snapToMarks}
        ?required=${e.required}
        .value=${e.value}
        .defaultValue=${e.defaultValue}
        ?range=${e.range}
        show-value=${e.showValue}
        .marks=${e.marks??[]}
        ?disabled=${e.disabled}
        description=${r(e.description)}
        error=${r(e.error)}
      ></ds-slider>
    </div>
  `},c={},l={args:{showValue:`always`,defaultValue:40}},u={args:{showValue:`hover`,defaultValue:40}},d={args:{showValue:`never`,defaultValue:40}},f={args:{label:`Price range`,name:`price`,min:0,max:500,step:10,defaultValue:[100,350],range:!0}},p={args:{label:`Price range`,name:`price`,min:0,max:500,step:10,defaultValue:[100,350],range:!0,marks:o}},m={args:{description:`Drag or use arrow keys to adjust.`,defaultValue:30}},h={args:{disabled:!0,defaultValue:60}},g={args:{required:!0}},_={name:`SnapToMarks`,args:{label:`Price range`,name:`price`,min:0,max:500,step:10,defaultValue:[100,350],range:!0,marks:o,snapToMarks:!0}},v={args:{error:`Fix this before continuing.`,defaultValue:10}},y={args:{label:`Price range`,name:`price`,min:0,max:500,step:10,defaultValue:[100,350],range:!0,marks:o}},b=[`Default`,`ShowValueAlways`,`ShowValueHover`,`ShowValueNever`,`Range`,`Marks`,`WithDescription`,`Disabled`,`Required`,`SnapToMarksStory`,`ErrorState`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'always',
    defaultValue: 40
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'hover',
    defaultValue: 40
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'never',
    defaultValue: 40
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Drag or use arrow keys to adjust.',
    defaultValue: 30
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 60
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'SnapToMarks',
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS,
    snapToMarks: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.',
    defaultValue: 10
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS
  }
}`,...y.parameters?.docs?.source},description:{story:`Renders a range slider (its maximum of two thumbs, each its own tab stop)\r
with marks, so the keyboard gate can verify arrows, Page Up/Down, Home/End\r
and Tab moving between thumbs.`,...y.parameters?.docs?.description}}}})))()}x();export{c as Default,h as Disabled,v as ErrorState,y as Keyboard,p as Marks,f as Range,g as Required,l as ShowValueAlways,u as ShowValueHover,d as ShowValueNever,_ as SnapToMarksStory,m as WithDescription,b as __namedExportsOrder,s as default};