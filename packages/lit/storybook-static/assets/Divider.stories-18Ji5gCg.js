import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-b_nq3K9L.js";import{t as i}from"./Divider-CzjPKdw-.js";import{t as a}from"./Stack-CZci_zJ9.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),r(),o={title:`Divider/Lit`,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},spacing:{control:`select`,options:[`none`,`tight`,`normal`,`loose`]},semantic:{control:`boolean`},label:{control:`text`}},args:{orientation:`horizontal`,label:``,semantic:!1,spacing:`none`},render:e=>n`
    <ds-divider
      orientation=${e.orientation}
      spacing=${e.spacing}
      .label=${e.label||void 0}
      ?semantic=${e.semantic}
    ></ds-divider>
  `},s={},c={args:{orientation:`horizontal`}},l={args:{orientation:`vertical`},render:e=>n`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=${e.orientation}
        spacing=${e.spacing}
        .label=${e.label||void 0}
        ?semantic=${e.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  `},u={args:{spacing:`none`}},d={args:{spacing:`tight`}},f={args:{spacing:`normal`}},p={args:{spacing:`loose`}},m={args:{semantic:!0}},h={args:{label:`or`}},g={args:{label:`or`,spacing:`normal`}},_={args:{orientation:`horizontal`}},v={args:{orientation:`vertical`},render:e=>n`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=${e.orientation}
        spacing=${e.spacing}
        .label=${e.label||void 0}
        ?semantic=${e.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  `},y={args:{semantic:!0,spacing:`loose`}},b=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`SpacingNone`,`SpacingTight`,`SpacingNormal`,`SpacingLoose`,`Semantic`,`Labelled`,`OrBetweenAlternatives`,`ListFurniture`,`ToolbarGroups`,`SectionBoundary`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: args => html\`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=\${args.orientation}
        spacing=\${args.spacing}
        .label=\${args.label || undefined}
        ?semantic=\${args.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  \`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'none'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'tight'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'normal'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'loose'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    semantic: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or',
    spacing: 'normal'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: args => html\`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=\${args.orientation}
        spacing=\${args.spacing}
        .label=\${args.label || undefined}
        ?semantic=\${args.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  \`
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    semantic: true,
    spacing: 'loose'
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{s as Default,h as Labelled,_ as ListFurniture,g as OrBetweenAlternatives,c as OrientationHorizontal,l as OrientationVertical,y as SectionBoundary,m as Semantic,p as SpacingLoose,u as SpacingNone,f as SpacingNormal,d as SpacingTight,v as ToolbarGroups,b as __namedExportsOrder,o as default};