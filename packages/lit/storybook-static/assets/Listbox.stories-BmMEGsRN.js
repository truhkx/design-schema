import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Listbox-a8TGJQEp.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{t(),i(),a(),o=[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`},{value:`date`,label:`Date`},{value:`elderberry`,label:`Elderberry`}],s=[{value:`starter`,label:`Starter`,description:`For individuals trying things out`},{value:`team`,label:`Team`,description:`For small teams shipping together`},{value:`enterprise`,label:`Enterprise`,description:`For organizations with custom needs`,icon:`info`}],c=[{group:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}]},{group:`Vegetables`,options:[{value:`carrot`,label:`Carrot`},{value:`daikon`,label:`Daikon`}]}],l=[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`,disabled:!0},{value:`cherry`,label:`Cherry`}],u=Array.from({length:20},(e,t)=>({value:`option-${t+1}`,label:`Option ${t+1}`})),d={title:`Listbox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`active-change`]}},argTypes:{maxVisible:{control:`select`,options:[`5`,`8`,`12`,`all`]},multiple:{control:`boolean`},selectionFollowsFocus:{control:`boolean`},required:{control:`boolean`},invalid:{control:`boolean`},embedded:{control:`boolean`},disabled:{control:`boolean`},loading:{control:`boolean`}},args:{label:`Assignees`,options:o,multiple:!1,value:void 0,defaultValue:void 0,selectionFollowsFocus:!0,required:!1,invalid:!1,error:void 0,embedded:!1,disabled:!1,name:`fruit`,emptyMessage:void 0,maxVisible:`8`,defaultActiveValue:void 0,loading:!1},render:e=>n`
    <ds-listbox
      label=${e.label}
      .options=${e.options}
      ?multiple=${e.multiple}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      ?no-selection-follows-focus=${!e.selectionFollowsFocus}
      ?required=${e.required}
      ?invalid=${e.invalid}
      .error=${e.error}
      ?embedded=${e.embedded}
      ?disabled=${e.disabled}
      name=${e.name}
      empty-message=${r(e.emptyMessage)}
      max-visible=${e.maxVisible}
      default-active-value=${r(e.defaultActiveValue)}
      ?loading=${e.loading}
    ></ds-listbox>
  `},f={},p={args:{options:u,maxVisible:`5`}},m={args:{options:u,maxVisible:`8`}},h={args:{options:u,maxVisible:`12`}},g={args:{options:o,maxVisible:`all`}},_={args:{multiple:!0,options:s,label:`Add-ons`,defaultValue:[`team`]}},v={args:{selectionFollowsFocus:!1,defaultValue:`apple`}},y={args:{required:!0}},b={args:{invalid:!0}},x={args:{error:`Fix this before continuing.`}},S={args:{embedded:!0}},C={args:{disabled:!0,defaultValue:`apple`}},w={args:{options:l}},T={args:{loading:!0,options:[]}},E={args:{defaultActiveValue:`cherry`}},D={args:{label:`Plan`,options:s,defaultValue:`team`}},O={args:{label:`Produce`,options:c,defaultValue:`banana`}},k={args:{options:[],emptyMessage:`No matching people`}},A={args:{options:o}},j=[`Default`,`MaxVisible5`,`MaxVisible8`,`MaxVisible12`,`MaxVisibleAll`,`MultipleTrue`,`SelectionFollowsFocusFalse`,`RequiredTrue`,`InvalidTrue`,`ErrorMessage`,`EmbeddedTrue`,`DisabledTrue`,`DisabledOption`,`LoadingTrue`,`DefaultActiveValueSet`,`WithDescriptionsAndIcons`,`Grouped`,`EmptyState`,`Keyboard`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '5'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '8'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '12'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS,
    maxVisible: 'all'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    options: PLAN_OPTIONS,
    label: 'Add-ons',
    defaultValue: ['team']
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    selectionFollowsFocus: false,
    defaultValue: 'apple'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    embedded: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'apple'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    options: DISABLED_OPTION_LIST
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    options: []
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    defaultActiveValue: 'cherry'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Plan',
    options: PLAN_OPTIONS,
    defaultValue: 'team'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Produce',
    options: GROUPED_OPTIONS,
    defaultValue: 'banana'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    options: [],
    emptyMessage: 'No matching people'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    options: FRUIT_OPTIONS
  }
}`,...A.parameters?.docs?.source},description:{story:`Renders with at least three options so the keyboard gate can verify arrow\r
navigation, Home/End, PageUp/PageDown, Space/Enter and typeahead. Listbox\r
has no trigger and is a single tab stop — options move via\r
\`aria-activedescendant\`, not independent DOM focus.`,...A.parameters?.docs?.description}}}})))()}M();export{f as Default,E as DefaultActiveValueSet,w as DisabledOption,C as DisabledTrue,S as EmbeddedTrue,k as EmptyState,x as ErrorMessage,O as Grouped,b as InvalidTrue,A as Keyboard,T as LoadingTrue,h as MaxVisible12,p as MaxVisible5,m as MaxVisible8,g as MaxVisibleAll,_ as MultipleTrue,y as RequiredTrue,v as SelectionFollowsFocusFalse,D as WithDescriptionsAndIcons,j as __namedExportsOrder,d as default};