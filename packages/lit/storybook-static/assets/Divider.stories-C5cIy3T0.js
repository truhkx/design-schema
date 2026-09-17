import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-C3do0IPT.js";import{t as i}from"./Divider-CGOJ5-aD.js";import{t as a}from"./Stack-gnRbseNc.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),i(),a(),r(),o=e=>n`
  <ds-divider
    orientation=${e.orientation}
    spacing=${e.spacing}
    .label=${e.label||void 0}
    ?semantic=${e.semantic}
  ></ds-divider>
`,s=e=>n`
  <ds-stack direction="horizontal" gap="normal" align="stretch">
    <ds-text element="span">Bold</ds-text>
    <ds-text element="span">Italic</ds-text>
    ${o(e)}
    <ds-text element="span">Align left</ds-text>
    <ds-text element="span">Align right</ds-text>
  </ds-stack>
`,c={title:`Divider/Lit`,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},spacing:{control:`select`,options:[`none`,`tight`,`normal`,`loose`]},semantic:{control:`boolean`},label:{control:`text`}},args:{orientation:`horizontal`,label:``,semantic:!1,spacing:`none`},render:o},l={},u={args:{orientation:`horizontal`}},d={args:{orientation:`vertical`},render:s},f={args:{spacing:`none`}},p={args:{spacing:`tight`}},m={args:{spacing:`normal`}},h={args:{spacing:`loose`}},g={args:{label:`or`}},_={args:{semantic:!0}},v={args:{label:`or`,spacing:`normal`}},y={args:{orientation:`horizontal`}},b={args:{orientation:`vertical`},render:s},x={args:{semantic:!0,spacing:`loose`}},S=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`SpacingNone`,`SpacingTight`,`SpacingNormal`,`SpacingLoose`,`Labelled`,`Semantic`,`OrBetweenAlternatives`,`ListFurniture`,`ToolbarGroups`,`SectionBoundary`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: inRow
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'none'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'tight'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'normal'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 'loose'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    semantic: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or',
    spacing: 'normal'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: inRow
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    semantic: true,
    spacing: 'loose'
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{l as Default,g as Labelled,y as ListFurniture,v as OrBetweenAlternatives,u as OrientationHorizontal,d as OrientationVertical,x as SectionBoundary,_ as Semantic,h as SpacingLoose,f as SpacingNone,m as SpacingNormal,p as SpacingTight,b as ToolbarGroups,S as __namedExportsOrder,c as default};