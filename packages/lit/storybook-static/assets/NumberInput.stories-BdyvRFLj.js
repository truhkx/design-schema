import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./NumberInput-DTUzwpdX.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{t(),r(),a(),o={title:`NumberInput/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{format:{control:`select`,options:[`decimal`,`currency`,`percent`,`unit`]},size:{control:`inline-radio`,options:[`sm`,`md`]},hideSteppers:{control:`boolean`},hideLabel:{control:`boolean`},required:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Quantity`,name:`quantity`,step:1,format:`decimal`,hideSteppers:!1,required:!1,hideLabel:!1,size:`md`,disabled:!1,invalid:!1},render:e=>i`
    <ds-number-input
      label=${e.label}
      name=${e.name}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .min=${e.min}
      .max=${e.max}
      .step=${e.step}
      .precision=${e.precision}
      format=${e.format}
      currency=${n(e.currency)}
      unit=${n(e.unit)}
      leading-text=${n(e.leadingText)}
      trailing-text=${n(e.trailingText)}
      ?hide-steppers=${e.hideSteppers}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      ?required=${e.required}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${n(e.error)}
    ></ds-number-input>
  `},s={},c={args:{format:`decimal`,defaultValue:1234.5,step:.1}},l={args:{format:`currency`,currency:`USD`,step:.01,defaultValue:19.99}},u={args:{format:`percent`,min:0,max:100,step:5,defaultValue:10}},d={args:{format:`unit`,unit:`kilogram`,step:.5,defaultValue:2.5}},f={args:{size:`sm`,defaultValue:3}},p={args:{size:`md`,defaultValue:3}},m={args:{description:`How many to order.`,defaultValue:3}},h={args:{label:`Budget`,name:`budget`,leadingText:`$`,defaultValue:50}},g={args:{hideSteppers:!0,defaultValue:5}},_={args:{required:!0}},v={args:{disabled:!0,defaultValue:5}},y={args:{invalid:!0,defaultValue:5}},b={args:{error:`Fix this before continuing.`,defaultValue:5}},x={args:{label:`Quantity`,name:`quantity`,min:1,max:99,defaultValue:1}},S={args:{label:`Price`,name:`price`,format:`currency`,currency:`USD`,step:.01,defaultValue:19.99}},C={args:{label:`Discount`,name:`discount`,format:`percent`,min:0,max:100,step:5,defaultValue:10}},w={args:{label:`Weight`,name:`weight`,size:`sm`,hideLabel:!0,hideSteppers:!0,trailingText:`kg`,defaultValue:2}},T={args:{min:0,max:20,defaultValue:5}},E=[`Default`,`FormatDecimal`,`FormatCurrency`,`FormatPercent`,`FormatUnit`,`SizeSm`,`SizeMd`,`WithDescription`,`WithLeadingText`,`HideSteppers`,`Required`,`Disabled`,`Invalid`,`WithError`,`Quantity`,`PriceInCurrency`,`Percentage`,`CompactCellEditor`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'decimal',
    defaultValue: 1234.5,
    step: 0.1
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'currency',
    currency: 'USD',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'percent',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 10
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'unit',
    unit: 'kilogram',
    step: 0.5,
    defaultValue: 2.5
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    defaultValue: 3
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    defaultValue: 3
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'How many to order.',
    defaultValue: 3
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Budget',
    name: 'budget',
    leadingText: '$',
    defaultValue: 50
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    hideSteppers: true,
    defaultValue: 5
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 5
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    defaultValue: 5
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.',
    defaultValue: 5
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    name: 'quantity',
    min: 1,
    max: 99,
    defaultValue: 1
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price',
    name: 'price',
    format: 'currency',
    currency: 'USD',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Discount',
    name: 'discount',
    format: 'percent',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 10
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight',
    name: 'weight',
    size: 'sm',
    hideLabel: true,
    hideSteppers: true,
    trailingText: 'kg',
    defaultValue: 2
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 20,
    defaultValue: 5
  }
}`,...T.parameters?.docs?.source},description:{story:`The keyboard model on the single tab stop: ArrowUp/Down, PageUp/Down,\r
Home/End (bounds are set) and Enter.`,...T.parameters?.docs?.description}}}})))()}D();export{w as CompactCellEditor,s as Default,v as Disabled,l as FormatCurrency,c as FormatDecimal,u as FormatPercent,d as FormatUnit,g as HideSteppers,y as Invalid,T as Keyboard,C as Percentage,S as PriceInCurrency,x as Quantity,_ as Required,p as SizeMd,f as SizeSm,m as WithDescription,b as WithError,h as WithLeadingText,E as __namedExportsOrder,o as default};