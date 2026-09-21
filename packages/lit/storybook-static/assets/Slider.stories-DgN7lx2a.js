import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{p as a}from"./iframe-CV6aZYyO.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),a(),o={title:`Slider/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`change-end`]}},argTypes:{showValue:{control:`select`,options:[`always`,`hover`,`never`]},range:{control:`boolean`},disabled:{control:`boolean`},snapToMarks:{control:`boolean`},required:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Volume`,name:`volume`,min:0,max:100,step:1,snapToMarks:!1,required:!1,invalid:!1,value:void 0,defaultValue:void 0,range:!1,showValue:`always`,marks:void 0,disabled:!1,description:void 0,error:void 0},render:e=>i`
    <div style="inline-size: min(100%, 24rem)">
      <ds-slider
        label=${e.label}
        name=${e.name}
        min=${e.min}
        max=${e.max}
        step=${e.step}
        ?snap-to-marks=${e.snapToMarks}
        ?required=${e.required}
        ?invalid=${e.invalid}
        .value=${e.value}
        .defaultValue=${e.defaultValue}
        ?range=${e.range}
        show-value=${e.showValue}
        .marks=${e.marks}
        ?disabled=${e.disabled}
        description=${n(e.description)}
        error=${n(e.error)}
      ></ds-slider>
    </div>
  `},s={},c={args:{showValue:`always`}},l={args:{showValue:`hover`}},u={args:{showValue:`never`}},d={args:{label:`Volume`,name:`volume`,defaultValue:30}},f={args:{label:`Price range`,name:`price`,range:!0,defaultValue:[20,80]}},p={args:{label:`Effort`,name:`effort`,min:1,max:5,marks:[{value:1,label:`Low`},{value:3,label:`Medium`},{value:5,label:`High`}],snapToMarks:!0}},m={args:{label:`Zoom`,name:`zoom`,min:50,max:200,step:10,defaultValue:100,showValue:`never`}},h={args:{description:`Applies to all devices.`,defaultValue:30}},g={args:{disabled:!0,defaultValue:50}},_={args:{required:!0}},v={args:{invalid:!0}},y={args:{error:`Fix this before continuing.`,defaultValue:10}},b={args:{defaultValue:50,marks:[{value:0,label:`Min`},{value:25},{value:50,label:`Half`},{value:75},{value:100,label:`Max`}]}},x={args:{label:`Price range`,name:`price`,range:!0,defaultValue:[20,80]}},S=[`Default`,`ShowValueAlways`,`ShowValueHover`,`ShowValueNever`,`Volume`,`PriceRange`,`EffortWithMarks`,`PairedWithANumberInput`,`WithDescription`,`Disabled`,`Required`,`Invalid`,`ErrorState`,`WithMarks`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'always'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'hover'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'never'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Volume',
    name: 'volume',
    defaultValue: 30
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    range: true,
    defaultValue: [20, 80]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Effort',
    name: 'effort',
    min: 1,
    max: 5,
    marks: [{
      value: 1,
      label: 'Low'
    }, {
      value: 3,
      label: 'Medium'
    }, {
      value: 5,
      label: 'High'
    }],
    snapToMarks: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Zoom',
    name: 'zoom',
    min: 50,
    max: 200,
    step: 10,
    defaultValue: 100,
    showValue: 'never'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Applies to all devices.',
    defaultValue: 30
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 50
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.',
    defaultValue: 10
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 50,
    marks: [{
      value: 0,
      label: 'Min'
    }, {
      value: 25
    }, {
      value: 50,
      label: 'Half'
    }, {
      value: 75
    }, {
      value: 100,
      label: 'Max'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    range: true,
    defaultValue: [20, 80]
  }
}`,...x.parameters?.docs?.source},description:{story:`The range form: two thumbs, each its own tab stop, are the whole keyboard model.`,...x.parameters?.docs?.description}}}})))()}C();export{s as Default,g as Disabled,p as EffortWithMarks,y as ErrorState,v as Invalid,x as Keyboard,m as PairedWithANumberInput,f as PriceRange,_ as Required,c as ShowValueAlways,l as ShowValueHover,u as ShowValueNever,d as Volume,h as WithDescription,b as WithMarks,S as __namedExportsOrder,o as default};