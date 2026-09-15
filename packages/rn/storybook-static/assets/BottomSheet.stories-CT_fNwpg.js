import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{r as a,t as o}from"./Text-DmAQvf2u.js";import{l as s}from"./iframe-DN6Wi5u4.js";import{n as c,t as l}from"./Button-DLGJ8fI_.js";import{n as u,t as d}from"./Stack-Cq5Eu48m.js";import{n as f,t as p}from"./Input-C100LZZX.js";import{n as m,r as h}from"./Link-Dr3ycX19.js";import{n as g,t as _}from"./BottomSheet-DgzEa4VF.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{v=t(n(),1),g(),c(),f(),h(),u(),a(),i(),y=s(),b={title:`BottomSheet/React Native`,component:_,decorators:[r()],args:{open:!0,heading:`Filters`,children:(0,y.jsx)(o,{children:`Narrow results by price, distance and rating.`}),footer:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(l,{label:`Apply`,variant:`primary`}),(0,y.jsx)(l,{label:`Reset`,variant:`secondary`})]}),height:`content`,dismissible:!0,dragToDismiss:!0}},x={},S={args:{height:`content`}},C={args:{height:`half`}},w={args:{height:`full`}},T={args:{heading:`Share to`,hideHeading:!0,children:(0,y.jsxs)(d,{direction:`horizontal`,gap:`loose`,justify:`center`,children:[(0,y.jsx)(o,{children:`Messages`}),(0,y.jsx)(o,{children:`Mail`}),(0,y.jsx)(o,{children:`Copy link`})]})}},E={args:{footer:void 0}},D={args:{dismissible:!1,footer:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(l,{label:`Delete account`,variant:`danger`}),(0,y.jsx)(l,{label:`Keep account`,variant:`secondary`})]})}},O={args:{dragToDismiss:!1}},k={args:{overrides:{radius:`radius.full`,scrim:`color.overlay.scrim`}}},A={render:e=>{function t(){let[t,n]=v.useState(!0);return(0,y.jsxs)(d,{gap:`loose`,align:`start`,children:[(0,y.jsx)(l,{label:`Open filters`,onPress:()=>n(!0)}),(0,y.jsx)(_,{...e,open:t,onClose:()=>n(!1),footer:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(l,{label:`Apply`,variant:`primary`,onPress:()=>n(!1)}),(0,y.jsx)(l,{label:`Reset`,variant:`secondary`,onPress:()=>n(!1)})]}),children:(0,y.jsxs)(d,{gap:`loose`,children:[(0,y.jsx)(p,{label:`Minimum price`,name:`min-price`}),(0,y.jsx)(p,{label:`Maximum price`,name:`max-price`}),(0,y.jsx)(m,{href:`#`,label:`Clear all filters`})]})})]})}return(0,y.jsx)(t,{})}},j=[`Default`,`HeightContent`,`HeightHalf`,`HeightFull`,`HideHeading`,`NoFooter`,`NotDismissible`,`DragToDismissFalse`,`WithOverrides`,`Keyboard`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'half'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'full'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Share to',
    hideHeading: true,
    children: <Stack direction="horizontal" gap="loose" justify="center">\r
        <Text>Messages</Text>\r
        <Text>Mail</Text>\r
        <Text>Copy link</Text>\r
      </Stack>
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    footer: undefined
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false,
    footer: <>\r
        <Button label="Delete account" variant="danger" />\r
        <Button label="Keep account" variant="secondary" />\r
      </>
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    dragToDismiss: false
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      scrim: 'color.overlay.scrim'
    }
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Open filters" onPress={() => setOpen(true)} />\r
          <BottomSheet {...args} open={open} onClose={() => setOpen(false)} footer={<>\r
                <Button label="Apply" variant="primary" onPress={() => setOpen(false)} />\r
                <Button label="Reset" variant="secondary" onPress={() => setOpen(false)} />\r
              </>}>\r
            <Stack gap="loose">\r
              <Input label="Minimum price" name="min-price" />\r
              <Input label="Maximum price" name="max-price" />\r
              <Link href="#" label="Clear all filters" />\r
            </Stack>\r
          </BottomSheet>\r
        </Stack>;
    }
    return <Open />;
  }
}`,...A.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...A.parameters?.docs?.description}}}})))()}M();export{x as Default,O as DragToDismissFalse,S as HeightContent,w as HeightFull,C as HeightHalf,T as HideHeading,A as Keyboard,E as NoFooter,D as NotDismissible,k as WithOverrides,j as __namedExportsOrder,b as default};