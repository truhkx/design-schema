import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{h as r,m as i,n as a,o,r as s,t as c}from"./decorators-Dl4455ZU.js";import{l}from"./iframe-CAToN8Eb.js";import{n as u,t as d}from"./Button-B0Tk0pjd.js";import{n as f,t as p}from"./Stack-l7fs4Elr.js";import{n as m,t as h}from"./FocusScope-DoyDPQFh.js";function g({onClose:e}){return(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(s,{children:`Confirm your changes`}),(0,y.jsx)(d,{label:`Cancel`,onPress:e}),(0,y.jsx)(d,{label:`Continue`,onPress:e})]})}function _({children:e,...t}){let[n,r]=v.useState(!0),a=v.useRef(null),o=()=>r(!1);return(0,y.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,y.jsx)(i,{ref:a,collapsable:!1,children:(0,y.jsx)(d,{label:`Open panel`,onPress:()=>r(!0)})}),n?(0,y.jsx)(h,{returnFocusTo:a,...t,children:typeof e==`string`?(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(s,{children:e}),(0,y.jsx)(d,{label:`Cancel`,onPress:o}),(0,y.jsx)(d,{label:`Continue`,onPress:o})]}):(0,y.jsx)(g,{onClose:o})}):null]})}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{v=t(n(),1),r(),u(),m(),f(),o(),c(),y=l(),b={title:`FocusScope/React Native`,component:h,decorators:[a()],args:{children:(0,y.jsx)(g,{}),trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0},render:e=>(0,y.jsx)(_,{...e})},x={},S={args:{autoFocus:`first`}},C={args:{autoFocus:`last`}},w={args:{autoFocus:`container`}},T={args:{autoFocus:`none`}},E={args:{trapped:!1}},D={args:{restoreFocus:!1}},O={args:{active:!1}},k={args:{children:`A full-screen onboarding overlay with its own close Button`,trapped:!0,autoFocus:`first`}},A={args:{children:`A slide-in filter drawer`,trapped:!1,autoFocus:`first`}},j={args:{children:`A long terms-of-service body with Accept and Decline Buttons`,autoFocus:`container`}},M={args:{children:`A dialog body with a Menu open inside it`,active:!1}},N={render:()=>{function e(){let[e,t]=v.useState(!0),n=v.useRef(null);return(0,y.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,y.jsx)(i,{ref:n,collapsable:!1,children:(0,y.jsx)(d,{label:`Open panel`,onPress:()=>t(!0)})}),e?(0,y.jsx)(h,{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0,returnFocusTo:n,children:(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(d,{label:`First action`}),(0,y.jsx)(d,{label:`Second action`}),(0,y.jsx)(d,{label:`Close`,onPress:()=>t(!1)})]})}):null]})}return(0,y.jsx)(e,{})}},P=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`NotTrapped`,`NoRestoreFocus`,`Inactive`,`ModalTakeover`,`NonModalDrawer`,`ReadingFirst`,`PausedOuterScope`,`Keyboard`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'first'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'last'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'container'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    autoFocus: 'none'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    trapped: false
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    restoreFocus: false
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      const triggerRef = React.useRef<ViewInstance>(null);
      return <Stack gap="loose" align="start">\r
          <View ref={triggerRef} collapsable={false}>\r
            <Button label="Open panel" onPress={() => setOpen(true)} />\r
          </View>\r
          {open ? <FocusScope trapped autoFocus="first" restoreFocus active returnFocusTo={triggerRef}>\r
              <Stack gap="normal" align="start">\r
                <Button label="First action" />\r
                <Button label="Second action" />\r
                <Button label="Close" onPress={() => setOpen(false)} />\r
              </Stack>\r
            </FocusScope> : null}\r
        </Stack>;
    }
    return <Open />;
  }
}`,...N.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the axe gate and manual keyboard checks.`,...N.parameters?.docs?.description}}}})))()}F();export{w as AutoFocusContainer,S as AutoFocusFirst,C as AutoFocusLast,T as AutoFocusNone,x as Default,O as Inactive,N as Keyboard,k as ModalTakeover,D as NoRestoreFocus,A as NonModalDrawer,E as NotTrapped,M as PausedOuterScope,j as ReadingFirst,P as __namedExportsOrder,b as default};