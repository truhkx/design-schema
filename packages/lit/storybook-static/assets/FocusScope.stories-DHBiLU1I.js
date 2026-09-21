import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-BrJPDVza.js";import{t as i}from"./Button-DJvb7DFH.js";import{n as a}from"./FocusScope-BSAjTz8A.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),r(),o={title:`FocusScope/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`escape-attempt`]}},argTypes:{trapped:{control:`boolean`},autoFocus:{control:`select`,options:[`first`,`last`,`container`,`none`]},restoreFocus:{control:`boolean`},active:{control:`boolean`}},args:{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-text>Confirm your changes</ds-text>
      <ds-button label="Cancel"></ds-button>
      <ds-button label="Continue"></ds-button>
    </ds-focus-scope>
  `},s={},c={args:{autoFocus:`first`}},l={args:{autoFocus:`last`}},u={args:{autoFocus:`container`}},d={args:{autoFocus:`none`}},f={args:{trapped:!1}},p={args:{restoreFocus:!1}},m={args:{active:!1}},h={args:{trapped:!0,autoFocus:`first`},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-button label="First"></ds-button>
      <ds-button label="Second"></ds-button>
      <ds-button label="Third"></ds-button>
    </ds-focus-scope>
  `},g={args:{children:`A full-screen onboarding overlay with its own close Button`,trapped:!0,autoFocus:`first`},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-text>${e.children}</ds-text>
      <ds-button label="Close"></ds-button>
    </ds-focus-scope>
  `},_={args:{children:`A slide-in filter drawer`,trapped:!1,autoFocus:`first`},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-text>${e.children}</ds-text>
      <ds-button label="Apply filters"></ds-button>
    </ds-focus-scope>
  `},v={args:{children:`A long terms-of-service body with Accept and Decline Buttons`,autoFocus:`container`},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-text>${e.children}</ds-text>
      <ds-button label="Accept" variant="primary"></ds-button>
      <ds-button label="Decline"></ds-button>
    </ds-focus-scope>
  `},y={args:{children:`A dialog body with a Menu open inside it`,active:!1},render:e=>n`
    <ds-focus-scope
      ?no-trapped=${!e.trapped}
      auto-focus=${e.autoFocus}
      ?no-restore-focus=${!e.restoreFocus}
      ?no-active=${!e.active}
    >
      <ds-text>${e.children}</ds-text>
      <ds-button label="Options"></ds-button>
    </ds-focus-scope>
  `},b=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`TrappedFalse`,`RestoreFocusFalse`,`ActiveFalse`,`Keyboard`,`ModalTakeover`,`NonModalDrawer`,`ReadingFirst`,`PausedOuterScope`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'first'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'last'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'container'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'none'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: false
  }
}`,...f.parameters?.docs?.source},description:{story:`A non-modal helper: focus moves in and restores on exit, but Tab is free to leave.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    restoreFocus: false
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: true,
    autoFocus: 'first'
  },
  render: args => html\`
    <ds-focus-scope
      ?no-trapped=\${!args.trapped}
      auto-focus=\${args.autoFocus}
      ?no-restore-focus=\${!args.restoreFocus}
      ?no-active=\${!args.active}
    >
      <ds-button label="First"></ds-button>
      <ds-button label="Second"></ds-button>
      <ds-button label="Third"></ds-button>
    </ds-focus-scope>
  \`
}`,...h.parameters?.docs?.source},description:{story:`Present with three focusable descendants, for the keyboard gate to verify Tab wrapping both ways.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first'
  },
  render: args => html\`
    <ds-focus-scope
      ?no-trapped=\${!args.trapped}
      auto-focus=\${args.autoFocus}
      ?no-restore-focus=\${!args.restoreFocus}
      ?no-active=\${!args.active}
    >
      <ds-text>\${args.children}</ds-text>
      <ds-button label="Close"></ds-button>
    </ds-focus-scope>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first'
  },
  render: args => html\`
    <ds-focus-scope
      ?no-trapped=\${!args.trapped}
      auto-focus=\${args.autoFocus}
      ?no-restore-focus=\${!args.restoreFocus}
      ?no-active=\${!args.active}
    >
      <ds-text>\${args.children}</ds-text>
      <ds-button label="Apply filters"></ds-button>
    </ds-focus-scope>
  \`
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container'
  },
  render: args => html\`
    <ds-focus-scope
      ?no-trapped=\${!args.trapped}
      auto-focus=\${args.autoFocus}
      ?no-restore-focus=\${!args.restoreFocus}
      ?no-active=\${!args.active}
    >
      <ds-text>\${args.children}</ds-text>
      <ds-button label="Accept" variant="primary"></ds-button>
      <ds-button label="Decline"></ds-button>
    </ds-focus-scope>
  \`
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false
  },
  render: args => html\`
    <ds-focus-scope
      ?no-trapped=\${!args.trapped}
      auto-focus=\${args.autoFocus}
      ?no-restore-focus=\${!args.restoreFocus}
      ?no-active=\${!args.active}
    >
      <ds-text>\${args.children}</ds-text>
      <ds-button label="Options"></ds-button>
    </ds-focus-scope>
  \`
}`,...y.parameters?.docs?.source}}}})))()}x();export{m as ActiveFalse,u as AutoFocusContainer,c as AutoFocusFirst,l as AutoFocusLast,d as AutoFocusNone,s as Default,h as Keyboard,g as ModalTakeover,_ as NonModalDrawer,y as PausedOuterScope,v as ReadingFirst,p as RestoreFocusFalse,f as TrappedFalse,b as __namedExportsOrder,o as default};