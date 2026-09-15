import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{a as r}from"./iframe-CsoUKhN4.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),i=[{id:`documents`,label:`Documents`,icon:`external`,children:[{id:`resume`,label:`Resume.pdf`,badge:`2`},{id:`taxes`,label:`Taxes`,children:[{id:`taxes-2025`,label:`2025.pdf`}]}]},{id:`photos`,label:`Photos`,children:[{id:`vacation`,label:`Vacation`,badge:`48`},{id:`family`,label:`Family`,disabled:!0}]},{id:`downloads`,label:`Downloads`,badge:`3`}],a=[{id:`guides`,label:`Guides`,children:[{id:`getting-started`,label:`Getting started`,href:`#getting-started`},{id:`installation`,label:`Installation`,href:`#installation`}]},{id:`components`,label:`Components`,children:[{id:`button`,label:`Button`,href:`#button`},{id:`tree`,label:`Tree`,href:`#tree`}]}],o=[{id:`root`,label:`Project`,children:`lazy`},{id:`sibling`,label:`Other project`,children:[{id:`sibling-child`,label:`README.md`}]}],s={title:`Tree/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`selection-change`,`expand-change`,`expand`,`activate`]}},argTypes:{selectable:{control:`select`,options:[`none`,`single`,`multiple`]},headingLevel:{control:`select`,options:[`2`,`3`,`4`]}},args:{label:`Folders`,showLabel:!1,headingLevel:`2`,nodes:i,selectable:`single`,selectChildren:!1,selectOnFocus:!1,showGuides:!0,defaultExpanded:[`documents`]},render:e=>n`
    <ds-tree
      label=${e.label}
      ?show-label=${e.showLabel}
      heading-level=${e.headingLevel}
      .nodes=${e.nodes}
      selectable=${e.selectable}
      ?select-children=${e.selectChildren}
      ?select-on-focus=${e.selectOnFocus}
      ?hide-guides=${!e.showGuides}
      .defaultExpanded=${e.defaultExpanded}
      .defaultSelected=${e.defaultSelected}
    ></ds-tree>
  `},c={},l={args:{selectable:`none`}},u={args:{selectable:`single`,defaultSelected:[`resume`]}},d={args:{selectable:`multiple`,selectChildren:!0,defaultSelected:[`resume`]}},f={args:{showLabel:!0}},p={args:{showLabel:!0,headingLevel:`2`}},m={args:{showLabel:!0,headingLevel:`3`}},h={args:{showLabel:!0,headingLevel:`4`}},g={args:{showGuides:!1}},_={args:{selectOnFocus:!0,defaultSelected:[`resume`]}},v={args:{label:`Site sections`,nodes:a,defaultExpanded:[`guides`,`components`]}},y={args:{label:`Projects`,nodes:o}},b={args:{defaultExpanded:[`photos`]}},x={args:{nodes:[]}},S={args:{nodes:i,defaultExpanded:[`documents`,`photos`]}},C=[`Default`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`ShowLabel`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`NoGuides`,`SelectOnFocus`,`NavigationTree`,`LazyLoading`,`DisabledNode`,`Empty`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultSelected: ['resume']
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultSelected: ['resume']
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    selectOnFocus: true,
    defaultSelected: ['resume']
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Site sections',
    nodes: NAVIGATION_NODES,
    defaultExpanded: ['guides', 'components']
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Projects',
    nodes: LAZY_NODES
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['photos']
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: FOLDER_NODES,
    defaultExpanded: ['documents', 'photos']
  }
}`,...S.parameters?.docs?.source},description:{story:`Renders open with at least three focusable nodes so the keyboard gate can\r
verify arrow navigation, Home/End, type-ahead, expand/collapse, Enter/Space\r
and Tab.`,...S.parameters?.docs?.description}}}})))()}w();export{c as Default,b as DisabledNode,x as Empty,p as HeadingLevel2,m as HeadingLevel3,h as HeadingLevel4,S as Keyboard,y as LazyLoading,v as NavigationTree,g as NoGuides,_ as SelectOnFocus,d as SelectableMultiple,l as SelectableNone,u as SelectableSingle,f as ShowLabel,C as __namedExportsOrder,s as default};