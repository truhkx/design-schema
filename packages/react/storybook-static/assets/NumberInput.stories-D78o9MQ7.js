import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./NumberInput-BnwFD-Y2.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{t(),r={title:`NumberInput/React`,component:n,tags:[`autodocs`],args:{label:`Quantity`,name:`quantity`,step:1,format:`decimal`,size:`md`,hideSteppers:!1,required:!1,hideLabel:!1,disabled:!1,invalid:!1},argTypes:{format:{control:`inline-radio`,options:[`decimal`,`currency`,`percent`,`unit`]},size:{control:`inline-radio`,options:[`sm`,`md`]},onChange:{action:`onChange`}}},i={},a={args:{format:`decimal`,defaultValue:1234.5,precision:1}},o={args:{format:`currency`,currency:`USD`,label:`Price`,name:`price`,step:.01,defaultValue:19.99}},s={args:{format:`percent`,label:`Discount`,name:`discount`,min:0,max:100,step:5,defaultValue:25}},c={args:{format:`unit`,unit:`kilogram`,label:`Weight`,name:`weight`,step:.5,defaultValue:3.5}},l={args:{size:`sm`,defaultValue:3}},u={args:{size:`md`,defaultValue:3}},d={args:{hideSteppers:!0,defaultValue:3}},f={args:{label:`Budget`,name:`budget`,leadingText:`$`,min:0,defaultValue:500}},p={args:{label:`Duration`,name:`duration`,trailingText:`min`,min:0,defaultValue:30}},m={args:{description:`Whole units only.`,defaultValue:1}},h={args:{label:`Weight (kg)`,name:`weight`,placeholder:`12.5`,step:.1}},g={args:{required:!0}},_={args:{hideLabel:!0,defaultValue:1}},v={args:{disabled:!0,defaultValue:5}},y={args:{invalid:!0,defaultValue:5}},b={args:{error:`Quantity must be between 1 and 99.`,defaultValue:120}},x={args:{defaultValue:5,min:0,max:20,step:1}},S={args:{label:`Quantity`,name:`quantity`,min:1,max:99,defaultValue:1}},C={args:{label:`Price`,name:`price`,format:`currency`,currency:`USD`,step:.01,defaultValue:19.99}},w={args:{label:`Discount`,name:`discount`,format:`percent`,min:0,max:100,step:5,defaultValue:10}},T={args:{label:`Weight`,name:`weight`,size:`sm`,hideLabel:!0,hideSteppers:!0,trailingText:`kg`,defaultValue:2}},E=[`Default`,`FormatDecimal`,`FormatCurrency`,`FormatPercent`,`FormatUnit`,`SizeSm`,`SizeMd`,`HideSteppers`,`WithLeadingText`,`WithTrailingText`,`WithDescription`,`Placeholder`,`Required`,`HideLabel`,`Disabled`,`Invalid`,`WithError`,`Keyboard`,`Quantity`,`PriceInCurrency`,`Percentage`,`CompactCellEditor`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'decimal',
    defaultValue: 1234.5,
    precision: 1
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'currency',
    currency: 'USD',
    label: 'Price',
    name: 'price',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'percent',
    label: 'Discount',
    name: 'discount',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'unit',
    unit: 'kilogram',
    label: 'Weight',
    name: 'weight',
    step: 0.5,
    defaultValue: 3.5
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    defaultValue: 3
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    defaultValue: 3
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    hideSteppers: true,
    defaultValue: 3
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Budget',
    name: 'budget',
    leadingText: '$',
    min: 0,
    defaultValue: 500
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Duration',
    name: 'duration',
    trailingText: 'min',
    min: 0,
    defaultValue: 30
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Whole units only.',
    defaultValue: 1
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight (kg)',
    name: 'weight',
    placeholder: '12.5',
    step: 0.1
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true,
    defaultValue: 1
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
    error: 'Quantity must be between 1 and 99.',
    defaultValue: 120
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 5,
    min: 0,
    max: 20,
    step: 1
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    name: 'quantity',
    min: 1,
    max: 99,
    defaultValue: 1
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price',
    name: 'price',
    format: 'currency',
    currency: 'USD',
    step: 0.01,
    defaultValue: 19.99
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Discount',
    name: 'discount',
    format: 'percent',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 10
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight',
    name: 'weight',
    size: 'sm',
    hideLabel: true,
    hideSteppers: true,
    trailingText: 'kg',
    defaultValue: 2
  }
}`,...T.parameters?.docs?.source}}}})))()}D();export{T as CompactCellEditor,i as Default,v as Disabled,o as FormatCurrency,a as FormatDecimal,s as FormatPercent,c as FormatUnit,_ as HideLabel,d as HideSteppers,y as Invalid,x as Keyboard,w as Percentage,h as Placeholder,C as PriceInCurrency,S as Quantity,g as Required,u as SizeMd,l as SizeSm,m as WithDescription,b as WithError,f as WithLeadingText,p as WithTrailingText,E as __namedExportsOrder,r as default};