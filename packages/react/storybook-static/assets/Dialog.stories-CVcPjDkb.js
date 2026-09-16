import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-Bb3rYm-L.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-QLx-usSq.js";import{n as a,t as o}from"./Text--Q5VwBjk.js";import{n as s,t as c}from"./Input-BPGaGDYy.js";import{n as l,t as u}from"./Stack-CMc9Wob4.js";import{n as d,t as f}from"./Dialog-BYNI-7G6.js";function p({children:e,footer:t,onClose:n,...r}){let[a,o]=(0,m.useState)(r.open??!1);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Rename project`,onClick:()=>o(!0)}),(0,h.jsx)(f,{heading:`Rename project`,...r,open:a,onClose:e=>{n?.(e),o(!1)},footer:t===void 0?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Rename`,variant:`primary`,size:`sm`,onClick:()=>o(!1)}),(0,h.jsx)(i,{label:`Cancel`,variant:`secondary`,size:`sm`,onClick:()=>o(!1)})]}):t||void 0,children:e})]})}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{m=t(),d(),r(),s(),l(),a(),h=n(),g={title:`Dialog/React`,component:f,args:{open:!1,heading:`Rename project`,description:`Choose a new name. Existing links keep working.`,children:(0,h.jsx)(u,{gap:`normal`,children:(0,h.jsx)(c,{label:`Project name`,name:`projectName`,defaultValue:`Q3 roadmap`})}),hideHeading:!1,size:`md`,dismissible:!0,initialFocus:`first`},render:e=>(0,h.jsx)(p,{...e}),tags:[`autodocs`]},_={},v={args:{size:`sm`}},y={args:{size:`md`}},b={args:{size:`lg`}},x={args:{initialFocus:`first`}},S={args:{initialFocus:`title`}},C={args:{initialFocus:`close`}},w={args:{dismissible:!1,description:`This account and all of its projects will be permanently deleted.`,footer:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Delete account`,variant:`danger`,size:`sm`}),(0,h.jsx)(i,{label:`Keep account`,variant:`secondary`,size:`sm`})]})}},T={args:{footer:null,children:(0,h.jsx)(o,{children:`Use the close button or Escape to dismiss this dialog.`})}},E={args:{hideHeading:!0,description:void 0}},D={args:{open:!0},render:e=>(0,h.jsx)(p,{...e,children:(0,h.jsxs)(u,{gap:`normal`,children:[(0,h.jsx)(c,{label:`Project name`,name:`projectName`,defaultValue:`Q3 roadmap`}),(0,h.jsx)(c,{label:`Slug`,name:`slug`,defaultValue:`q3-roadmap`})]})})},O=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`NotDismissible`,`WithoutFooter`,`HideHeading`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false,
    description: 'This account and all of its projects will be permanently deleted.',
    footer: <>\r
        <Button label="Delete account" variant="danger" size="sm" />\r
        <Button label="Keep account" variant="secondary" size="sm" />\r
      </>
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    footer: null,
    children: <Text>Use the close button or Escape to dismiss this dialog.</Text>
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true,
    description: undefined
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => <DialogHarness {...args}>\r
      <Stack gap="normal">\r
        <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />\r
        <Input label="Slug" name="slug" defaultValue="q3-roadmap" />\r
      </Stack>\r
    </DialogHarness>
}`,...D.parameters?.docs?.source},description:{story:`Open/present with its trigger and at least three focusable body children, for the keyboard gate.`,...D.parameters?.docs?.description}}}})))()}k();export{_ as Default,E as HideHeading,C as InitialFocusClose,x as InitialFocusFirst,S as InitialFocusTitle,D as Keyboard,w as NotDismissible,b as SizeLg,y as SizeMd,v as SizeSm,T as WithoutFooter,O as __namedExportsOrder,g as default};