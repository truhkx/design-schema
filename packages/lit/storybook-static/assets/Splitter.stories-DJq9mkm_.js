import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Button-TSn-G4Vm.js";import{i as o}from"./iframe-CsoUKhN4.js";var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),i(),o(),a(),s={title:`Splitter/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`size-change`,`size-change-end`,`collapse-change`]}},argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},stackBelow:{control:`select`,options:[`prose`,`content`,`never`]},collapsible:{control:`boolean`}},args:{label:`Sidebar width`,orientation:`horizontal`,defaultSize:30,minSize:10,maxSize:90,step:2,collapsible:!1,persistKey:void 0,stackBelow:`prose`},render:e=>n`
    <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=${e.label}
        orientation=${e.orientation}
        default-size=${e.defaultSize}
        min-size=${e.minSize}
        max-size=${e.maxSize}
        step=${e.step}
        ?collapsible=${e.collapsible}
        persist-key=${r(e.persistKey)}
        stack-below=${e.stackBelow}
      >
        <nav slot="primary" style="padding: var(--space-3);">Navigation</nav>
        <main slot="secondary" style="padding: var(--space-3);">Content</main>
      </ds-splitter>
    </div>
  `},c={},l={args:{orientation:`horizontal`}},u={args:{orientation:`vertical`}},d={args:{stackBelow:`prose`}},f={args:{stackBelow:`content`}},p={args:{stackBelow:`never`}},m={args:{collapsible:!0}},h={args:{persistKey:`storybook-splitter-demo`}},g={args:{collapsible:!0},render:e=>n`
    <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=${e.label}
        orientation=${e.orientation}
        default-size=${e.defaultSize}
        min-size=${e.minSize}
        max-size=${e.maxSize}
        step=${e.step}
        ?collapsible=${e.collapsible}
        stack-below=${e.stackBelow}
      >
        <nav slot="primary" style="padding: var(--space-3);">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </nav>
        <main slot="secondary" style="padding: var(--space-3);">
          <ds-button label="Third"></ds-button>
        </main>
      </ds-splitter>
    </div>
  `},_=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`StackBelowProse`,`StackBelowContent`,`StackBelowNever`,`Collapsible`,`WithPersistKey`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'prose'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'content'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    stackBelow: 'never'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    persistKey: 'storybook-splitter-demo'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: true
  },
  render: args => html\`
    <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=\${args.label}
        orientation=\${args.orientation}
        default-size=\${args.defaultSize}
        min-size=\${args.minSize}
        max-size=\${args.maxSize}
        step=\${args.step}
        ?collapsible=\${args.collapsible}
        stack-below=\${args.stackBelow}
      >
        <nav slot="primary" style="padding: var(--space-3);">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </nav>
        <main slot="secondary" style="padding: var(--space-3);">
          <ds-button label="Third"></ds-button>
        </main>
      </ds-splitter>
    </div>
  \`
}`,...g.parameters?.docs?.source},description:{story:`Renders the separator with three focusable children across its two panes (two\r
buttons in the primary pane, one in the secondary), plus a collapse button, so\r
the keyboard gate can verify Tab, arrows, Home/End, Enter and F6.`,...g.parameters?.docs?.description}}}})))()}v();export{m as Collapsible,c as Default,g as Keyboard,l as OrientationHorizontal,u as OrientationVertical,f as StackBelowContent,p as StackBelowNever,d as StackBelowProse,h as WithPersistKey,_ as __namedExportsOrder,s as default};