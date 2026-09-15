import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Divider-CjRqMAnq.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),r(),i={title:`Divider/Lit`,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},spacing:{control:`select`,options:[`none`,`tight`,`normal`,`loose`]},semantic:{control:`boolean`},label:{control:`text`}},args:{orientation:`horizontal`,label:``,semantic:!1,spacing:`none`},render:e=>n`
    <ds-divider
      orientation=${e.orientation}
      spacing=${e.spacing}
      label=${e.label||void 0}
      ?semantic=${e.semantic}
    ></ds-divider>
  `},a={},o={args:{orientation:`horizontal`}},s={args:{orientation:`vertical`},render:e=>n`
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <span>Left</span>
      <ds-divider
        orientation=${e.orientation}
        spacing=${e.spacing}
        ?semantic=${e.semantic}
        style="block-size: var(--space-8);"
      ></ds-divider>
      <span>Right</span>
    </div>
  `},c={args:{spacing:`none`}},l={args:{spacing:`tight`}},u={args:{spacing:`normal`}},d={args:{spacing:`loose`}},f={args:{label:`or`}},p={args:{semantic:!0}},m=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`SpacingNone`,`SpacingTight`,`SpacingNormal`,`SpacingLoose`,`Labelled`,`Semantic`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: args => html\`
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <span>Left</span>
      <ds-divider
        orientation=\${args.orientation}
        spacing=\${args.spacing}
        ?semantic=\${args.semantic}
        style="block-size: var(--space-8);"
      ></ds-divider>
      <span>Right</span>
    </div>
  \`
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'none'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'tight'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'normal'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'loose'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    semantic: true
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{a as Default,f as Labelled,o as OrientationHorizontal,s as OrientationVertical,p as Semantic,d as SpacingLoose,c as SpacingNone,u as SpacingNormal,l as SpacingTight,m as __namedExportsOrder,i as default};