import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{r as a,t as o}from"./Text-DmAQvf2u.js";import{n as s,t as c}from"./Dialog-CjtPZTHS.js";import{l}from"./iframe-DN6Wi5u4.js";import{n as u,t as d}from"./Button-DLGJ8fI_.js";import{n as f,t as p}from"./Stack-Cq5Eu48m.js";import{n as m,t as h}from"./Input-C100LZZX.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{g=t(n(),1),u(),s(),m(),f(),a(),i(),_=l(),v={title:`Dialog/React Native`,component:c,decorators:[r()],args:{open:!0,heading:`Rename project`,description:`This changes the name everywhere it appears.`,children:(0,_.jsx)(o,{children:`The project name is visible to everyone with access.`}),footer:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{label:`Rename`,variant:`primary`}),(0,_.jsx)(d,{label:`Cancel`,variant:`secondary`})]}),size:`md`,dismissible:!0,initialFocus:`first`}},y={},b={args:{size:`sm`}},x={args:{size:`md`}},S={args:{size:`lg`}},C={args:{initialFocus:`first`}},w={args:{initialFocus:`title`}},T={args:{initialFocus:`close`}},E={args:{description:void 0}},D={args:{footer:void 0}},O={args:{hideHeading:!0}},k={args:{dismissible:!1,footer:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{label:`Delete account`,variant:`danger`}),(0,_.jsx)(d,{label:`Keep account`,variant:`secondary`})]})}},A={args:{overrides:{radius:`radius.full`,border:`color.border.strong`}}},j={render:e=>{function t(){let[t,n]=g.useState(!0);return(0,_.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,_.jsx)(d,{label:`Open dialog`,onPress:()=>n(!0)}),(0,_.jsx)(c,{...e,open:t,onClose:()=>n(!1),footer:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{label:`Rename`,variant:`primary`}),(0,_.jsx)(d,{label:`Cancel`,variant:`secondary`,onPress:()=>n(!1)})]}),children:(0,_.jsxs)(p,{gap:`loose`,children:[(0,_.jsx)(h,{label:`Project name`,name:`name`,defaultValue:`Marketing site`}),(0,_.jsx)(h,{label:`Description`,name:`description`})]})})]})}return(0,_.jsx)(t,{})}},M=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`NoDescription`,`NoFooter`,`HideHeading`,`NotDismissible`,`WithOverrides`,`Keyboard`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    description: undefined
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    footer: undefined
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false,
    footer: <>\r
        <Button label="Delete account" variant="danger" />\r
        <Button label="Keep account" variant="secondary" />\r
      </>
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      border: 'color.border.strong'
    }
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Open dialog" onPress={() => setOpen(true)} />\r
          <Dialog {...args} open={open} onClose={() => setOpen(false)} footer={<>\r
                <Button label="Rename" variant="primary" />\r
                <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} />\r
              </>}>\r
            <Stack gap="loose">\r
              <Input label="Project name" name="name" defaultValue="Marketing site" />\r
              <Input label="Description" name="description" />\r
            </Stack>\r
          </Dialog>\r
        </Stack>;
    }
    return <Open />;
  }
}`,...j.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...j.parameters?.docs?.description}}}})))()}N();export{y as Default,O as HideHeading,T as InitialFocusClose,C as InitialFocusFirst,w as InitialFocusTitle,j as Keyboard,E as NoDescription,D as NoFooter,k as NotDismissible,S as SizeLg,x as SizeMd,b as SizeSm,A as WithOverrides,M as __namedExportsOrder,v as default};