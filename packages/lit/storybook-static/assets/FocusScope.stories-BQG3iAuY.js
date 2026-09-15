import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./FocusScope-AtfqVa8B.js";var i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),r(),i={title:`FocusScope/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`escape-attempt`]}},argTypes:{trapped:{control:`boolean`},autoFocus:{control:`select`,options:[`first`,`last`,`container`,`none`]},restoreFocus:{control:`boolean`},active:{control:`boolean`}},args:{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0},render:e=>n`
    <ds-focus-scope
      ?trapped=${e.trapped}
      auto-focus=${e.autoFocus}
      ?restore-focus=${e.restoreFocus}
      ?active=${e.active}
    >
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </ds-focus-scope>
  `},a={},o={args:{autoFocus:`first`}},s={args:{autoFocus:`last`}},c={args:{autoFocus:`container`}},l={args:{autoFocus:`none`}},u={args:{trapped:!1}},d={args:{active:!1}},f={args:{trapped:!0,autoFocus:`first`},render:e=>n`
    <ds-focus-scope ?trapped=${e.trapped} auto-focus=${e.autoFocus}>
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </ds-focus-scope>
  `},p=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`TrappedFalse`,`ActiveFalse`,`Keyboard`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'first'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'last'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'container'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'none'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: false
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: true,
    autoFocus: 'first'
  },
  render: args => html\`
    <ds-focus-scope ?trapped=\${args.trapped} auto-focus=\${args.autoFocus}>
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </ds-focus-scope>
  \`
}`,...f.parameters?.docs?.source},description:{story:`Renders trapped, present, with three focusable children so the keyboard\r
gate can verify Tab wraps last → first and Shift+Tab wraps first → last.`,...f.parameters?.docs?.description}}}})))()}m();export{d as ActiveFalse,c as AutoFocusContainer,o as AutoFocusFirst,s as AutoFocusLast,l as AutoFocusNone,a as Default,f as Keyboard,u as TrappedFalse,p as __namedExportsOrder,i as default};