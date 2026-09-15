import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{c as r,n as i,s as a,t as o}from"./decorators-By8OYT78.js";import{r as s,t as c}from"./Text-DmAQvf2u.js";import{l}from"./iframe-DN6Wi5u4.js";import{n as u,t as d}from"./Button-DLGJ8fI_.js";import{n as f,t as p}from"./Stack-Cq5Eu48m.js";import{n as m,t as h}from"./FocusScope-DCNUqcKH.js";function g(){let[e,t]=v.useState(!1),n=v.useRef(null);return(0,y.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,y.jsx)(a,{ref:n,collapsable:!1,children:(0,y.jsx)(d,{label:`Open panel`,onPress:()=>t(!0)})}),e?(0,y.jsx)(h,{trapped:!0,autoFocus:`first`,restoreFocus:!0,returnFocusTo:n,children:(0,y.jsx)(a,{children:(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(c,{children:`Panel content`}),(0,y.jsx)(d,{label:`First action`}),(0,y.jsx)(d,{label:`Close`,onPress:()=>t(!1)})]})})}):null]})}function _(e){let[t,n]=v.useState(!1);return(0,y.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,y.jsx)(d,{label:`Open panel`,onPress:()=>n(!0)}),t?(0,y.jsx)(h,{...e,children:(0,y.jsx)(a,{children:(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(c,{children:`Panel content`}),(0,y.jsx)(d,{label:`First action`}),(0,y.jsx)(d,{label:`Second action`}),(0,y.jsx)(d,{label:`Close`,onPress:()=>n(!1)})]})})}):null]})}var v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{v=t(n(),1),r(),u(),m(),f(),s(),o(),y=l(),b={title:`FocusScope/React Native`,component:h,decorators:[i()],args:{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0},render:e=>(0,y.jsx)(_,{...e})},x={},S={args:{autoFocus:`first`}},C={args:{autoFocus:`last`}},w={args:{autoFocus:`container`}},T={args:{autoFocus:`none`}},E={args:{trapped:!1}},D={args:{restoreFocus:!1}},O={args:{active:!1}},k={render:()=>(0,y.jsx)(g,{})},A={render:()=>{function e(){let[e,t]=v.useState(!0);return(0,y.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,y.jsx)(d,{label:`Open panel`,onPress:()=>t(!0)}),e?(0,y.jsx)(h,{trapped:!0,autoFocus:`first`,restoreFocus:!0,active:!0,children:(0,y.jsx)(a,{children:(0,y.jsxs)(p,{gap:`normal`,align:`start`,children:[(0,y.jsx)(d,{label:`First action`}),(0,y.jsx)(d,{label:`Second action`}),(0,y.jsx)(d,{label:`Close`,onPress:()=>t(!1)})]})})}):null]})}return(0,y.jsx)(e,{})}},j=[`Default`,`AutoFocusFirst`,`AutoFocusLast`,`AutoFocusContainer`,`AutoFocusNone`,`NotTrapped`,`NoRestoreFocus`,`Inactive`,`ReturnFocusTo`,`Keyboard`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
  render: () => <ReturnFocusToDemo />
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Open panel" onPress={() => setOpen(true)} />\r
          {open ? <FocusScope trapped autoFocus="first" restoreFocus active>\r
              <View>\r
                <Stack gap="normal" align="start">\r
                  <Button label="First action" />\r
                  <Button label="Second action" />\r
                  <Button label="Close" onPress={() => setOpen(false)} />\r
                </Stack>\r
              </View>\r
            </FocusScope> : null}\r
        </Stack>;
    }
    return <Open />;
  }
}`,...A.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the axe gate and manual keyboard checks.`,...A.parameters?.docs?.description}}}})))()}M();export{w as AutoFocusContainer,S as AutoFocusFirst,C as AutoFocusLast,T as AutoFocusNone,x as Default,O as Inactive,A as Keyboard,D as NoRestoreFocus,E as NotTrapped,k as ReturnFocusTo,j as __namedExportsOrder,b as default};