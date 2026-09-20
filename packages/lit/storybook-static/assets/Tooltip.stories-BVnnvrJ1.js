import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-BHsrajXm.js";import{t as i}from"./Button-CG4k9eqY.js";import{t as a}from"./Stack-CZci_zJ9.js";import{t as o}from"./Tooltip-YvNojDGY.js";import{u as s}from"./iframe-B0T1LYjz.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),o(),i(),r(),s(),a(),c={title:`Tooltip/Lit`,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`top`,`bottom`,`start`,`end`]},describes:{control:`boolean`},delay:{control:`select`,options:[`default`,`none`]},open:{control:`boolean`}},args:{content:`Includes archived items`,placement:`top`,describes:!0,delay:`default`,open:void 0},render:e=>n`
    <ds-tooltip
      content=${e.content}
      placement=${e.placement}
      ?no-describes=${!e.describes}
      delay=${e.delay}
      .open=${e.open}
    >
      <ds-button label="Items" variant="secondary"></ds-button>
    </ds-tooltip>
  `},l={},u={args:{placement:`top`,open:!0}},d={args:{placement:`bottom`,open:!0}},f={args:{placement:`start`,open:!0}},p={args:{placement:`end`,open:!0}},m={args:{delay:`default`}},h={args:{delay:`none`}},g={args:{content:`Add item`,describes:!1},render:e=>n`
    <ds-tooltip content=${e.content} placement=${e.placement} ?no-describes=${!e.describes} delay=${e.delay} .open=${e.open}>
      <ds-button icon-only label="Add item" variant="ghost">
        <ds-icon slot="leading-icon" name="plus"></ds-icon>
      </ds-button>
    </ds-tooltip>
  `},_={args:{content:`Includes archived items`},render:e=>n`
    <ds-tooltip content=${e.content} placement=${e.placement} ?no-describes=${!e.describes} delay=${e.delay} .open=${e.open}>
      <ds-button label="Items" variant="ghost" size="sm"></ds-button>
    </ds-tooltip>
  `},v={args:{content:`Grid view`,delay:`none`},render:e=>n`
    <ds-toolbar label="View">
      <ds-tooltip content="List view" no-describes delay=${e.delay}>
        <ds-button icon-only label="List view" variant="ghost"><ds-icon slot="leading-icon" name="list"></ds-icon></ds-button>
      </ds-tooltip>
      <ds-tooltip content=${e.content} placement=${e.placement} ?no-describes=${!e.describes} delay=${e.delay} .open=${e.open}>
        <ds-button icon-only label="Grid view" variant="ghost"><ds-icon slot="leading-icon" name="grid"></ds-icon></ds-button>
      </ds-tooltip>
    </ds-toolbar>
  `},y={args:{content:`Open in new tab`,placement:`bottom`},render:e=>n`
    <ds-tooltip content=${e.content} placement=${e.placement} ?no-describes=${!e.describes} delay=${e.delay} .open=${e.open}>
      <ds-button icon-only label="Open in new tab" variant="ghost"><ds-icon slot="leading-icon" name="external"></ds-icon></ds-button>
    </ds-tooltip>
  `},b={args:{open:!0},render:e=>n`
    <ds-stack direction="horizontal" gap="normal">
      <ds-button label="Before" variant="secondary"></ds-button>
      <ds-tooltip content=${e.content} placement=${e.placement} ?no-describes=${!e.describes} delay=${e.delay} .open=${e.open}>
        <ds-button label="Items" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-button label="After" variant="secondary"></ds-button>
    </ds-stack>
  `},x=[`Default`,`PlacementTop`,`PlacementBottom`,`PlacementStart`,`PlacementEnd`,`DelayDefault`,`DelayNone`,`IconOnlyButtonName`,`ColumnHeaderHint`,`WarmToolbar`,`BelowTheTrigger`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top',
    open: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom',
    open: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    open: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    open: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'default'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'none'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Add item',
    describes: false
  },
  render: args => html\`
    <ds-tooltip content=\${args.content} placement=\${args.placement} ?no-describes=\${!args.describes} delay=\${args.delay} .open=\${args.open}>
      <ds-button icon-only label="Add item" variant="ghost">
        <ds-icon slot="leading-icon" name="plus"></ds-icon>
      </ds-button>
    </ds-tooltip>
  \`
}`,...g.parameters?.docs?.source},description:{story:`The tooltip is the control's name, not a second announcement, so it is linked as the label.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Includes archived items'
  },
  render: args => html\`
    <ds-tooltip content=\${args.content} placement=\${args.placement} ?no-describes=\${!args.describes} delay=\${args.delay} .open=\${args.open}>
      <ds-button label="Items" variant="ghost" size="sm"></ds-button>
    </ds-tooltip>
  \`
}`,..._.parameters?.docs?.source},description:{story:`A clarification on a labelled control in dense UI.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Grid view',
    delay: 'none'
  },
  render: args => html\`
    <ds-toolbar label="View">
      <ds-tooltip content="List view" no-describes delay=\${args.delay}>
        <ds-button icon-only label="List view" variant="ghost"><ds-icon slot="leading-icon" name="list"></ds-icon></ds-button>
      </ds-tooltip>
      <ds-tooltip content=\${args.content} placement=\${args.placement} ?no-describes=\${!args.describes} delay=\${args.delay} .open=\${args.open}>
        <ds-button icon-only label="Grid view" variant="ghost"><ds-icon slot="leading-icon" name="grid"></ds-icon></ds-button>
      </ds-tooltip>
    </ds-toolbar>
  \`
}`,...v.parameters?.docs?.source},description:{story:`A toolbar where a sibling tooltip is already open, so the next one shows instantly.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Open in new tab',
    placement: 'bottom'
  },
  render: args => html\`
    <ds-tooltip content=\${args.content} placement=\${args.placement} ?no-describes=\${!args.describes} delay=\${args.delay} .open=\${args.open}>
      <ds-button icon-only label="Open in new tab" variant="ghost"><ds-icon slot="leading-icon" name="external"></ds-icon></ds-button>
    </ds-tooltip>
  \`
}`,...y.parameters?.docs?.source},description:{story:`A trigger at the top of the page, where the bubble reads better underneath.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <ds-stack direction="horizontal" gap="normal">
      <ds-button label="Before" variant="secondary"></ds-button>
      <ds-tooltip content=\${args.content} placement=\${args.placement} ?no-describes=\${!args.describes} delay=\${args.delay} .open=\${args.open}>
        <ds-button label="Items" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-button label="After" variant="secondary"></ds-button>
    </ds-stack>
  \`
}`,...b.parameters?.docs?.source},description:{story:"Renders `open` so the tooltip is present on mount, among three focusable\r\ncontrols, so the keyboard gate can check Escape hides it without moving focus.",...b.parameters?.docs?.description}}}})))()}S();export{y as BelowTheTrigger,_ as ColumnHeaderHint,l as Default,m as DelayDefault,h as DelayNone,g as IconOnlyButtonName,b as Keyboard,d as PlacementBottom,p as PlacementEnd,f as PlacementStart,u as PlacementTop,v as WarmToolbar,x as __namedExportsOrder,c as default};