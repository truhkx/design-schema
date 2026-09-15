import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./NumberInput-n8D5p1UZ.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),o={title:`NumberInput/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{format:{control:`select`,options:[`decimal`,`currency`,`percent`,`unit`]},showSteppers:{control:`boolean`},required:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Quantity`,name:`qty`,min:1,max:99,step:1,precision:void 0,format:`decimal`,currency:void 0,unit:void 0,prefix:void 0,suffix:void 0,showSteppers:!0,placeholder:void 0,description:void 0,value:void 0,defaultValue:void 0,required:!1,disabled:!1,invalid:!1,error:void 0},render:e=>n`
    <div style="inline-size: min(100%, 20rem)">
      <ds-number-input
        label=${e.label}
        name=${e.name}
        min=${r(e.min)}
        max=${r(e.max)}
        step=${e.step}
        precision=${r(e.precision)}
        format=${e.format}
        currency=${r(e.currency)}
        unit=${r(e.unit)}
        .prefix=${e.prefix??null}
        suffix=${r(e.suffix)}
        .showSteppers=${e.showSteppers}
        placeholder=${r(e.placeholder)}
        description=${r(e.description)}
        .value=${e.value}
        .defaultValue=${e.defaultValue}
        ?required=${e.required}
        ?disabled=${e.disabled}
        ?invalid=${e.invalid}
        error=${r(e.error)}
      ></ds-number-input>
    </div>
  `},s={},c={args:{format:`decimal`,defaultValue:1234.5,min:void 0,max:void 0}},l={args:{label:`Price`,name:`price`,format:`currency`,currency:`USD`,defaultValue:19.99,min:0,max:void 0,precision:2}},u={args:{label:`Discount`,name:`discount`,format:`percent`,defaultValue:15,min:0,max:100}},d={args:{label:`Weight`,name:`weight`,format:`unit`,unit:`kilogram`,defaultValue:2.5,min:0,max:void 0,precision:1}},f={args:{label:`Budget`,name:`budget`,prefix:`$`,suffix:`/mo`,defaultValue:50,min:0,max:void 0}},p={args:{showSteppers:!1,defaultValue:5}},m={args:{description:`How many to order.`,defaultValue:3}},h={args:{required:!0}},g={args:{disabled:!0,defaultValue:5}},_={args:{invalid:!0,defaultValue:5}},v={args:{error:`Fix this before continuing.`,defaultValue:5}},y={args:{defaultValue:5}},b=[`Default`,`FormatDecimal`,`FormatCurrency`,`FormatPercent`,`FormatUnit`,`WithPrefixAndSuffix`,`HiddenSteppers`,`WithDescription`,`RequiredField`,`Disabled`,`Invalid`,`ErrorState`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    format: 'decimal',
    defaultValue: 1234.5,
    min: undefined,
    max: undefined
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price',
    name: 'price',
    format: 'currency',
    currency: 'USD',
    defaultValue: 19.99,
    min: 0,
    max: undefined,
    precision: 2
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Discount',
    name: 'discount',
    format: 'percent',
    defaultValue: 15,
    min: 0,
    max: 100
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Weight',
    name: 'weight',
    format: 'unit',
    unit: 'kilogram',
    defaultValue: 2.5,
    min: 0,
    max: undefined,
    precision: 1
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Budget',
    name: 'budget',
    prefix: '$',
    suffix: '/mo',
    defaultValue: 50,
    min: 0,
    max: undefined
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    showSteppers: false,
    defaultValue: 5
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'How many to order.',
    defaultValue: 3
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 5
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    defaultValue: 5
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.',
    defaultValue: 5
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 5
  }
}`,...y.parameters?.docs?.source},description:{story:`Renders the field with its steppers, so the keyboard gate can verify arrow\r
keys, Page Up/Down, Home/End and Enter on the single tab stop.`,...y.parameters?.docs?.description}}}})))()}x();export{s as Default,g as Disabled,v as ErrorState,l as FormatCurrency,c as FormatDecimal,u as FormatPercent,d as FormatUnit,p as HiddenSteppers,_ as Invalid,y as Keyboard,h as RequiredField,m as WithDescription,f as WithPrefixAndSuffix,b as __namedExportsOrder,o as default};