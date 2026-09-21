import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DJvb7DFH.js";import{v as o}from"./iframe-CV6aZYyO.js";function s(e){e.currentTarget.open=!1}function c(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}function l(e){return i`
    <ds-button label="More actions" variant="secondary" @press=${c}></ds-button>
    <ds-action-sheet
      ?open=${e.open}
      heading=${n(e.heading)}
      .actions=${e.actions}
      ?no-dismiss=${e.dismissible===!1}
      cancel-label=${n(e.cancelLabel)}
      @action=${s}
      @close=${s}
    ></ds-action-sheet>
  `}var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),r(),o(),a(),u={title:`ActionSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`close`]}},args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],dismissible:!0},render:l},d={},f={args:{open:!1}},p={args:{dismissible:!1}},m={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},h={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},g={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},_={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},v=[`Default`,`Closed`,`DismissibleFalse`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Open with its trigger and four enabled actions plus the Cancel row, so the keyboard gate can check\r
arrow wrapping, Home/End, Enter/Space and Escape. Choosing or dismissing closes it; the trigger reopens.`,..._.parameters?.docs?.description}}}})))()}y();export{f as Closed,d as Default,p as DismissibleFalse,_ as Keyboard,m as PhotoActions,h as UnnamedSheet,g as WithAnUnavailableAction,v as __namedExportsOrder,u as default};