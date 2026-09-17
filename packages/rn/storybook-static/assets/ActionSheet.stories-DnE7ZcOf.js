import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-Dl4455ZU.js";import{l as a}from"./iframe-CAToN8Eb.js";import{n as o,t as s}from"./Button-B0Tk0pjd.js";import{n as c,t as l}from"./Stack-l7fs4Elr.js";import{n as u,t as d}from"./ActionSheet-BqSruQyK.js";function f(e){let[t,n]=p.useState(e.open);return p.useEffect(()=>n(e.open),[e.open]),(0,m.jsxs)(l,{gap:`loose`,align:`start`,children:[(0,m.jsx)(s,{label:`More actions`,onPress:()=>n(!0)}),(0,m.jsx)(d,{...e,open:t,onAction:t=>{e.onAction?.(t),n(!1)},onClose:t=>{e.onClose?.(t),n(!1)}})]})}var p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{p=t(n(),1),u(),o(),c(),i(),m=a(),h=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],g={title:`ActionSheet/React Native`,component:d,decorators:[r()],render:e=>(0,m.jsx)(f,{...e}),args:{open:!0,heading:`Photo.jpg`,actions:h}},_={},v={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},y={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},b={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},x={args:{open:!1}},S={args:{dismissible:!1}},C={args:{overrides:{radius:`radius.md`,itemPaddingBlock:`space.md`,headerGap:`layout.gap.normal`}}},w={},T=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`Closed`,`NotDismissible`,`WithOverrides`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [{
      id: 'share',
      label: 'Share',
      icon: 'external'
    }, {
      id: 'rename',
      label: 'Rename'
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }, {
      id: 'delete',
      label: 'Delete photo',
      icon: 'danger',
      tone: 'danger'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: undefined,
    actions: [{
      id: 'copy',
      label: 'Copy link'
    }, {
      id: 'open',
      label: 'Open in new tab'
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invoice 4821',
    cancelLabel: 'Not now',
    actions: [{
      id: 'download',
      label: 'Download'
    }, {
      id: 'void',
      label: 'Void invoice',
      tone: 'danger',
      disabled: true
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.md',
      itemPaddingBlock: 'space.md',
      headerGap: 'layout.gap.normal'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source},description:{story:`Open with its trigger, four rows and the Cancel row, for the axe gate and manual keyboard checks.`,...w.parameters?.docs?.description}}}})))()}E();export{x as Closed,_ as Default,w as Keyboard,S as NotDismissible,v as PhotoActions,y as UnnamedSheet,b as WithAnUnavailableAction,C as WithOverrides,T as __namedExportsOrder,g as default};