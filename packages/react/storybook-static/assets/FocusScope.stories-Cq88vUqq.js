import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Button-DEGXCMgU.js";import{n as i,t as a}from"./Text-B8ekB7A6.js";import{n as o,t as s}from"./FocusScope-CPLWiuzU.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{o(),n(),i(),c=t(),l={title:`FocusScope/React`,component:s,tags:[`autodocs`],args:{trapped:!0,children:(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(a,{children:`Confirm your changes`}),(0,c.jsx)(r,{label:`Cancel`}),(0,c.jsx)(r,{label:`Continue`})]})}},u={},d={args:{autoFocus:`first`}},f={args:{autoFocus:`last`}},p={args:{autoFocus:`container`}},m={args:{autoFocus:`none`}},h={args:{trapped:!1}},g={args:{restoreFocus:!1}},_={args:{active:!1}},v={args:{trapped:!0,autoFocus:`first`,children:(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{label:`First`}),(0,c.jsx)(r,{label:`Second`}),(0,c.jsx)(r,{label:`Third`})]})}},y={args:{children:`A full-screen onboarding overlay with its own close Button`,trapped:!0,autoFocus:`first`},render:({children:e,...t})=>(0,c.jsxs)(s,{...t,children:[(0,c.jsx)(a,{children:e}),(0,c.jsx)(r,{label:`Close`})]})},b={args:{children:`A slide-in filter drawer`,trapped:!1,autoFocus:`first`},render:({children:e,...t})=>(0,c.jsxs)(s,{...t,children:[(0,c.jsx)(a,{children:e}),(0,c.jsx)(r,{label:`Apply filters`})]})},x={args:{children:`A long terms-of-service body with Accept and Decline Buttons`,autoFocus:`container`},render:({children:e,...t})=>(0,c.jsxs)(s,{...t,children:[(0,c.jsx)(a,{children:e}),(0,c.jsx)(r,{label:`Accept`,variant:`primary`}),(0,c.jsx)(r,{label:`Decline`})]})},S={args:{children:`A dialog body with a Menu open inside it`,active:!1},render:({children:e,...t})=>(0,c.jsxs)(s,{...t,children:[(0,c.jsx)(a,{children:e}),(0,c.jsx)(r,{label:`Options`})]})},C=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`TrappedFalse`,`RestoreFocusFalse`,`ActiveFalse`,`Keyboard`,`ModalTakeover`,`NonModalDrawer`,`ReadingFirst`,`PausedOuterScope`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'first'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'last'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'container'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'none'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: false
  }
}`,...h.parameters?.docs?.source},description:{story:`A non-modal helper: focus moves in and restores on exit, but Tab is free to leave.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    restoreFocus: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: true,
    autoFocus: 'first',
    children: <>\r
        <Button label="First" />\r
        <Button label="Second" />\r
        <Button label="Third" />\r
      </>
  }
}`,...v.parameters?.docs?.source},description:{story:`Present with three focusable descendants, for the keyboard gate to verify Tab wrapping both ways.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first'
  },
  render: ({
    children,
    ...args
  }) => <FocusScope {...args}>\r
      <Text>{children}</Text>\r
      <Button label="Close" />\r
    </FocusScope>
}`,...y.parameters?.docs?.source},description:{story:"The examples' `children` are descriptions of content; each story passes that description as\r\ntext and renders the controls it names beside it.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first'
  },
  render: ({
    children,
    ...args
  }) => <FocusScope {...args}>\r
      <Text>{children}</Text>\r
      <Button label="Apply filters" />\r
    </FocusScope>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container'
  },
  render: ({
    children,
    ...args
  }) => <FocusScope {...args}>\r
      <Text>{children}</Text>\r
      <Button label="Accept" variant="primary" />\r
      <Button label="Decline" />\r
    </FocusScope>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false
  },
  render: ({
    children,
    ...args
  }) => <FocusScope {...args}>\r
      <Text>{children}</Text>\r
      <Button label="Options" />\r
    </FocusScope>
}`,...S.parameters?.docs?.source}}}})))()}w();export{_ as ActiveFalse,p as AutoFocusContainer,d as AutoFocusFirst,f as AutoFocusLast,m as AutoFocusNone,u as Default,v as Keyboard,y as ModalTakeover,b as NonModalDrawer,S as PausedOuterScope,x as ReadingFirst,g as RestoreFocusFalse,h as TrappedFalse,C as __namedExportsOrder,l as default};