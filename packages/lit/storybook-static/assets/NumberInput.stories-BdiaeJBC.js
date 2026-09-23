import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./NumberInput-CVgy9xl8.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{t(),r(),a(),o={title:`NumberInput/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{format:{control:`select`,options:[`decimal`,`currency`,`percent`,`unit`]},size:{control:`inline-radio`,options:[`sm`,`md`]},hideSteppers:{control:`boolean`},hideLabel:{control:`boolean`},required:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Quantity`,name:`quantity`,step:1,format:`decimal`,hideSteppers:!1,required:!1,hideLabel:!1,size:`md`,disabled:!1,invalid:!1},render:e=>i`
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
  `},s={},c={args:{format:`decimal`,defaultValue:1234.5,precision:1}},l={args:{format:`currency`,currency:`USD`,label:`Price`,name:`price`,step:.01,defaultValue:19.99}},u={args:{format:`percent`,label:`Discount`,name:`discount`,min:0,max:100,step:5,defaultValue:25}},d={args:{format:`unit`,unit:`kilogram`,label:`Weight`,name:`weight`,step:.5,defaultValue:3.5}},f={args:{size:`sm`,defaultValue:3}},p={args:{size:`md`,defaultValue:3}},m={args:{hideSteppers:!0,defaultValue:3}},h={args:{label:`Budget`,name:`budget`,leadingText:`$`,min:0,defaultValue:500}},g={args:{label:`Duration`,name:`duration`,trailingText:`min`,min:0,defaultValue:30}},_={args:{description:`Whole units only.`,defaultValue:1}},v={args:{label:`Weight (kg)`,name:`weight`,placeholder:`12.5`,step:.1}},y={args:{required:!0}},b={args:{hideLabel:!0,defaultValue:1}},x={args:{disabled:!0,defaultValue:5}},S={args:{invalid:!0,defaultValue:5}},C={args:{error:`Quantity must be between 1 and 99.`,defaultValue:120}},w={args:{defaultValue:5,min:0,max:20,step:1}},T={args:{label:`Quantity`,name:`quantity`,min:1,max:99,defaultValue:1}},E={args:{label:`Price`,name:`price`,format:`currency`,currency:`USD`,step:.01,defaultValue:19.99}},D={args:{label:`Discount`,name:`discount`,format:`percent`,min:0,max:100,step:5,defaultValue:10}},O={args:{label:`Weight`,name:`weight`,size:`sm`,hideLabel:!0,hideSteppers:!0,trailingText:`kg`,defaultValue:2}},k=[`Default`,`FormatDecimal`,`FormatCurrency`,`FormatPercent`,`FormatUnit`,`SizeSm`,`SizeMd`,`HideSteppers`,`WithLeadingText`,`WithTrailingText`,`WithDescription`,`Placeholder`,`Required`,`HideLabel`,`Disabled`,`Invalid`,`WithError`,`Keyboard`,`Quantity`,`PriceInCurrency`,`Percentage`,`CompactCellEditor`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'decimal',
    defaultValue: 1234.5,
    precision: 1
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'currency',
    currency: 'USD',
    label: 'Price',
    name: 'price',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'percent',
    label: 'Discount',
    name: 'discount',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'unit',
    unit: 'kilogram',
    label: 'Weight',
    name: 'weight',
    step: 0.5,
    defaultValue: 3.5
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
    hideSteppers: true,
    defaultValue: 3
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Budget',
    name: 'budget',
    leadingText: '$',
    min: 0,
    defaultValue: 500
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Duration',
    name: 'duration',
    trailingText: 'min',
    min: 0,
    defaultValue: 30
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Whole units only.',
    defaultValue: 1
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight (kg)',
    name: 'weight',
    placeholder: '12.5',
    step: 0.1
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true,
    defaultValue: 1
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 5
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    defaultValue: 5
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Quantity must be between 1 and 99.',
    defaultValue: 120
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 5,
    min: 0,
    max: 20,
    step: 1
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    name: 'quantity',
    min: 1,
    max: 99,
    defaultValue: 1
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price',
    name: 'price',
    format: 'currency',
    currency: 'USD',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Discount',
    name: 'discount',
    format: 'percent',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 10
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight',
    name: 'weight',
    size: 'sm',
    hideLabel: true,
    hideSteppers: true,
    trailingText: 'kg',
    defaultValue: 2
  }
}`,...O.parameters?.docs?.source}}}})))()}A();export{O as CompactCellEditor,s as Default,x as Disabled,l as FormatCurrency,c as FormatDecimal,u as FormatPercent,d as FormatUnit,b as HideLabel,m as HideSteppers,S as Invalid,w as Keyboard,D as Percentage,v as Placeholder,E as PriceInCurrency,T as Quantity,y as Required,p as SizeMd,f as SizeSm,_ as WithDescription,C as WithError,h as WithLeadingText,g as WithTrailingText,k as __namedExportsOrder,o as default};