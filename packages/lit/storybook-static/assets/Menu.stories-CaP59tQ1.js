import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Menu-B3wNeOx_.js";function i(e){let t=e.currentTarget;t.open!==void 0&&(t.open=e.detail.open)}var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{t(),r(),a=[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`archive`,label:`Archive`},{separator:!0},{id:`delete`,label:`Delete`,tone:`danger`}],o={title:`Menu/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`open-change`]}},argTypes:{triggerVariant:{control:`select`,options:[`ghost`,`secondary`,`primary`]},triggerIcon:{control:`select`,options:[`ellipsis`,`chevron-down`,`none`]},placement:{control:`select`,options:[`bottom-start`,`bottom-end`,`top-start`,`top-end`]}},args:{label:`More actions`,items:a,triggerVariant:`ghost`,triggerIcon:`chevron-down`,iconOnly:!1,placement:`bottom-start`},render:e=>n`
    <ds-menu
      label=${e.label}
      .items=${e.items}
      trigger-variant=${e.triggerVariant}
      trigger-icon=${e.triggerIcon}
      ?icon-only=${e.iconOnly}
      placement=${e.placement}
      .open=${e.open}
      @open-change=${i}
    ></ds-menu>
  `},s={},c={args:{triggerVariant:`ghost`}},l={args:{triggerVariant:`secondary`}},u={args:{triggerVariant:`primary`}},d={args:{triggerIcon:`ellipsis`,iconOnly:!0}},f={args:{triggerIcon:`chevron-down`}},p={args:{triggerIcon:`none`}},m={args:{placement:`bottom-start`,open:!0}},h={args:{placement:`bottom-end`,open:!0}},g={args:{placement:`top-start`,open:!0}},_={args:{placement:`top-end`,open:!0}},v={args:{open:!0,items:[{id:`rename`,label:`Rename`,disabled:!0},{id:`duplicate`,label:`Duplicate`}]}},y={args:{label:`More actions`,iconOnly:!0,triggerIcon:`ellipsis`,items:[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{separator:!0},{id:`delete`,label:`Delete file`,tone:`danger`}]}},b={args:{label:`Sort by`,triggerVariant:`secondary`,triggerIcon:`chevron-down`,items:[{id:`name`,label:`Name`},{id:`modified`,label:`Last modified`},{id:`size`,label:`Size`}]}},x={args:{label:`Account`,placement:`bottom-end`,items:[{group:`Account`,items:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`}]},{group:`Workspace`,items:[{id:`members`,label:`Members`},{id:`settings`,label:`Settings`}]},{separator:!0},{id:`sign-out`,label:`Sign out`}]}},S={args:{label:`Edit`,items:[{id:`undo`,label:`Undo`,shortcut:`Ctrl+Z`},{id:`redo`,label:`Redo`,shortcut:`Ctrl+Shift+Z`}]}},C={args:{open:!0,items:a}},w=[`Default`,`TriggerVariantGhost`,`TriggerVariantSecondary`,`TriggerVariantPrimary`,`TriggerIconEllipsis`,`TriggerIconChevronDown`,`TriggerIconNone`,`PlacementBottomStart`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTopEnd`,`DisabledItem`,`RowOverflow`,`SortBy`,`GroupedAccountMenu`,`WithShortcuts`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'ghost'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'secondary'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'primary'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'ellipsis',
    iconOnly: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'chevron-down'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start',
    open: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end',
    open: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start',
    open: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end',
    open: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    items: [{
      id: 'rename',
      label: 'Rename',
      disabled: true
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'More actions',
    iconOnly: true,
    triggerIcon: 'ellipsis',
    items: [{
      id: 'rename',
      label: 'Rename'
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }, {
      separator: true
    }, {
      id: 'delete',
      label: 'Delete file',
      tone: 'danger'
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sort by',
    triggerVariant: 'secondary',
    triggerIcon: 'chevron-down',
    items: [{
      id: 'name',
      label: 'Name'
    }, {
      id: 'modified',
      label: 'Last modified'
    }, {
      id: 'size',
      label: 'Size'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Account',
    placement: 'bottom-end',
    items: [{
      group: 'Account',
      items: [{
        id: 'profile',
        label: 'Profile'
      }, {
        id: 'billing',
        label: 'Billing'
      }]
    }, {
      group: 'Workspace',
      items: [{
        id: 'members',
        label: 'Members'
      }, {
        id: 'settings',
        label: 'Settings'
      }]
    }, {
      separator: true
    }, {
      id: 'sign-out',
      label: 'Sign out'
    }]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Edit',
    items: [{
      id: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z'
    }, {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z'
    }]
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    items: ITEMS
  }
}`,...C.parameters?.docs?.source},description:{story:`Open with its trigger and more than three focusable items, for the keyboard gate.`,...C.parameters?.docs?.description}}}})))()}T();export{s as Default,v as DisabledItem,x as GroupedAccountMenu,C as Keyboard,h as PlacementBottomEnd,m as PlacementBottomStart,_ as PlacementTopEnd,g as PlacementTopStart,y as RowOverflow,b as SortBy,f as TriggerIconChevronDown,d as TriggerIconEllipsis,p as TriggerIconNone,c as TriggerVariantGhost,u as TriggerVariantPrimary,l as TriggerVariantSecondary,S as WithShortcuts,w as __namedExportsOrder,o as default};