import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-BHsrajXm.js";import{t as i}from"./Button-DJvb7DFH.js";import{t as a}from"./Stack-CZci_zJ9.js";import{t as o}from"./Tooltip-Ci9lbE8E.js";import{u as s}from"./iframe-CV6aZYyO.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),o(),i(),r(),s(),a(),c={title:`Tooltip/Lit`,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`top`,`bottom`,`start`,`end`]},describes:{control:`boolean`},delay:{control:`select`,options:[`default`,`none`]},open:{control:`boolean`}},args:{content:`Includes archived items`,placement:`top`,describes:!0,delay:`default`,open:void 0},render:e=>n`
    <ds-tooltip
      content=${e.content}
      placement=${e.placement}
      ?no-describes=${!e.describes}
      delay=${e.delay}
      .open=${e.open}
    >
      <ds-button label="Items" variant="secondary"></ds-button>
    </ds-tooltip>
  `},l={},u={args:{placement:`top`}},d={args:{placement:`bottom`}},f={args:{placement:`start`}},p={args:{placement:`end`}},m={args:{delay:`default`}},h={args:{delay:`none`}},g={args:{open:!0}},_={args:{content:`Add item`,describes:!1},render:e=>n`
    <ds-tooltip
      content=${e.content}
      placement=${e.placement}
      ?no-describes=${!e.describes}
      delay=${e.delay}
      .open=${e.open}
    >
      <ds-button icon-only label="Add item">
        <ds-icon slot="leading-icon" name="plus"></ds-icon>
      </ds-button>
    </ds-tooltip>
  `},v={args:{content:`Includes archived items`},render:e=>n`
    <table>
      <thead>
        <tr>
          <th scope="col">
            <ds-tooltip
              content=${e.content}
              placement=${e.placement}
              ?no-describes=${!e.describes}
              delay=${e.delay}
              .open=${e.open}
            >
              <ds-button label="Items" variant="secondary"></ds-button>
            </ds-tooltip>
          </th>
        </tr>
      </thead>
    </table>
  `},y={args:{content:`Grid view`,delay:`none`},render:e=>n`
    <ds-toolbar label="View">
      <ds-tooltip
        content=${e.content}
        placement=${e.placement}
        ?no-describes=${!e.describes}
        delay=${e.delay}
        .open=${e.open}
      >
        <ds-button icon-only label="Grid view">
          <ds-icon slot="leading-icon" name="grid"></ds-icon>
        </ds-button>
      </ds-tooltip>
    </ds-toolbar>
  `},b={args:{content:`Open in new tab`,placement:`bottom`},render:e=>n`
    <header>
      <ds-tooltip
        content=${e.content}
        placement=${e.placement}
        ?no-describes=${!e.describes}
        delay=${e.delay}
        .open=${e.open}
      >
        <ds-button icon-only label="Open in new tab">
          <ds-icon slot="leading-icon" name="external"></ds-icon>
        </ds-button>
      </ds-tooltip>
    </header>
  `},x={args:{content:`Bold`,open:!0},render:e=>n`
    <ds-stack direction="horizontal" gap="normal">
      <ds-tooltip
        content=${e.content}
        placement=${e.placement}
        ?no-describes=${!e.describes}
        delay=${e.delay}
        .open=${e.open}
      >
        <ds-button label="Bold" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-tooltip content="Italic">
        <ds-button label="Italic" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-tooltip content="Underline">
        <ds-button label="Underline" variant="secondary"></ds-button>
      </ds-tooltip>
    </ds-stack>
  `},S=[`Default`,`PlacementTop`,`PlacementBottom`,`PlacementStart`,`PlacementEnd`,`DelayDefault`,`DelayNone`,`Open`,`IconOnlyButtonName`,`ColumnHeaderHint`,`WarmToolbar`,`BelowTheTrigger`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end'
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
    open: true
  }
}`,...g.parameters?.docs?.source},description:{story:`Controlled visibility, for stories and tests only; Escape still hides it.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Add item',
    describes: false
  },
  render: args => html\`
    <ds-tooltip
      content=\${args.content}
      placement=\${args.placement}
      ?no-describes=\${!args.describes}
      delay=\${args.delay}
      .open=\${args.open}
    >
      <ds-button icon-only label="Add item">
        <ds-icon slot="leading-icon" name="plus"></ds-icon>
      </ds-button>
    </ds-tooltip>
  \`
}`,..._.parameters?.docs?.source},description:{story:`The tooltip is the control's name, not a second announcement, so it is linked as the label.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Includes archived items'
  },
  render: args => html\`
    <table>
      <thead>
        <tr>
          <th scope="col">
            <ds-tooltip
              content=\${args.content}
              placement=\${args.placement}
              ?no-describes=\${!args.describes}
              delay=\${args.delay}
              .open=\${args.open}
            >
              <ds-button label="Items" variant="secondary"></ds-button>
            </ds-tooltip>
          </th>
        </tr>
      </thead>
    </table>
  \`
}`,...v.parameters?.docs?.source},description:{story:`A clarification on a labelled control in dense UI.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Grid view',
    delay: 'none'
  },
  render: args => html\`
    <ds-toolbar label="View">
      <ds-tooltip
        content=\${args.content}
        placement=\${args.placement}
        ?no-describes=\${!args.describes}
        delay=\${args.delay}
        .open=\${args.open}
      >
        <ds-button icon-only label="Grid view">
          <ds-icon slot="leading-icon" name="grid"></ds-icon>
        </ds-button>
      </ds-tooltip>
    </ds-toolbar>
  \`
}`,...y.parameters?.docs?.source},description:{story:`A toolbar where a sibling tooltip is already open, so the next one shows instantly.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Open in new tab',
    placement: 'bottom'
  },
  render: args => html\`
    <header>
      <ds-tooltip
        content=\${args.content}
        placement=\${args.placement}
        ?no-describes=\${!args.describes}
        delay=\${args.delay}
        .open=\${args.open}
      >
        <ds-button icon-only label="Open in new tab">
          <ds-icon slot="leading-icon" name="external"></ds-icon>
        </ds-button>
      </ds-tooltip>
    </header>
  \`
}`,...b.parameters?.docs?.source},description:{story:`A trigger at the top of the page, where the bubble reads better underneath.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Bold',
    open: true
  },
  render: args => html\`
    <ds-stack direction="horizontal" gap="normal">
      <ds-tooltip
        content=\${args.content}
        placement=\${args.placement}
        ?no-describes=\${!args.describes}
        delay=\${args.delay}
        .open=\${args.open}
      >
        <ds-button label="Bold" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-tooltip content="Italic">
        <ds-button label="Italic" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-tooltip content="Underline">
        <ds-button label="Underline" variant="secondary"></ds-button>
      </ds-tooltip>
    </ds-stack>
  \`
}`,...x.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable triggers in total, for the keyboard\r
gate (Escape hides it, focus stays).`,...x.parameters?.docs?.description}}}})))()}C();export{b as BelowTheTrigger,v as ColumnHeaderHint,l as Default,m as DelayDefault,h as DelayNone,_ as IconOnlyButtonName,x as Keyboard,g as Open,d as PlacementBottom,p as PlacementEnd,f as PlacementStart,u as PlacementTop,y as WarmToolbar,S as __namedExportsOrder,c as default};