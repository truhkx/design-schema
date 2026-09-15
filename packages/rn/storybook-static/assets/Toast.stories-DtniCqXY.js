import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{l as a}from"./iframe-DN6Wi5u4.js";import{n as o,t as s}from"./Button-DLGJ8fI_.js";import{n as c,t as l}from"./Stack-Cq5Eu48m.js";import{r as u,t as d}from"./Toast-CLTCJ686.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{f=t(n(),1),o(),c(),u(),i(),p=a(),m={title:`Toast/React Native`,component:d,decorators:[r({fit:!0})],args:{message:`Message sent`,tone:`neutral`,duration:`short`,dismissible:!0}},h={},g={args:{tone:`neutral`,message:`Link copied`}},_={args:{tone:`success`,message:`Changes saved`}},v={args:{tone:`warning`,message:`Connection unstable`}},y={args:{tone:`danger`,message:`Upload failed`,duration:`persistent`}},b={args:{duration:`short`}},x={args:{duration:`long`}},S={args:{duration:`persistent`,message:`3 files deleted`,actionLabel:`Undo`}},C={args:{message:`3 files moved to Archive`,actionLabel:`Undo`,duration:`persistent`}},w={args:{dismissible:!1}},T={args:{overrides:{radius:`radius.full`,maxWidth:`layout.maxWidth.content`}}},E={render:e=>{function t(){let[t,n]=f.useState(!0);return(0,p.jsxs)(l,{gap:`loose`,align:`start`,children:[(0,p.jsx)(s,{label:`Show toasts`,onPress:()=>n(!0)}),t?(0,p.jsxs)(l,{gap:`tight`,align:`start`,children:[(0,p.jsx)(d,{...e,message:`3 files deleted`,actionLabel:`Undo`,duration:`persistent`,onDismiss:()=>n(!1)}),(0,p.jsx)(d,{...e,message:`Export ready`,tone:`success`,actionLabel:`View`,duration:`persistent`})]}):null]})}return(0,p.jsx)(t,{})}},D=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`DurationShort`,`DurationLong`,`DurationPersistent`,`WithAction`,`NotDismissible`,`WithOverrides`,`Keyboard`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral',
    message: 'Link copied'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    message: 'Changes saved'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    message: 'Connection unstable'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    message: 'Upload failed',
    duration: 'persistent'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'short'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'long'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'persistent',
    message: '3 files deleted',
    actionLabel: 'Undo'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    message: '3 files moved to Archive',
    actionLabel: 'Undo',
    duration: 'persistent'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      maxWidth: 'layout.maxWidth.content'
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Demo(): React.JSX.Element {
      const [visible, setVisible] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Show toasts" onPress={() => setVisible(true)} />\r
          {visible ? <Stack gap="tight" align="start">\r
              <Toast {...args} message="3 files deleted" actionLabel="Undo" duration="persistent" onDismiss={() => setVisible(false)} />\r
              <Toast {...args} message="Export ready" tone="success" actionLabel="View" duration="persistent" />\r
            </Stack> : null}\r
        </Stack>;
    }
    return <Demo />;
  }
}`,...E.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...E.parameters?.docs?.description}}}})))()}O();export{h as Default,x as DurationLong,S as DurationPersistent,b as DurationShort,E as Keyboard,w as NotDismissible,y as ToneDanger,g as ToneNeutral,_ as ToneSuccess,v as ToneWarning,C as WithAction,T as WithOverrides,D as __namedExportsOrder,m as default};