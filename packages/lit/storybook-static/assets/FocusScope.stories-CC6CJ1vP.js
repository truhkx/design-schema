import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-BrJPDVza.js";import{t as i}from"./Button-CG4k9eqY.js";import{t as a}from"./FocusScope-BRL2IrR1.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),i(),a(),r(),o=(e,t)=>n`
  <ds-focus-scope
    .trapped=${e.trapped}
    .autoFocus=${e.autoFocus}
    .restoreFocus=${e.restoreFocus}
    .active=${e.active}
  >
    ${t}
  </ds-focus-scope>
`,s={title:`FocusScope/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`escape-attempt`]}},argTypes:{trapped:{control:`boolean`},autoFocus:{control:`select`,options:[`first`,`last`,`container`,`none`]},restoreFocus:{control:`boolean`},active:{control:`boolean`}},args:{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0},render:e=>o(e,n`
        <ds-text>Confirm your changes</ds-text>
        <ds-button label="Cancel"></ds-button>
        <ds-button label="Continue"></ds-button>
      `)},c={},l={args:{autoFocus:`first`}},u={args:{autoFocus:`last`}},d={args:{autoFocus:`container`}},f={args:{autoFocus:`none`}},p={args:{trapped:!1}},m={args:{restoreFocus:!1}},h={args:{active:!1}},g={args:{trapped:!0,autoFocus:`first`},render:e=>o(e,n`
        <ds-button label="First"></ds-button>
        <ds-button label="Second"></ds-button>
        <ds-button label="Third"></ds-button>
      `)},_={args:{children:`A full-screen onboarding overlay with its own close Button`,trapped:!0,autoFocus:`first`},render:e=>o(e,n`<ds-text>${e.children}</ds-text><ds-button label="Close"></ds-button>`)},v={args:{children:`A slide-in filter drawer`,trapped:!1,autoFocus:`first`},render:e=>o(e,n`<ds-text>${e.children}</ds-text><ds-button label="Apply filters"></ds-button>`)},y={args:{children:`A long terms-of-service body with Accept and Decline Buttons`,autoFocus:`container`},render:e=>o(e,n`
        <ds-text>${e.children}</ds-text>
        <ds-button label="Accept" variant="primary"></ds-button>
        <ds-button label="Decline"></ds-button>
      `)},b={args:{children:`A dialog body with a Menu open inside it`,active:!1},render:e=>o(e,n`<ds-text>${e.children}</ds-text><ds-button label="Options"></ds-button>`)},x=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`TrappedFalse`,`RestoreFocusFalse`,`ActiveFalse`,`Keyboard`,`ModalTakeover`,`NonModalDrawer`,`ReadingFirst`,`PausedOuterScope`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'first'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'last'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'container'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'none'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: false
  }
}`,...p.parameters?.docs?.source},description:{story:`A non-modal helper: focus moves in and restores on exit, but Tab is free to leave.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    restoreFocus: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: true,
    autoFocus: 'first'
  },
  render: args => scope(args, html\`
        <ds-button label="First"></ds-button>
        <ds-button label="Second"></ds-button>
        <ds-button label="Third"></ds-button>
      \`)
}`,...g.parameters?.docs?.source},description:{story:`Present with three focusable descendants, for the keyboard gate to verify Tab wrapping both ways.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first'
  },
  render: args => scope(args, html\`<ds-text>\${args.children}</ds-text><ds-button label="Close"></ds-button>\`)
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first'
  },
  render: args => scope(args, html\`<ds-text>\${args.children}</ds-text><ds-button label="Apply filters"></ds-button>\`)
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container'
  },
  render: args => scope(args, html\`
        <ds-text>\${args.children}</ds-text>
        <ds-button label="Accept" variant="primary"></ds-button>
        <ds-button label="Decline"></ds-button>
      \`)
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false
  },
  render: args => scope(args, html\`<ds-text>\${args.children}</ds-text><ds-button label="Options"></ds-button>\`)
}`,...b.parameters?.docs?.source}}}})))()}S();export{h as ActiveFalse,d as AutoFocusContainer,l as AutoFocusFirst,u as AutoFocusLast,f as AutoFocusNone,c as Default,g as Keyboard,_ as ModalTakeover,v as NonModalDrawer,b as PausedOuterScope,y as ReadingFirst,m as RestoreFocusFalse,p as TrappedFalse,x as __namedExportsOrder,s as default};