import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{m as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),i(),a(),o=[{value:`us`,label:`United States`},{value:`ca`,label:`Canada`},{value:`mx`,label:`Mexico`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`}],s=[{value:`ada`,label:`Ada Lovelace`,description:`ada@example.com`},{value:`grace`,label:`Grace Hopper`,description:`grace@example.com`},{value:`katherine`,label:`Katherine Johnson`,description:`katherine@example.com`}],c=[{group:`North America`,options:[{value:`us`,label:`United States`},{value:`ca`,label:`Canada`},{value:`mx`,label:`Mexico`}]},{group:`Europe`,options:[{value:`fr`,label:`France`},{value:`de`,label:`Germany`}]}],l={title:`Combobox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`input-change`,`open-change`]}},argTypes:{filter:{control:`select`,options:[`startsWith`,`contains`,`none`,`async`]},multiple:{control:`boolean`},allowCustom:{control:`boolean`},required:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`},loading:{control:`boolean`},clearable:{control:`boolean`}},args:{label:`Country`,name:`country`,options:o,value:void 0,defaultValue:void 0,inputValue:void 0,multiple:!1,allowCustom:!1,filter:`contains`,placeholder:void 0,description:void 0,required:!1,disabled:!1,invalid:!1,error:void 0,loading:!1,clearable:!0},render:e=>n`
    <ds-combobox
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      input-value=${r(e.inputValue)}
      ?multiple=${e.multiple}
      ?allow-custom=${e.allowCustom}
      filter=${e.filter}
      placeholder=${r(e.placeholder)}
      description=${r(e.description)}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${r(e.error)}
      ?loading=${e.loading}
      ?no-clear=${!e.clearable}
    ></ds-combobox>
  `},u={},d={args:{filter:`startsWith`}},f={args:{filter:`contains`}},p={args:{filter:`none`}},m={args:{filter:`async`,loading:!1}},h={args:{multiple:!0,options:s,label:`Assignees`,name:`assignees`,defaultValue:[`ada`]}},g={args:{allowCustom:!0,label:`Tags`,name:`tags`,options:s,multiple:!0}},_={args:{required:!0}},v={args:{disabled:!0,defaultValue:`us`}},y={args:{filter:`async`,loading:!0}},b={args:{clearable:!1,defaultValue:`us`}},x={args:{label:`Assignee`,name:`assignee`,options:s,description:`Search by name or email.`,defaultValue:`ada`}},S={args:{label:`Country`,options:c,defaultValue:`fr`}},C={args:{required:!0,error:`Fix this before continuing.`}},w={args:{options:o,defaultValue:`us`,clearable:!0},play:async({canvasElement:e})=>{((e.querySelector(`ds-combobox`)?.shadowRoot?.querySelector(`#toggle-button`))?.shadowRoot?.querySelector(`button`))?.click()}},T=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`MultipleTrue`,`AllowCustomTrue`,`RequiredTrue`,`DisabledTrue`,`LoadingTrue`,`ClearableFalse`,`WithDescription`,`Grouped`,`ErrorIdentified`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    loading: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    options: PEOPLE_OPTIONS,
    label: 'Assignees',
    name: 'assignees',
    defaultValue: ['ada']
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    allowCustom: true,
    label: 'Tags',
    name: 'tags',
    options: PEOPLE_OPTIONS,
    multiple: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'us'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    loading: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    clearable: false,
    defaultValue: 'us'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Assignee',
    name: 'assignee',
    options: PEOPLE_OPTIONS,
    description: 'Search by name or email.',
    defaultValue: 'ada'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    options: GROUPED_OPTIONS,
    defaultValue: 'fr'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Fix this before continuing.'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    options: COUNTRY_OPTIONS,
    defaultValue: 'us',
    clearable: true
  },
  play: async ({
    canvasElement
  }) => {
    const combobox = canvasElement.querySelector('ds-combobox');
    const toggle = combobox?.shadowRoot?.querySelector('#toggle-button');
    const toggleButton = toggle?.shadowRoot?.querySelector<HTMLButtonElement>('button');
    toggleButton?.click();
  }
}`,...w.parameters?.docs?.source},description:{story:`Renders open with its field and at least three focusable children (input,\r
clear button, toggle button) so the keyboard gate can verify\r
ArrowDown/ArrowUp-to-open, arrow navigation, Enter to commit, Escape,\r
Tab and Backspace-removes-chip. Real DOM focus stays on the input the\r
whole time — the popup opens via \`play\` clicking the toggle button, since\r
(unlike Menu/Popover/Dialog) this component's schema has no controlled\r
\`open\` prop to set declaratively.`,...w.parameters?.docs?.description}}}})))()}E();export{g as AllowCustomTrue,b as ClearableFalse,u as Default,v as DisabledTrue,C as ErrorIdentified,m as FilterAsync,f as FilterContains,p as FilterNone,d as FilterStartsWith,S as Grouped,w as Keyboard,y as LoadingTrue,h as MultipleTrue,_ as RequiredTrue,x as WithDescription,T as __namedExportsOrder,l as default};