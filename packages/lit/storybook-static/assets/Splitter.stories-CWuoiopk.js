import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DJvb7DFH.js";import{t as o}from"./Stack-CZci_zJ9.js";import{t as s}from"./Box-CEXPuAx3.js";import{i as c}from"./iframe-CV6aZYyO.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),r(),c(),s(),a(),o(),l=e=>i`
  <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">${e}</div>
`,u=(e,t,r)=>i`
  <ds-splitter
    label=${e.label}
    orientation=${e.orientation}
    default-size=${e.defaultSize}
    min-size=${e.minSize}
    max-size=${e.maxSize}
    step=${e.step}
    ?collapsible=${e.collapsible}
    ?default-collapsed=${e.defaultCollapsed}
    persist-key=${n(e.persistKey)}
    stack-below=${e.stackBelow}
  >
    <ds-box slot="primary" inset="md">${t}</ds-box>
    <ds-box slot="secondary" inset="md">${r}</ds-box>
  </ds-splitter>
`,d={title:`Splitter/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`size-change`,`size-change-end`,`collapse-change`]}},argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},stackBelow:{control:`select`,options:[`prose`,`content`,`never`]},collapsible:{control:`boolean`},defaultCollapsed:{control:`boolean`}},args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,orientation:`horizontal`,defaultSize:30,minSize:10,maxSize:90,step:2,collapsible:!1,defaultCollapsed:!1,persistKey:void 0,stackBelow:`prose`},render:e=>l(u(e,i`${e.primary}`,i`${e.secondary}`))},f={},p={args:{orientation:`horizontal`}},m={args:{orientation:`vertical`}},h={args:{stackBelow:`prose`}},g={args:{stackBelow:`content`}},_={args:{stackBelow:`never`}},v={args:{collapsible:!0}},y={args:{collapsible:!0,defaultCollapsed:!0}},b={args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,defaultSize:25,persistKey:`app-sidebar`}},x={args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,collapsible:!0,minSize:15}},S={args:{label:`Editor height`,primary:`The editor`,secondary:`The preview`,orientation:`vertical`,defaultSize:60}},C={args:{label:`List width`,primary:`The result list`,secondary:`The detail view`,stackBelow:`never`,step:5}},w={args:{collapsible:!0,stackBelow:`never`},render:e=>l(u(e,i`<ds-stack gap="tight">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </ds-stack>`,i`<ds-stack gap="tight"><ds-button label="Third"></ds-button></ds-stack>`))},T=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`StackBelowProse`,`StackBelowContent`,`StackBelowNever`,`Collapsible`,`Collapsed`,`SidebarAndContent`,`CollapsibleNavigation`,`EditorOverPreview`,`NeverStackingWorkbench`,`Keyboard`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'prose'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'content'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'never'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true,
    defaultCollapsed: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    collapsible: true,
    minSize: 15
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Editor height',
    primary: 'The editor',
    secondary: 'The preview',
    orientation: 'vertical',
    defaultSize: 60
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'List width',
    primary: 'The result list',
    secondary: 'The detail view',
    stackBelow: 'never',
    step: 5
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true,
    stackBelow: 'never'
  },
  render: args => frame(splitter(args, html\`<ds-stack gap="tight">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </ds-stack>\`, html\`<ds-stack gap="tight"><ds-button label="Third"></ds-button></ds-stack>\`))
}`,...w.parameters?.docs?.source},description:{story:`The separator between two panes holding three focusable buttons, with the collapse button, so the keyboard\r
gate can exercise Tab, arrows, Home/End, Enter and F6. \`stackBelow: never\` keeps the separator rendered at\r
narrow test widths.`,...w.parameters?.docs?.description}}}})))()}E();export{y as Collapsed,v as Collapsible,x as CollapsibleNavigation,f as Default,S as EditorOverPreview,w as Keyboard,C as NeverStackingWorkbench,p as OrientationHorizontal,m as OrientationVertical,b as SidebarAndContent,g as StackBelowContent,_ as StackBelowNever,h as StackBelowProse,T as __namedExportsOrder,d as default};