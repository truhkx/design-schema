import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{a as r}from"./iframe-C6sywzE2.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),r(),i={title:`Tree/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`selection-change`,`expand-change`,`expand`,`activate`]}},argTypes:{selectable:{control:`select`,options:[`none`,`single`,`multiple`]},headingLevel:{control:`select`,options:[`2`,`3`,`4`]}},args:{label:`Folders`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,badge:`3`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`},{id:`archive`,label:`Archive`,icon:`file`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`,children:[{id:`photos`,label:`Photos`,icon:`folder`,children:[{id:`holiday`,label:`Holiday`,icon:`file`}]},{id:`videos`,label:`Videos`,icon:`folder`,children:`lazy`}]},{id:`notes`,label:`Notes`,icon:`file`}],showLabel:!1,headingLevel:`2`,selectable:`single`,selectChildren:!1,selectOnFocus:!1,showGuides:!0},render:e=>n`
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
  `},a={},o={args:{selectable:`none`,defaultExpanded:[`docs`]}},s={args:{selectable:`single`,defaultExpanded:[`docs`],defaultSelected:[`invoices`]}},c={args:{selectable:`multiple`,defaultExpanded:[`docs`],defaultSelected:[`invoices`,`notes`]}},l={args:{showLabel:!0,headingLevel:`2`}},u={args:{showLabel:!0,headingLevel:`3`}},d={args:{showLabel:!0,headingLevel:`4`}},f={args:{selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],defaultSelected:[`invoices`]}},p={args:{showGuides:!1,defaultExpanded:[`*`]}},m={args:{defaultExpanded:[`media`,`videos`]}},h={args:{nodes:[]}},g={args:{defaultExpanded:[`docs`]}},_={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},v={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},y={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},b={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},x=[`Default`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectChildren`,`GuidesHidden`,`LazyLoading`,`Empty`,`Keyboard`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none',
    defaultExpanded: ['docs']
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices']
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices', 'notes']
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    defaultSelected: ['invoices']
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false,
    defaultExpanded: ['*']
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['media', 'videos']
  }
}`,...m.parameters?.docs?.source},description:{story:'A `children: "lazy"` branch. `videos` is listed in `defaultExpanded` but stays closed — a lazy id only opens\r\non a user act, which is what fires `expand`; open it to see the placeholder and the parent\'s `aria-busy`.',...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['docs']
  }
}`,...g.parameters?.docs?.source},description:{story:`Keyboard gate: present with the first branch open — Documents, Invoices, Contracts, Media, Notes are focusable.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`The everyday file tree, one branch open, each node with its glyph.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`A settings sidebar whose visible heading names it and whose selection drives the panel beside it.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Multi-select categories where choosing a parent chooses everything under it.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`A tree that only expands and collapses, with counts after each branch.`,...b.parameters?.docs?.description}}}})))()}S();export{y as CategoryPickerWithCascade,a as Default,h as Empty,_ as FolderTree,p as GuidesHidden,l as HeadingLevel2,u as HeadingLevel3,d as HeadingLevel4,g as Keyboard,m as LazyLoading,v as NavigationSidebar,b as ReadOnlySiteMap,f as SelectChildren,c as SelectableMultiple,o as SelectableNone,s as SelectableSingle,x as __namedExportsOrder,i as default};