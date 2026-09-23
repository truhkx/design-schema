import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DJvb7DFH.js";import{t as o}from"./Stack-CZci_zJ9.js";import{t as s}from"./Box-CEXPuAx3.js";import{i as c}from"./iframe-Dy0IL05G.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),c(),s(),a(),o(),l={title:`Splitter/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`size-change`,`size-change-end`,`collapse-change`]}},argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},stackBelow:{control:`select`,options:[`prose`,`content`,`never`]},collapsible:{control:`boolean`},defaultCollapsed:{control:`boolean`}},args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,orientation:`horizontal`,defaultSize:30,minSize:10,maxSize:90,step:2,collapsible:!1,defaultCollapsed:!1,persistKey:void 0,stackBelow:`prose`},render:e=>i`
    <div style="block-size: var(--layout-max-width-prose); border: var(--border-width-thin) solid var(--color-border);">
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
        <ds-box slot="primary" inset="md">${e.primary}</ds-box>
        <ds-box slot="secondary" inset="md">${e.secondary}</ds-box>
      </ds-splitter>
    </div>
  `},u={},d={args:{orientation:`horizontal`}},f={args:{orientation:`vertical`,label:`Preview height`,primary:`Editor`,secondary:`Preview`}},p={args:{stackBelow:`prose`}},m={args:{stackBelow:`content`}},h={args:{stackBelow:`never`}},g={args:{collapsible:!0}},_={args:{collapsible:!0,defaultCollapsed:!0}},v={args:{collapsible:!0,stackBelow:`never`},render:e=>i`
    <div style="block-size: var(--layout-max-width-prose); border: var(--border-width-thin) solid var(--color-border);">
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
        <ds-box slot="primary" inset="md">
          <ds-stack gap="normal" align="start">
            <ds-button label="Overview" variant="secondary" size="sm"></ds-button>
            <ds-button label="Reports" variant="secondary" size="sm"></ds-button>
          </ds-stack>
        </ds-box>
        <ds-box slot="secondary" inset="md">
          <ds-button label="Detail action" variant="secondary" size="sm"></ds-button>
        </ds-box>
      </ds-splitter>
    </div>
  `},y={args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,defaultSize:25,persistKey:`app-sidebar`,stackBelow:`never`}},b={args:{label:`Sidebar width`,primary:`A navigation tree`,secondary:`The selected document`,collapsible:!0,minSize:15}},x={args:{label:`Editor height`,primary:`The editor`,secondary:`The preview`,orientation:`vertical`,defaultSize:60}},S={args:{label:`List width`,primary:`The result list`,secondary:`The detail view`,stackBelow:`never`,step:5}},C=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`StackBelowProse`,`StackBelowContent`,`StackBelowNever`,`Collapsible`,`Collapsed`,`Keyboard`,`SidebarAndContent`,`CollapsibleNavigation`,`EditorOverPreview`,`NeverStackingWorkbench`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    label: 'Preview height',
    primary: 'Editor',
    secondary: 'Preview'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'prose'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'content'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'never'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true,
    defaultCollapsed: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true,
    stackBelow: 'never'
  },
  render: args => html\`
    <div style="block-size: var(--layout-max-width-prose); border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=\${args.label}
        orientation=\${args.orientation}
        default-size=\${args.defaultSize}
        min-size=\${args.minSize}
        max-size=\${args.maxSize}
        step=\${args.step}
        ?collapsible=\${args.collapsible}
        ?default-collapsed=\${args.defaultCollapsed}
        persist-key=\${ifDefined(args.persistKey)}
        stack-below=\${args.stackBelow}
      >
        <ds-box slot="primary" inset="md">
          <ds-stack gap="normal" align="start">
            <ds-button label="Overview" variant="secondary" size="sm"></ds-button>
            <ds-button label="Reports" variant="secondary" size="sm"></ds-button>
          </ds-stack>
        </ds-box>
        <ds-box slot="secondary" inset="md">
          <ds-button label="Detail action" variant="secondary" size="sm"></ds-button>
        </ds-box>
      </ds-splitter>
    </div>
  \`
}`,...v.parameters?.docs?.source},description:{story:`Present with its separator, collapse Button and at least three focusable children, for the\r
keyboard gate: Tab, arrows, Home/End, Enter and F6. \`stackBelow: never\` keeps the separator\r
rendered at the narrow widths the gate runs at — a stacked splitter renders none.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar',
    // Pinned so the story shows the split itself: a stacked splitter renders no separator.
    stackBelow: 'never'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    collapsible: true,
    minSize: 15
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Editor height',
    primary: 'The editor',
    secondary: 'The preview',
    orientation: 'vertical',
    defaultSize: 60
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'List width',
    primary: 'The result list',
    secondary: 'The detail view',
    stackBelow: 'never',
    step: 5
  }
}`,...S.parameters?.docs?.source}}}})))()}w();export{_ as Collapsed,g as Collapsible,b as CollapsibleNavigation,u as Default,x as EditorOverPreview,v as Keyboard,S as NeverStackingWorkbench,d as OrientationHorizontal,f as OrientationVertical,y as SidebarAndContent,m as StackBelowContent,h as StackBelowNever,p as StackBelowProse,C as __namedExportsOrder,l as default};