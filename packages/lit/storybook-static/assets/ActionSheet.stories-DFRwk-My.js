import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{v as a}from"./iframe-Dy0IL05G.js";function o(e){e.currentTarget.open=!1}var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),r(),a(),s=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],c={title:`ActionSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`close`]}},args:{open:!0,heading:`Photo.jpg`,actions:s},render:e=>i`
    <ds-action-sheet
      ?open=${e.open}
      heading=${n(e.heading)}
      .actions=${e.actions}
      ?no-dismiss=${e.dismissible===!1}
      cancel-label=${n(e.cancelLabel)}
      @action=${o}
      @close=${o}
    ></ds-action-sheet>
  `},l={},u={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},d={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},f={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},p={args:{dismissible:!1}},m={args:{open:!1}},h={args:{open:!0,heading:`Photo.jpg`,actions:s}},g=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`DismissibleFalse`,`Closed`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source},description:{story:`Open, with the photo-actions example's args.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:`Contextual actions on an item, with the destructive one last.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`A sheet with no heading, named by copy.defaultLabel for assistive technology.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`An action that is shown but cannot be used here, announced as disabled rather than hidden.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...p.parameters?.docs?.source},description:{story:"No Cancel row, no handle; the scrim does nothing and Escape still reports through `close`.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...m.parameters?.docs?.source},description:{story:"The controlled sheet with `open` false renders nothing.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS
  }
}`,...h.parameters?.docs?.source},description:{story:`Open with four focusable actions and the Cancel row, for the keyboard gate.`,...h.parameters?.docs?.description}}}})))()}_();export{m as Closed,l as Default,p as DismissibleFalse,h as Keyboard,u as PhotoActions,d as UnnamedSheet,f as WithAnUnavailableAction,g as __namedExportsOrder,c as default};