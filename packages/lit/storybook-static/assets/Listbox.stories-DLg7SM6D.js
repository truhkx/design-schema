import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Listbox-Daa93wvz.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{t(),r(),a(),o=[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`}],s=[{value:`starter`,label:`Starter`,description:`For individuals trying things out`},{value:`team`,label:`Team`,description:`For small teams shipping together`},{value:`enterprise`,label:`Enterprise`,description:`For organizations with custom needs`,icon:`info`}],c=Array.from({length:20},(e,t)=>({value:`option-${t+1}`,label:`Option ${t+1}`})),l={title:`Listbox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`active-change`]}},argTypes:{maxVisible:{control:`select`,options:[`5`,`8`,`12`,`all`]}},args:{label:`Fruit`,options:o,multiple:!1,selectionFollowsFocus:!0,required:!1,invalid:!1,embedded:!1,loading:!1,disabled:!1,maxVisible:`8`},render:e=>i`
    <ds-listbox
      label=${e.label}
      labelled-by=${n(e.labelledBy)}
      .options=${e.options}
      ?multiple=${e.multiple}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .selectionFollowsFocus=${e.selectionFollowsFocus}
      ?required=${e.required}
      ?invalid=${e.invalid}
      .error=${e.error}
      ?embedded=${e.embedded}
      initial-active-value=${n(e.initialActiveValue)}
      ?loading=${e.loading}
      ?disabled=${e.disabled}
      name=${n(e.name)}
      empty-message=${n(e.emptyMessage)}
      max-visible=${e.maxVisible}
    ></ds-listbox>
  `},u={},d={args:{options:c,maxVisible:`5`}},f={args:{options:c,maxVisible:`8`}},p={args:{options:c,maxVisible:`12`}},m={args:{options:c,maxVisible:`all`}},h={args:{label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`}]}},g={args:{label:`Roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},_={args:{label:`Role`,options:[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`}]}]}},v={args:{label:`Country`,embedded:!0,maxVisible:`5`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`}]}},y={args:{selectionFollowsFocus:!1,defaultValue:`apple`}},b={args:{label:`Plan`,options:s,defaultValue:`team`}},x={args:{options:[{value:`apple`,label:`Apple`,disabled:!0},{value:`banana`,label:`Banana`}]}},S={args:{required:!0,name:`fruit`}},C={args:{invalid:!0}},w={args:{error:`Fix this before continuing.`}},T={args:{disabled:!0,defaultValue:`banana`}},E={args:{options:[]}},D={args:{options:[],emptyMessage:`No fruit matches that.`}},O={args:{options:[],loading:!0}},k={args:{initialActiveValue:`cherry`}},A={args:{options:c.slice(0,8),label:`Options`}},j=[`Default`,`MaxVisible5`,`MaxVisible8`,`MaxVisible12`,`MaxVisibleAll`,`SinglePicker`,`MultiSelectWithChecks`,`GroupedOptions`,`EmbeddedInAPopup`,`SelectionFollowsFocusFalse`,`WithDescriptionsAndIcons`,`DisabledOption`,`Required`,`Invalid`,`ErrorMessage`,`Disabled`,`Empty`,`EmptyCustomMessage`,`Loading`,`InitialActiveValue`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '5'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '8'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: '12'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS,
    maxVisible: 'all'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    options: [{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'banana',
      label: 'Banana'
    }, {
      value: 'cherry',
      label: 'Cherry'
    }]
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    options: [{
      group: 'Engineering',
      options: [{
        value: 'frontend',
        label: 'Frontend'
      }, {
        value: 'backend',
        label: 'Backend'
      }]
    }, {
      group: 'Design',
      options: [{
        value: 'product',
        label: 'Product design'
      }]
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    embedded: true,
    maxVisible: '5',
    options: [{
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'fr',
      label: 'France'
    }, {
      value: 'jp',
      label: 'Japan'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    selectionFollowsFocus: false,
    defaultValue: 'apple'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Plan',
    options: PLAN_OPTIONS,
    defaultValue: 'team'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    options: [{
      value: 'apple',
      label: 'Apple',
      disabled: true
    }, {
      value: 'banana',
      label: 'Banana'
    }]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    name: 'fruit'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'banana'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    options: []
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    options: [],
    emptyMessage: 'No fruit matches that.'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    options: [],
    loading: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    initialActiveValue: 'cherry'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    options: MANY_OPTIONS.slice(0, 8),
    label: 'Options'
  }
}`,...A.parameters?.docs?.source},description:{story:"Keyboard gate: a single tab stop with at least three options; arrows, Home/End,\r\nPageUp/PageDown, Space/Enter and typeahead move `aria-activedescendant`. The\r\n`multiple` rules read `?args=multiple:!true` from the story URL.",...A.parameters?.docs?.description}}}})))()}M();export{u as Default,T as Disabled,x as DisabledOption,v as EmbeddedInAPopup,E as Empty,D as EmptyCustomMessage,w as ErrorMessage,_ as GroupedOptions,k as InitialActiveValue,C as Invalid,A as Keyboard,O as Loading,p as MaxVisible12,d as MaxVisible5,f as MaxVisible8,m as MaxVisibleAll,g as MultiSelectWithChecks,S as Required,y as SelectionFollowsFocusFalse,h as SinglePicker,b as WithDescriptionsAndIcons,j as __namedExportsOrder,l as default};