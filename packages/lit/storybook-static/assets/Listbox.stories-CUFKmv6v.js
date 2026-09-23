import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Listbox-C5AgG3X3.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{t(),r(),a(),o=[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`},{value:`date`,label:`Date`},{value:`elderberry`,label:`Elderberry`}],s=[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`}],c=[...o,{value:`fig`,label:`Fig`},{value:`grape`,label:`Grape`},{value:`honeydew`,label:`Honeydew`},{value:`kiwi`,label:`Kiwi`},{value:`lemon`,label:`Lemon`},{value:`mango`,label:`Mango`},{value:`nectarine`,label:`Nectarine`},{value:`orange`,label:`Orange`},{value:`papaya`,label:`Papaya`}],l=[{value:`ana`,label:`Ana Souza`,description:`Product design`},{value:`bo`,label:`Bo Lin`,description:`Engineering`},{value:`cara`,label:`Cara Nash`,description:`Engineering`,icon:`success`},{value:`deshawn`,label:`DeShawn Reid`,description:`Out of office`,disabled:!0}],u={title:`Listbox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`active-change`]}},argTypes:{maxVisible:{control:`select`,options:[`5`,`8`,`12`,`all`]}},args:{label:`Fruit`,options:s,multiple:!1,selectionFollowsFocus:!0,required:!1,invalid:!1,embedded:!1,loading:!1,disabled:!1,maxVisible:`8`},render:e=>i`
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
      .activeValue=${e.activeValue}
      ?loading=${e.loading}
      ?disabled=${e.disabled}
      name=${n(e.name)}
      empty-message=${n(e.emptyMessage)}
      max-visible=${e.maxVisible}
    ></ds-listbox>
  `},d={},f={args:{maxVisible:`5`,options:c}},p={args:{maxVisible:`8`,options:c}},m={args:{maxVisible:`12`,options:c}},h={args:{maxVisible:`all`,options:c}},g={args:{label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`cherry`,label:`Cherry`}]}},_={args:{label:`Roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},v={args:{label:`Role`,options:[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`}]}]}},y={args:{label:`Country`,embedded:!0,maxVisible:`5`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`}]}},b={args:{label:`Assignee`,options:l}},x={args:{selectionFollowsFocus:!1}},S={args:{required:!0,name:`fruit`}},C={args:{invalid:!0}},w={args:{error:`Fix this before continuing.`}},T={args:{disabled:!0,defaultValue:`banana`}},E={args:{loading:!0,options:[]}},D={args:{initialActiveValue:`cherry`}},O={args:{options:[]}},k={args:{options:[],emptyMessage:`No matching people`}},A={args:{value:`cherry`}},j={args:{multiple:!0,defaultValue:[`banana`]}},M={args:{labelledBy:`listbox-story-label`},render:e=>i`
    <div>
      <p id="listbox-story-label">Favourite fruit</p>
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
        .activeValue=${e.activeValue}
        ?loading=${e.loading}
        ?disabled=${e.disabled}
        name=${n(e.name)}
        empty-message=${n(e.emptyMessage)}
        max-visible=${e.maxVisible}
      ></ds-listbox>
    </div>
  `},N={args:{options:o}},P=[`Default`,`MaxVisible5`,`MaxVisible8`,`MaxVisible12`,`MaxVisibleAll`,`SinglePicker`,`MultiSelectWithChecks`,`GroupedOptions`,`EmbeddedInAPopup`,`WithDescriptions`,`SelectionFollowsFocusFalse`,`Required`,`Invalid`,`ErrorMessage`,`Disabled`,`Loading`,`InitialActiveValue`,`Empty`,`EmptyWithMessage`,`Controlled`,`Multiple`,`LabelledBy`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    maxVisible: '5',
    options: MANY_FRUITS
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    maxVisible: '8',
    options: MANY_FRUITS
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    maxVisible: '12',
    options: MANY_FRUITS
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    maxVisible: 'all',
    options: MANY_FRUITS
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Assignee',
    options: PEOPLE
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    selectionFollowsFocus: false
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
    loading: true,
    options: []
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    initialActiveValue: 'cherry'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    options: []
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    options: [],
    emptyMessage: 'No matching people'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'cherry'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    defaultValue: ['banana']
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    labelledBy: 'listbox-story-label'
  },
  render: args => html\`
    <div>
      <p id="listbox-story-label">Favourite fruit</p>
      <ds-listbox
        label=\${args.label}
        labelled-by=\${ifDefined(args.labelledBy)}
        .options=\${args.options}
        ?multiple=\${args.multiple}
        .value=\${args.value}
        .defaultValue=\${args.defaultValue}
        .selectionFollowsFocus=\${args.selectionFollowsFocus}
        ?required=\${args.required}
        ?invalid=\${args.invalid}
        .error=\${args.error}
        ?embedded=\${args.embedded}
        initial-active-value=\${ifDefined(args.initialActiveValue)}
        .activeValue=\${args.activeValue}
        ?loading=\${args.loading}
        ?disabled=\${args.disabled}
        name=\${ifDefined(args.name)}
        empty-message=\${ifDefined(args.emptyMessage)}
        max-visible=\${args.maxVisible}
      ></ds-listbox>
    </div>
  \`
}`,...M.parameters?.docs?.source},description:{story:"`labelledBy` is accepted for parity with web, but ids do not cross a shadow\r\nroot: the list is still named by `label`, and the visible paragraph is only\r\na caption beside it.",...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    options: FRUITS
  }
}`,...N.parameters?.docs?.source},description:{story:`Present with at least three options, for the keyboard gate — Listbox has no trigger or popup.`,...N.parameters?.docs?.description}}}})))()}F();export{A as Controlled,d as Default,T as Disabled,y as EmbeddedInAPopup,O as Empty,k as EmptyWithMessage,w as ErrorMessage,v as GroupedOptions,D as InitialActiveValue,C as Invalid,N as Keyboard,M as LabelledBy,E as Loading,m as MaxVisible12,f as MaxVisible5,p as MaxVisible8,h as MaxVisibleAll,_ as MultiSelectWithChecks,j as Multiple,S as Required,x as SelectionFollowsFocusFalse,g as SinglePicker,b as WithDescriptions,P as __namedExportsOrder,u as default};