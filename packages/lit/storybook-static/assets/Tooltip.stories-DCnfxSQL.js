import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Icon-CGupucWg.js";import{t as i}from"./Button-TSn-G4Vm.js";import{t as a}from"./Tooltip-CUhaJeAJ.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),a(),i(),r(),o={title:`Tooltip/Lit`,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`top`,`bottom`,`start`,`end`]},describes:{control:`boolean`},delay:{control:`select`,options:[`default`,`none`]}},args:{content:`Includes archived items`,placement:`top`,describes:!0,delay:`default`},render:e=>n`
    <ds-tooltip
      content=${e.content}
      placement=${e.placement}
      ?describes=${e.describes}
      delay=${e.delay}
    >
      <ds-button label="Show all" variant="secondary"></ds-button>
    </ds-tooltip>
  `},s={},c={args:{placement:`top`}},l={args:{placement:`bottom`}},u={args:{placement:`start`}},d={args:{placement:`end`}},f={args:{delay:`default`}},p={args:{delay:`none`}},m={args:{describes:!0}},h={args:{describes:!1,content:`Search`},render:e=>n`
    <ds-tooltip content=${e.content} placement=${e.placement} ?describes=${e.describes} delay=${e.delay}>
      <ds-button icon-only label="Search" variant="ghost">
        <ds-icon slot="leading-icon" name="search"></ds-icon>
      </ds-button>
    </ds-tooltip>
  `},g={render:()=>n`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-tooltip content="Includes archived items" open>
        <ds-button label="Show all"></ds-button>
      </ds-tooltip>
      <button type="button">After</button>
    </div>
  `},_=[`Default`,`PlacementTop`,`PlacementBottom`,`PlacementStart`,`PlacementEnd`,`DelayDefault`,`DelayNone`,`DescribesTrue`,`DescribesFalse`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'default'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    describes: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    describes: false,
    content: 'Search'
  },
  render: args => html\`
    <ds-tooltip content=\${args.content} placement=\${args.placement} ?describes=\${args.describes} delay=\${args.delay}>
      <ds-button icon-only label="Search" variant="ghost">
        <ds-icon slot="leading-icon" name="search"></ds-icon>
      </ds-button>
    </ds-tooltip>
  \`
}`,...h.parameters?.docs?.source},description:{story:"`describes: false` — the child has no visible text, so the tooltip becomes\r\nits accessible name (`aria-labelledby`) instead of a description. `content`\r\nequals the button's own `label` for exactly this reason.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-tooltip content="Includes archived items" open>
        <ds-button label="Show all"></ds-button>
      </ds-tooltip>
      <button type="button">After</button>
    </div>
  \`
}`,...g.parameters?.docs?.source},description:{story:`Renders \`open\` so the tooltip is present on mount, among three focusable\r
siblings so the keyboard gate can verify Escape hides it without moving\r
focus and Tab still reaches every control normally.`,...g.parameters?.docs?.description}}}})))()}v();export{s as Default,f as DelayDefault,p as DelayNone,h as DescribesFalse,m as DescribesTrue,g as Keyboard,l as PlacementBottom,d as PlacementEnd,u as PlacementStart,c as PlacementTop,_ as __namedExportsOrder,o as default};