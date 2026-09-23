import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Icon-eWCe5jE3.js";import{t as o}from"./Button-B3rVveNU.js";import{v as s}from"./iframe-C6sywzE2.js";function c(e){e.currentTarget.open=!1}function l(e){let t=e.currentTarget.nextElementSibling;t instanceof HTMLElement&&t.localName===`ds-action-sheet`&&(t.open=!0)}var u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),r(),s(),o(),a(),u=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],d={title:`ActionSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`close`]}},args:{open:!0,heading:`Photo.jpg`,actions:u},render:e=>i`
    <ds-action-sheet
      ?open=${e.open}
      heading=${n(e.heading)}
      .actions=${e.actions}
      ?no-dismiss=${e.dismissible===!1}
      cancel-label=${n(e.cancelLabel)}
      @action=${c}
      @close=${c}
    ></ds-action-sheet>
  `},f={},p={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},m={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},h={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},g={args:{dismissible:!1}},_={args:{open:!1}},v={args:{open:!0,heading:`Photo.jpg`,actions:u},render:e=>i`
    <ds-button icon-only label="More actions" @press=${l}
      ><ds-icon slot="leading-icon" name="ellipsis"></ds-icon
    ></ds-button>
    <ds-action-sheet
      ?open=${e.open}
      heading=${n(e.heading)}
      .actions=${e.actions}
      ?no-dismiss=${e.dismissible===!1}
      cancel-label=${n(e.cancelLabel)}
      @action=${c}
      @close=${c}
    ></ds-action-sheet>
  `},y=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`DismissibleFalse`,`Closed`,`Keyboard`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Open, with the photo-actions example's args.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Contextual actions on an item, with the destructive one last.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`A sheet with no heading, named by copy.defaultLabel for assistive technology.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`An action that is shown but cannot be used here, announced as disabled rather than hidden.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...g.parameters?.docs?.source},description:{story:"No Cancel row, no handle; the scrim does nothing and Escape still reports through `close`.",...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,..._.parameters?.docs?.source},description:{story:"The controlled sheet with `open` false renders nothing.",..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS
  },
  render: args => html\`
    <ds-button icon-only label="More actions" @press=\${openSheet}
      ><ds-icon slot="leading-icon" name="ellipsis"></ds-icon
    ></ds-button>
    <ds-action-sheet
      ?open=\${args.open}
      heading=\${ifDefined(args.heading)}
      .actions=\${args.actions}
      ?no-dismiss=\${args.dismissible === false}
      cancel-label=\${ifDefined(args.cancelLabel)}
      @action=\${closeSheet}
      @close=\${closeSheet}
    ></ds-action-sheet>
  \`
}`,...v.parameters?.docs?.source},description:{story:`Open with its "More actions" trigger, four focusable actions and the Cancel row, for the keyboard\r
gate. The trigger is the only one in the module: it gives the wide presentation a real anchor.`,...v.parameters?.docs?.description}}}})))()}b();export{_ as Closed,f as Default,g as DismissibleFalse,v as Keyboard,p as PhotoActions,m as UnnamedSheet,h as WithAnUnavailableAction,y as __namedExportsOrder,d as default};