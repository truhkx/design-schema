import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{a as r}from"./iframe-DJFLK4ZL.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),i={title:`Tree/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`selection-change`,`expand-change`,`expand`,`activate`]}},argTypes:{selectable:{control:`select`,options:[`none`,`single`,`multiple`]},headingLevel:{control:`select`,options:[`2`,`3`,`4`]}},args:{label:`Folders`,showLabel:!1,headingLevel:`2`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}],selectable:`single`,selectChildren:!1,selectOnFocus:!1,showGuides:!0,defaultExpanded:[`docs`]},render:e=>n`
    <ds-tree
      label=${e.label}
      ?show-label=${e.showLabel}
      heading-level=${e.headingLevel}
      .nodes=${e.nodes}
      selectable=${e.selectable}
      ?select-children=${e.selectChildren}
      ?select-on-focus=${e.selectOnFocus}
      ?hide-guides=${!e.showGuides}
      .expanded=${e.expanded}
      .defaultExpanded=${e.defaultExpanded}
      .selected=${e.selected}
      .defaultSelected=${e.defaultSelected}
    ></ds-tree>
  `},a={},o={args:{showLabel:!0,headingLevel:`2`}},s={args:{showLabel:!0,headingLevel:`3`}},c={args:{showLabel:!0,headingLevel:`4`}},l={args:{selectable:`none`}},u={args:{selectable:`single`,defaultSelected:[`invoices`]}},d={args:{selectable:`multiple`,defaultSelected:[`invoices`]}},f={args:{selectable:`multiple`,selectChildren:!0,defaultSelected:[`invoices`]}},p={args:{selectOnFocus:!0}},m={args:{showGuides:!1}},h={args:{nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`}]}},g={args:{nodes:[]}},_={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},v={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},y={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},b={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},x={args:{defaultExpanded:[`docs`]}},S=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`SelectChildren`,`SelectOnFocus`,`HideGuides`,`DisabledNode`,`Empty`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`,`Keyboard`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultSelected: ['invoices']
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultSelected: ['invoices']
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultSelected: ['invoices']
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selectOnFocus: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: [{
      id: 'docs',
      label: 'Documents',
      icon: 'folder',
      children: [{
        id: 'invoices',
        label: 'Invoices',
        disabled: true
      }]
    }, {
      id: 'media',
      label: 'Media',
      icon: 'folder'
    }]
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Folders',
    defaultExpanded: ['docs'],
    nodes: [{
      id: 'docs',
      label: 'Documents',
      icon: 'folder',
      children: [{
        id: 'invoices',
        label: 'Invoices',
        icon: 'file'
      }, {
        id: 'contracts',
        label: 'Contracts',
        icon: 'file'
      }]
    }, {
      id: 'media',
      label: 'Media',
      icon: 'folder',
      children: 'lazy'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings sections',
    showLabel: true,
    headingLevel: '2',
    selectOnFocus: true,
    nodes: [{
      id: 'account',
      label: 'Account',
      href: '/settings/account'
    }, {
      id: 'billing',
      label: 'Billing',
      href: '/settings/billing'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Categories',
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    nodes: [{
      id: 'clothing',
      label: 'Clothing',
      children: [{
        id: 'shirts',
        label: 'Shirts'
      }, {
        id: 'shoes',
        label: 'Shoes'
      }]
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Site map',
    selectable: 'none',
    nodes: [{
      id: 'guides',
      label: 'Guides',
      badge: '12',
      children: [{
        id: 'start',
        label: 'Getting started'
      }]
    }, {
      id: 'api',
      label: 'API',
      badge: '48',
      children: 'lazy'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['docs']
  }
}`,...x.parameters?.docs?.source},description:{story:`Present with at least three focusable treeitems for the keyboard gate.`,...x.parameters?.docs?.description}}}})))()}C();export{y as CategoryPickerWithCascade,a as Default,h as DisabledNode,g as Empty,_ as FolderTree,o as HeadingLevel2,s as HeadingLevel3,c as HeadingLevel4,m as HideGuides,x as Keyboard,v as NavigationSidebar,b as ReadOnlySiteMap,f as SelectChildren,p as SelectOnFocus,d as SelectableMultiple,l as SelectableNone,u as SelectableSingle,S as __namedExportsOrder,i as default};