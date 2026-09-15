import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Menu-BXjG5rxF.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{t(),r(),i=[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`archive`,label:`Archive`},{separator:!0},{id:`delete`,label:`Delete`,tone:`danger`}],a=[{group:`View`,items:[{id:`sort-name`,label:`Sort by name`},{id:`sort-date`,label:`Sort by date`}]},{group:`Actions`,items:[{id:`export`,label:`Export`},{id:`archive`,label:`Archive`}]},{separator:!0},{id:`delete`,label:`Delete`,tone:`danger`}],o=[{id:`search`,label:`Search`,icon:`search`,shortcut:`⌘F`},{id:`export`,label:`Export`,icon:`external`,shortcut:`⌘E`},{separator:!0},{id:`delete`,label:`Delete`,icon:`close`,shortcut:`⌘⌫`,tone:`danger`}],s=[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`,disabled:!0},{id:`archive`,label:`Archive`}],c={title:`Menu/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`open-change`]}},argTypes:{triggerVariant:{control:`select`,options:[`ghost`,`secondary`,`primary`]},triggerIcon:{control:`select`,options:[`ellipsis`,`chevron-down`,`none`]},placement:{control:`select`,options:[`bottom-start`,`bottom-end`,`top-start`,`top-end`]}},args:{label:`More actions`,items:i,triggerVariant:`ghost`,triggerIcon:`chevron-down`,iconOnly:!1,placement:`bottom-start`},render:e=>n`
    <ds-menu
      label=${e.label}
      .items=${e.items}
      trigger-variant=${e.triggerVariant}
      trigger-icon=${e.triggerIcon}
      ?icon-only=${e.iconOnly}
      placement=${e.placement}
      ?open=${e.open}
    ></ds-menu>
  `},l={},u={args:{triggerVariant:`ghost`,open:!0}},d={args:{triggerVariant:`secondary`,open:!0}},f={args:{triggerVariant:`primary`,open:!0}},p={args:{triggerIcon:`ellipsis`,iconOnly:!0,label:`More actions`,open:!0}},m={args:{triggerIcon:`chevron-down`,open:!0}},h={args:{triggerIcon:`none`,open:!0}},g={args:{placement:`bottom-start`,open:!0}},_={args:{placement:`bottom-end`,open:!0}},v={args:{placement:`top-start`,open:!0}},y={args:{placement:`top-end`,open:!0}},b={args:{label:`Sort by`,items:a,open:!0}},x={args:{label:`File actions`,items:o,open:!0}},S={args:{items:s,open:!0}},C={args:{open:!0,items:i}},w=[`Default`,`TriggerVariantGhost`,`TriggerVariantSecondary`,`TriggerVariantPrimary`,`TriggerIconEllipsis`,`TriggerIconChevronDown`,`TriggerIconNone`,`PlacementBottomStart`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTopEnd`,`Grouped`,`IconsAndShortcuts`,`DisabledItem`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'ghost',
    open: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'secondary',
    open: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'primary',
    open: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'ellipsis',
    iconOnly: true,
    label: 'More actions',
    open: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'chevron-down',
    open: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'none',
    open: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start',
    open: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end',
    open: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start',
    open: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end',
    open: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sort by',
    items: GROUPED_ITEMS,
    open: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'File actions',
    items: ICON_SHORTCUT_ITEMS,
    open: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    items: DISABLED_ITEMS,
    open: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    items: ITEMS
  }
}`,...C.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify arrow navigation, Home/End, typeahead, Enter/Space,\r
Escape and Tab.`,...C.parameters?.docs?.description}}}})))()}T();export{l as Default,S as DisabledItem,b as Grouped,x as IconsAndShortcuts,C as Keyboard,_ as PlacementBottomEnd,g as PlacementBottomStart,y as PlacementTopEnd,v as PlacementTopStart,m as TriggerIconChevronDown,p as TriggerIconEllipsis,h as TriggerIconNone,u as TriggerVariantGhost,f as TriggerVariantPrimary,d as TriggerVariantSecondary,w as __namedExportsOrder,c as default};