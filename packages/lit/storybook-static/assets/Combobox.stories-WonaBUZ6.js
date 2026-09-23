import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{m as a}from"./iframe-Dy0IL05G.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),r(),a(),o={title:`Combobox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`input-change`,`open-change`]}},argTypes:{filter:{control:`select`,options:[`startsWith`,`contains`,`none`,`async`]},open:{control:`boolean`}},args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}],multiple:!1,allowCustom:!1,filter:`contains`,required:!1,disabled:!1,invalid:!1,loading:!1,clearable:!0},render:e=>i`
    <ds-combobox
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .open=${e.open}
      .inputValue=${e.inputValue}
      ?multiple=${e.multiple}
      ?allow-custom=${e.allowCustom}
      filter=${e.filter}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${n(e.error)}
      ?loading=${e.loading}
      .clearable=${e.clearable}
    ></ds-combobox>
  `},s={},c={args:{filter:`startsWith`}},l={args:{filter:`contains`}},u={args:{filter:`none`}},d={args:{filter:`async`}},f={args:{open:!0}},p={args:{multiple:!0,defaultValue:[`apple`,`banana`]}},m={args:{allowCustom:!0,multiple:!0}},h={args:{filter:`async`,loading:!0,open:!0}},g={args:{clearable:!1,defaultValue:`apple`}},_={args:{description:`Used for the produce order.`,placeholder:`Search fruit`}},v={args:{required:!0}},y={args:{disabled:!0,defaultValue:`banana`}},b={args:{invalid:!0}},x={args:{error:`Choose a fruit from the list.`}},S={args:{open:!0,defaultValue:`apple`},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-combobox`);await t?.updateComplete,t?.shadowRoot?.querySelector(`[data-part=input]`)?.focus()},render:e=>i`
    <ds-combobox
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .open=${e.open}
      .inputValue=${e.inputValue}
      ?multiple=${e.multiple}
      ?allow-custom=${e.allowCustom}
      filter=${e.filter}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${n(e.error)}
      ?loading=${e.loading}
      .clearable=${e.clearable}
      @open-change=${e=>{e.currentTarget.open=e.detail.open}}
    ></ds-combobox>
  `},C={args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}]}},w={args:{label:`Roles`,name:`roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},T={args:{label:`Tags`,name:`tags`,multiple:!0,allowCustom:!0,options:[{value:`urgent`,label:`Urgent`},{value:`billing`,label:`Billing`}]}},E={args:{label:`Customer`,name:`customer`,filter:`async`,loading:!0,options:[{value:`acme`,label:`Acme Ltd`}]}},D=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`Open`,`Multiple`,`AllowCustom`,`Loading`,`NotClearable`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`Keyboard`,`FruitPicker`,`MultiSelectWithChips`,`FreeTextTags`,`AsyncResults`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    defaultValue: ['apple', 'banana']
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    allowCustom: true,
    multiple: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    loading: true,
    open: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    clearable: false,
    defaultValue: 'apple'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for the produce order.',
    placeholder: 'Search fruit'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'banana'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose a fruit from the list.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: 'apple'
  },
  play: async ({
    canvasElement
  }) => {
    const combobox = canvasElement.querySelector('ds-combobox');
    await combobox?.updateComplete;
    combobox?.shadowRoot?.querySelector<HTMLElement>('[data-part=input]')?.focus();
  },
  render: args => html\`
    <ds-combobox
      label=\${args.label}
      name=\${args.name}
      .options=\${args.options}
      .value=\${args.value}
      .defaultValue=\${args.defaultValue}
      .open=\${args.open}
      .inputValue=\${args.inputValue}
      ?multiple=\${args.multiple}
      ?allow-custom=\${args.allowCustom}
      filter=\${args.filter}
      placeholder=\${ifDefined(args.placeholder)}
      description=\${ifDefined(args.description)}
      ?required=\${args.required}
      ?disabled=\${args.disabled}
      ?invalid=\${args.invalid}
      error=\${ifDefined(args.error)}
      ?loading=\${args.loading}
      .clearable=\${args.clearable}
      @open-change=\${(event: CustomEvent<ComboboxOpenChangeDetail>) => {
    (event.currentTarget as DsCombobox).open = event.detail.open;
  }}
    ></ds-combobox>
  \`
}`,...S.parameters?.docs?.source},description:{story:"Open with its input, for the keyboard gate: the options are reached through the Listbox while DOM\r\nfocus stays in the input, and the clear and toggle buttons are the other focus stops.\r\n`defaultValue` is set so the clear button renders. The story owns `open` — it writes `open-change`\r\nback onto the element — so Escape and Tab really close the popup.",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: [{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'apricot',
      label: 'Apricot'
    }, {
      value: 'banana',
      label: 'Banana'
    }]
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [{
      value: 'frontend',
      label: 'Frontend'
    }, {
      value: 'backend',
      label: 'Backend'
    }, {
      value: 'design',
      label: 'Design'
    }]
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    options: [{
      value: 'urgent',
      label: 'Urgent'
    }, {
      value: 'billing',
      label: 'Billing'
    }]
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Customer',
    name: 'customer',
    filter: 'async',
    loading: true,
    options: [{
      value: 'acme',
      label: 'Acme Ltd'
    }]
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{m as AllowCustom,E as AsyncResults,s as Default,y as Disabled,d as FilterAsync,l as FilterContains,u as FilterNone,c as FilterStartsWith,T as FreeTextTags,C as FruitPicker,b as Invalid,S as Keyboard,h as Loading,w as MultiSelectWithChips,p as Multiple,g as NotClearable,f as Open,v as Required,_ as WithDescription,x as WithError,D as __namedExportsOrder,o as default};