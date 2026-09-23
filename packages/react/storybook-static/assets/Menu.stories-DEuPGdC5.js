import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Menu-pFLiI3wA.js";function a(e){let[t,n]=(0,o.useState)(e.open??!0);return(0,s.jsx)(i,{...e,open:t,onOpenChange:(t,r)=>{n(t),e.onOpenChange?.(t,r)}})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{o=t(),r(),s=n(),c=[{id:`open`,label:`Open`,icon:`external`},{id:`rename`,label:`Rename`,shortcut:`Ctrl+R`},{id:`duplicate`,label:`Duplicate`},{group:`Sort by`,items:[{id:`sort-name`,label:`Name`},{id:`sort-date`,label:`Date modified`}]},{separator:!0},{id:`archive`,label:`Archive`,disabled:!0},{id:`delete`,label:`Delete`,tone:`danger`}],l={title:`Menu/React`,component:i,args:{label:`More actions`,items:c},argTypes:{onAction:{action:`onAction`},onOpenChange:{action:`onOpenChange`}},tags:[`autodocs`]},u={},d={args:{triggerVariant:`ghost`}},f={args:{triggerVariant:`secondary`}},p={args:{triggerVariant:`primary`}},m={args:{triggerIcon:`ellipsis`}},h={args:{triggerIcon:`chevron-down`}},g={args:{triggerIcon:`none`}},_={args:{placement:`bottom-start`,open:!0},render:e=>(0,s.jsx)(a,{...e})},v={args:{placement:`bottom-end`,open:!0},render:e=>(0,s.jsx)(a,{...e})},y={args:{placement:`top-start`,open:!0},render:e=>(0,s.jsx)(a,{...e})},b={args:{placement:`top-end`,open:!0},render:e=>(0,s.jsx)(a,{...e})},x={args:{iconOnly:!0,triggerIcon:`ellipsis`}},S={args:{open:!0},render:e=>(0,s.jsx)(a,{...e})},C={args:{label:`More actions`,iconOnly:!0,triggerIcon:`ellipsis`,items:[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{separator:!0},{id:`delete`,label:`Delete file`,tone:`danger`}]}},w={args:{label:`Sort by`,triggerVariant:`secondary`,triggerIcon:`chevron-down`,items:[{id:`name`,label:`Name`},{id:`modified`,label:`Last modified`},{id:`size`,label:`Size`}]}},T={args:{label:`Account`,placement:`bottom-end`,items:[{group:`Account`,items:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`}]},{group:`Workspace`,items:[{id:`members`,label:`Members`},{id:`settings`,label:`Settings`}]},{separator:!0},{id:`sign-out`,label:`Sign out`}]}},E={args:{label:`Edit`,items:[{id:`undo`,label:`Undo`,shortcut:`Ctrl+Z`},{id:`redo`,label:`Redo`,shortcut:`Ctrl+Shift+Z`}]}},D={render:e=>{let t=(0,o.useRef)(null);return(0,s.jsxs)(`div`,{ref:t,style:{display:`inline-block`,padding:`2rem`,border:`1px dashed currentColor`},children:[`Anchor element`,(0,s.jsx)(a,{...e,anchor:t,open:!0})]})}},O=[`Default`,`TriggerVariantGhost`,`TriggerVariantSecondary`,`TriggerVariantPrimary`,`TriggerIconEllipsis`,`TriggerIconChevronDown`,`TriggerIconNone`,`PlacementBottomStart`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTopEnd`,`IconOnly`,`Keyboard`,`RowOverflow`,`SortBy`,`GroupedAccountMenu`,`WithShortcuts`,`AnchorPositioned`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'ghost'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'secondary'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'primary'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'ellipsis'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'chevron-down'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'none'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start',
    open: true
  },
  render: args => <OpenMenu {...args} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end',
    open: true
  },
  render: args => <OpenMenu {...args} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start',
    open: true
  },
  render: args => <OpenMenu {...args} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end',
    open: true
  },
  render: args => <OpenMenu {...args} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    iconOnly: true,
    triggerIcon: 'ellipsis'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => <OpenMenu {...args} />
}`,...S.parameters?.docs?.source},description:{story:`Open with its trigger and more than three enabled items, for the keyboard gate.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`The icon-only overflow button on a row, with the destructive action last after a separator.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`A labelled dropdown of view options, anchored under a secondary trigger.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`More than about six items, so they are grouped with labels; aligned to the end of the trigger.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Display-only shortcut hints beside the items the app binds elsewhere.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const anchor = useRef<HTMLDivElement>(null);
    return <div ref={anchor} style={{
      display: 'inline-block',
      padding: '2rem',
      border: '1px dashed currentColor'
    }} // literal-ok: Storybook canvas decoration, not a component style
    >\r
        Anchor element\r
        <OpenMenu {...args} anchor={anchor} open />\r
      </div>;
  }
}`,...D.parameters?.docs?.source},description:{story:"`anchor` positions the popup on an arbitrary element instead of rendering a trigger — a context menu.",...D.parameters?.docs?.description}}}})))()}k();export{D as AnchorPositioned,u as Default,T as GroupedAccountMenu,x as IconOnly,S as Keyboard,v as PlacementBottomEnd,_ as PlacementBottomStart,b as PlacementTopEnd,y as PlacementTopStart,C as RowOverflow,w as SortBy,h as TriggerIconChevronDown,m as TriggerIconEllipsis,g as TriggerIconNone,d as TriggerVariantGhost,p as TriggerVariantPrimary,f as TriggerVariantSecondary,E as WithShortcuts,O as __namedExportsOrder,l as default};